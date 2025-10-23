import express, { response } from "express";
import { openConnection, executeQuery, closeConnection} from "../db.js";
import { authMiddleware } from "../index.js";

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;

export async function fetchReviews(req, res, next) {
  const { subjectId } = req.params;
  const { idUser } = req.body;

  try {
    const result = await executeQuery(
      `SELECT
  r.*,
  ANY_VALUE(u.email) AS review_author_email,
  ANY_VALUE(ur.liked) AS review_liked,
  ANY_VALUE(ur.disliked) AS review_disliked,
  CASE 
    WHEN COUNT(c.id) > 0 THEN
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'id', c.id,
          'content', c.content,
          'postDate', c.postDate,
          'likesCount', c.likesCount,
          'dislikesCount', c.dislikesCount,
          'authorEmail', cu.email,
          'liked', uc.liked,
          'disliked', uc.disliked
        )
      )
    ELSE NULL
  END AS comments
FROM review r
JOIN user u
  ON r.idPublisher = u.id
LEFT JOIN user_review ur
  ON ur.idReview = r.id AND ur.idUser = ?
LEFT JOIN comment c
  ON c.idReview = r.id
LEFT JOIN user cu
  ON cu.id = c.idPublisher
LEFT JOIN user_comment uc
  ON uc.idComment = c.id AND uc.idUser = ?
WHERE r.idSubject = ?
GROUP BY r.id
ORDER BY r.postDate ASC;`,
      [idUser, idUser, subjectId]
    );

    if (result.length === 0) {
      return res.status(400).json({ message: "no reviews yet" });
    }
    req.reviews = result;
    return next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "error in database" });
  }
}

// Endpoint para buscar todas las reseñas de una materia por id
router.post("/getReviews/:subjectId", fetchReviews, async (req, res) => {
  return res.status(200).json(req.reviews);
});

// Endopoint para publicar
router.post("/postReview", authMiddleware, async (req, res) => {
  const { idPublisher, content, idSubject } = req.body;

  try {
    const result = await executeQuery(
      `INSERT INTO review(idPublisher, content, postDate, idSubject, likes_count, dislikes_count) values(?, ?, NOW(), ?, 0, 0);`,
      [idPublisher, content, idSubject]
    );
    return res.status(200).json({ message: "message" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "error in database" });
  }
});

// Endpoint para manejar los likes y dislikes de las reseñas
router.post("/handleLikes/review", authMiddleware, async (req, res) => {
  const { change } = req.body;
  const idUser = req.body.idUser;
  const idReview = req.body.idReview;
  let reviewUserField = "";

  if (!idUser || !idReview || !change) {
    return res
      .status(400)
      .json({ message: "Faltan datos en el body", body: req.body });
  }

  if (change === "likes_count") {
    reviewUserField = "liked";
  } else {
    reviewUserField = "disliked";
  }

  // Verificar que el usuario no haya reaccinado todavía a la reseña
  const query = await executeQuery(
    `SELECT ${reviewUserField} FROM user_review WHERE idUser = ? AND idReview = ?`,
    [idUser, idReview]
  );

  if (query.length === 0) {
    // No ha reaccionado
    try {
      // Actualizar el número de likes o dislikes de la reseña
      const result = await executeQuery(
        `UPDATE review SET ${change} = ${change}+1 WHERE id = ?`,
        [idReview]
      );

      // Crear un registro en la tabla user_review
      const update = await executeQuery(
        `INSERT INTO user_review(idUser, idReview, ${reviewUserField}) values(?, ?, 1)`,
        [idUser, idReview]
      );
      return res.status(200).json({ message: "message" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "error in database" });
    }
  } else {
    // Ya reaccionó
    try {
      const connection = await openConnection();
      if (reviewUserField === "liked") {
        if (query[0].liked === 1) {
          console.log("buenas");
          await connection.query("START TRANSACTION");

          await connection.query(
            `DELETE FROM user_review WHERE idUser = ? AND idReview = ?`,
            [idUser, idReview]
          );

          await connection.query(
            `UPDATE review SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = ?`,
            [idReview]
          );

          await connection.query("COMMIT");
        } else {
          await connection.query("START TRANSACTION");

          await connection.query(
            `UPDATE user_review SET liked = 1, disliked = 0 WHERE idUser = ? AND idReview = ?`,
            [idUser, idReview]
          );

          await connection.query(
            `UPDATE review SET likes_count = likes_count + 1, dislikes_count = GREATEST(dislikes_count - 1, 0) WHERE id = ?`,
            [idReview]
          );

          await connection.query("COMMIT");
        }
      } else {
        if (query[0].disliked === 1) {
          await connection.query("START TRANSACTION");

          await connection.query(
            `DELETE FROM user_review WHERE idUser = ? AND idReview = ?`,
            [idUser, idReview]
          );

          await connection.query(
            `UPDATE review SET dislikes_count = GREATEST(dislikes_count - 1, 0) WHERE id = ?`,
            [idReview]
          );

          await connection.query("COMMIT");
        } else {
          await connection.query("START TRANSACTION");

          await connection.query(
            `UPDATE user_review SET liked = 0, disliked = 1 WHERE idUser = ? AND idReview = ?`,
            [idUser, idReview]
          );

          await connection.query(
            `UPDATE review SET likes_count = GREATEST(likes_count - 1, 0), dislikes_count = dislikes_count + 1 WHERE id = ?`,
            [idReview]
          );

          await connection.query("COMMIT");
        }
      }
      await closeConnection(connection);
      return res.status(200).json({ message: "success" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "error in database" });
    }
  }
});

// Endpoint para subir un comentario de una reseña
router.post("/postComment", authMiddleware, async (req, res) => {
  const { idPublisher, content, idReview } = req.body;

  try {
    const result = await executeQuery(
      "`INSERT INTO comment(idPublisher, content, postDate, idReview, likesCount, dislikesCount) values(?, ?, NOW(), ?, 0, 0)",
      [idPublisher, content, idReview]
    );
    await executeQuery("UPDATE review SET comments_count = comments_count + 1 WHERE id = ?", [idReview]);
    return res.status(200).json({ message: "message" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "error in database" });
  }
});

export default router;

// Endpoint para manejar los likes y dislikes de los comentarios
router.post("/handleComment/review", authMiddleware, async (req, res) => {
  const { change } = req.body;
  const idUser = req.body.idUser;
  const idComment = req.body.idComment;
  let commentUserField = "";

  if (!idUser || !idComment || !change) {
    return res
      .status(400)
      .json({ message: "Faltan datos en el body", body: req.body });
  }

  if (change === "likesCount") {
    commentUserField = "liked";
  } else {
    commentUserField = "disliked";
  }

  // Verificar que el usuario no haya reaccinado todavía a la reseña
  const query = await executeQuery(
    `SELECT ${commentUserField} FROM user_comment WHERE idUser = ? AND idComment = ?`,
    [idUser, idComment]
  );

  if (query.length === 0) {
    // No ha reaccionado
    try {
      // Actualizar el número de likes o dislikes de la reseña
      const result = await executeQuery(
        `UPDATE comment SET ${change} = ${change}+1 WHERE id = ?`,
        [idComment]
      );

      // Crear un registro en la tabla user_review
      const update = await executeQuery(
        `INSERT INTO user_comment(idUser, idComment, ${commentUserField}) values(?, ?, 1)`,
        [idUser, idComment]
      );
      return res.status(200).json({ message: "message" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "error in database" });
    }
  } else {
    // Ya reaccionó
    try {
      const connection = await openConnection();
      if (commentUserField === "liked") {
        if (query[0].liked === 1) {
          await connection.query("START TRANSACTION");

          await connection.query(
            `DELETE FROM user_comment WHERE idUser = ? AND idComment = ?`,
            [idUser, idComment]
          );

          await connection.query(
            `UPDATE comment SET likesCount = GREATEST(likesCount - 1, 0) WHERE id = ?`,
            [idComment]
          );

          await connection.query("COMMIT");
        } else {
          await connection.query("START TRANSACTION");

          await connection.query(
            `UPDATE user_comment SET liked = 1, disliked = 0 WHERE idUser = ? AND idComment = ?`,
            [idUser, idComment]
          );

          await connection.query(
            `UPDATE comment SET likesCount = likesCount + 1, dislikesCount = GREATEST(dislikesCount - 1, 0) WHERE id = ?`,
            [idComment]
          );

          await connection.query("COMMIT");
        }
      } else {
        if (query[0].disliked === 1) {
          await connection.query("START TRANSACTION");

          await connection.query(
            `DELETE FROM user_comment WHERE idUser = ? AND idComment = ?`,
            [idUser, idComment]
          );

          await connection.query(
            `UPDATE comment SET dislikesCount = GREATEST(dislikesCount - 1, 0) WHERE id = ?`,
            [idComment]
          );

          await connection.query("COMMIT");
        } else {
          await connection.query("START TRANSACTION");

          await connection.query(
            `UPDATE user_comment SET liked = 0, disliked = 1 WHERE idUser = ? AND idComment = ?`,
            [idUser, idComment]
          );

          await connection.query(
            `UPDATE comment SET likesCount = GREATEST(likesCount - 1, 0), dislikesCount = dislikesCount + 1 WHERE id = ?`,
            [idComment]
          );

          await connection.query("COMMIT");
        }
      }
      await closeConnection(connection);
      return res.status(200).json({ message: "success" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "error in database" });
    }
  }
});