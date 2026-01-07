import video from "../Modals/video.js";

export const uploadvideo = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Please upload a valid mp4 file" });
  }

  try {
    const file = new video({
      videotitle: req.body.videotitle,
      filename: req.file.filename,
      filepath: req.file.filename,
      filetype: req.file.mimetype,
      filesize: req.file.size,
      videochanel: req.body.videochanel,
      uploader: req.body.uploader,
      thumbnail: "video.png",
    });

    await file.save();

    res.status(201).json({ message: "Video uploaded successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getallvideo = async (req, res) => {
  try {
    const files = await video.find();

    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
