import express from "express";
import { deletecomment, getallcomment, postcomment, editcomment, togglelike, toggledislike, translatecomment } from "../controllers/comment.js";

const routes = express.Router();
routes.get("/:videoid", getallcomment);
routes.post("/postcomment", postcomment);
routes.delete("/deletecomment/:id", deletecomment);
routes.post("/editcomment/:id", editcomment);
routes.post("/like/:id", togglelike);
routes.post("/dislike/:id", toggledislike);
routes.get("/translate/:id", translatecomment);

export default routes;
