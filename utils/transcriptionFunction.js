const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genai.getGenerativeModel({ model: "gemini-2.0-flash" });
const Ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");
const formData = require("form-data");

async function getGeminiResponse(promt) {
  try {
    const response = await model.generateContent(promt);
    return response.response.text();
  } catch (error) {
    throw error;
  }
}

function tracriptionFunction(audioPath, outputPath, userDir, req) {
  Ffmpeg(audioPath)
    .output(outputPath)
    .audioFrequency(16000)
    .on("end", async function () {
      try {
        const audiFile = fs.createReadStream(outputPath);
        const formData = new FormData();
        formData.append("file", audiFile);
        axios
          .post(`${process.env.FLASK_URI}/transcribe`, formData, {
            headers: formData.getHeaders(),
          })
          .then(async function (response) {
            const transcriptionPath = path.join(
              userDir,
              `${path.parse(req.file.originalname).name}_${
                req.body.language
              }.txt`
            );
            fs.writeFileSync(transcriptionPath, response.data.transcription);
            const translatedAndRefinedData = await getGeminiResponse(
              `Translate "${response.data.transcription} to ${req.body.language} and also refine the content quality and reply in a simple and understandable manner"`
            );
            fs.appendFileSync(
              transcriptionPath,
              `\n\nSummary:\n${translatedAndRefinedData}`
            );
            res.status(200).json({
              message: "Transcibed sucessfully",
              transcription: translatedAndRefinedData,
            });
          })
          .catch(function (error) {
            console.error("Error:", error);
            res.status(500).json({ message: "Transcription service error" });
          });
      } catch (error) {
        console.error("Transcription failed:", error);
        res.status(500).json({ message: "Transcription failed" });
      }
    })
    .on("error", function (err) {
      console.error("FFmpeg Error:", err);
      res.status(500).json({ message: "Audio processing failed" });
    })
    .run();
}

module.exports = tracriptionFunction;
