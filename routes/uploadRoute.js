const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const authenticate = require("../middleware/authMiddleware.js");
const tracriptionFunction = require("../utils/transcriptionFunction.js");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post(
  "/upload",
  authenticate,
  upload.single("audio"),
  async function (res, req) {
    if (!req.file) res.status(400).json({ message: "File not uploaded" });
    const userEmail = req.user.email; //may cause issues later so check here
    const userDir = path.join(
      "uploads",
      userEmail,
      `${path.parse(req.file.originalname).name}`
    );
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    const audioPath = req.file.path;
    const outputPath = path.join(
      userDir,
      `${path.parse(req.file.originalname).name}.wav`
    );
    tracriptionFunction(audioPath, outputPath, userDir, req);
  }
);

router.get("/uploads/:email", authenticate, async function (req, res) {
  const email = req.params.email;
  const userDir = path.join("uploads", email);
  if (!fs.existsSync(userDir))
    res.status(404).json({ message: "No files found for the user" });
  fs.readdir(userDir, function (err, subdirs) {
    if (err) res.status(500).json({ message: "Error reading directory" });
    const fileContents = [];
    subdirs.forEach(function (subdir) {
      const subdirPath = path.join(userDir, subdir);
      if (fs.lstatSync(subdirPath).isDirectory()) {
        const textFiles = fs
          .readdirSync(subdirPath)
          .filter((file) => file.endsWith(".txt"));
        textFiles.forEach(function (file) {
          fileContents.push({ fileName: path.join(subdir, file) });
        });
      }
    });
    res.json({ files: fileContents });
  });
});

router.get(
  "/download/:mail/:dir/:file",
  authenticate,
  async function (req, res) {
    const filePath = path.join(
      __dirname,
      "..",
      "uploads",
      req.params.mail,
      req.params.dir,
      req.params.file
    );
    if (fs.existsSync(filePath)) {
      res.download(filePath, req.params.file, (error) => {
        console.log("Error sending files");
        res.status(500).json({ message: "Error downloading files" });
      });
    } else {
      res.status(404).json({ message: "File not found" });
    }
  }
);

module.exports = router;
