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
      "SELECT review.*, user.email,ur.liked,ur.disliked FROM review JOIN user ON review.idPublisher = user.id LEFT JOIN user_review ur ON ur.idReview = review.id AND ur.idUser = ? WHERE review.idSubject = ?",
      [idUser, subjectId]
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
      "INSERT INTO review(idPublisher, content, postDate, idSubject, likes_count, dislikes_count) values(?, ?, NOW(), ?, 0, 0)",
      [idPublisher, content, idSubject]
    );
    return res.status(200).json({ message: "message" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "error in database" });
  }
});

// Endpoint para manejar los likes y dislikes de las reseñas
router.post("/handleLikes/review", async (req, res) => {
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

export default router;
