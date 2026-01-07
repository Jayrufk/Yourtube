import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    videotitle: { type: String, required: true },

    filename: { type: String, required: true },
    filepath: { type: String, required: true },
    filetype: { type: String, required: true },
    filesize: { type: Number, required: true },

    videochanel: { type: String, required: true },
    uploader: { type: String },

    Like: { type: Number, default: 0 },
    views: { type: Number, default: 0 },

    // ⭐ Added thumbnail support
    thumbnail: {
      type: String,
      default: "uploads/video.png",
    },
  },
  { timestamps: true }
);

export default mongoose.model("videofiles", videoSchema);
