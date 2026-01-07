import comment from "../Modals/comment.js";
import mongoose from "mongoose";
import axios from "axios";

function validateComment(text) {
  const invalid = /[<>\\/{}[\]|~`]/;
  if (invalid.test(text)) return false;
  const allowed = /[\p{L}\p{N}\s.,!?:;'"\-()]/u;
  const specials = text.split("").filter(ch => !allowed.test(ch));
  if ((specials.length / Math.max(1, text.length)) > 0.4) return false;
  return true;
}

async function getCity(req) {
  try {
    const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.connection.remoteAddress;
    const r = await axios.get(`https://ipinfo.io/${ip}?token=${process.env.IPINFO_TOKEN}`);
    if (r.data && r.data.city) return r.data.city;
  } catch (e) {}
  return "";
}

export const postcomment = async (req, res) => {
  const commentdata = req.body;

  if (!validateComment(commentdata.commentbody || "")) {
    return res.status(400).json({ message: "invalid" });
  }

  // ⭐ FIX: Use GPS city if provided, fallback to IP city
  commentdata.usercity = commentdata.usercity || await getCity(req);

  commentdata.removed = false;
  if (!commentdata.translated) commentdata.translated = {};

  try {
    const post = new comment(commentdata);
    await post.save();
    return res.status(200).json(post);
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getallcomment = async (req, res) => {
  const { videoid } = req.params;
  try {
    const commentvideo = await comment.find({ videoid: videoid, removed: false });
    return res.status(200).json(commentvideo);
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const deletecomment = async (req, res) => {
  const { id: _id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unavailable");
  }
  try {
    await comment.findByIdAndDelete(_id);
    return res.status(200).json({ comment: true });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const editcomment = async (req, res) => {
  const { id: _id } = req.params;
  const { commentbody } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unavailable");
  }

  try {
    const updatecomment = await comment.findByIdAndUpdate(
      _id,
      { $set: { commentbody: commentbody } },
      { new: true }
    );
    return res.status(200).json(updatecomment);
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const togglelike = async (req, res) => {
  const { id } = req.params;
  const { userid } = req.body;

  try {
    const c = await comment.findById(id);
    if (!c) return res.status(404).json({ message: "not found" });

    c.dislikes = (c.dislikes || []).filter(x => x.toString() !== userid.toString());

    if ((c.likes || []).map(String).includes(String(userid))) {
      c.likes = (c.likes || []).filter(x => x.toString() !== userid.toString());
    } else {
      c.likes = [...(c.likes || []), userid];
    }

    await c.save();
    return res.status(200).json(c);
  } catch (e) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const toggledislike = async (req, res) => {
  const { id } = req.params;
  const { userid } = req.body;

  try {
    const c = await comment.findById(id);
    if (!c) return res.status(404).json({ message: "not found" });

    c.likes = (c.likes || []).filter(x => x.toString() !== userid.toString());

    if ((c.dislikes || []).map(String).includes(String(userid))) {
      c.dislikes = (c.dislikes || []).filter(x => x.toString() !== userid.toString());
    } else {
      c.dislikes = [...(c.dislikes || []), userid];
    }

    if ((c.dislikes || []).length >= 2) c.removed = true;

    await c.save();
    return res.status(200).json(c);
  } catch (e) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const translatecomment = async (req, res) => {
  const { id } = req.params;
  const { to } = req.query;
  const target = to || "en";

  try {
    const c = await comment.findById(id);
    if (!c) return res.status(404).json({ message: "not found" });

    if (c.translated && c.translated[target]) {
      return res.status(200).json({ translatedText: c.translated[target] });
    }

    const detect = await axios.post(
      "https://libretranslate.de/detect",
      { q: c.commentbody },
      { headers: { "Content-Type": "application/json" } }
    );

    const source = detect.data?.[0]?.language || "hi";

    const r = await axios.get(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        c.commentbody
      )}&langpair=${source}|${target}`
    );

    const text =
      r.data?.responseData?.translatedText ||
      r.data?.translatedText ||
      "";

    if (!text) {
      return res.status(500).json({ message: "Empty translation response" });
    }

    if (!c.translated) c.translated = {};
    c.translated[target] = text;
    await c.save();

    return res.status(200).json({ translatedText: text });
  } catch (e) {
    return res.status(500).json({ message: "Translation failed" });
  }
};
