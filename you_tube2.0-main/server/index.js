import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import userroutes from "./routes/auth.js";
import videoroutes from "./routes/video.js";
import likeroutes from "./routes/like.js";
import watchlaterroutes from "./routes/watchlater.js";
import historyrroutes from "./routes/history.js";
import commentroutes from "./routes/comment.js";
import path from "path";

dotenv.config();

const app = express();
app.get("/healthz", (req, res) => {
  res.status(200).send("OK");
});


app.use(cors());
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(bodyParser.json());

app.use(
  "/uploads",
  express.static(path.resolve("uploads"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".mp4")) {
        res.setHeader("Content-Type", "video/mp4");
        res.setHeader("Accept-Ranges", "bytes");
      }
    },
  })
);

app.get("/", (req, res) => {
  res.send("You tube backend is working");
});

app.use("/user", userroutes);
app.use("/video", videoroutes);
app.use("/like", likeroutes);
app.use("/watch", watchlaterroutes);
app.use("/history", historyrroutes);
app.use("/comment", commentroutes);

const PORT = process.env.PORT || 5000;
const DBURL = process.env.DB_URL;

mongoose
  .connect(DBURL)
  .then(() => {
    console.log("Mongodb connected");
    console.log("Connected DB name:", mongoose.connection.name);

    app.listen(PORT, () => {
      console.log(`server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
