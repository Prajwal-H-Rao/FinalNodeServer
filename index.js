const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRouter = require("./routes/authRoute.js");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("uploads"));
app.use("/auth", authRouter);

//default routes
app.get("/", function (req, res) {
  res.send("<h1>The server is live and accepting requests</h1>");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("connected to mongoDB");
    app.listen(port, () => {
      console.log(`The server is running at:${port}`);
    });
  })
  .catch((error) => console.error("MongoDB connection error:", error));
