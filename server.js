import express from "express";
import multer from "multer";
import axios from "axios";
import fs from "fs";
import FormData from "form-data";

const app = express();
const upload = multer({ dest: "/tmp" });

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;

    const form = new FormData();
    form.append("chat_id", CHAT_ID);
    form.append("photo", fs.createReadStream(filePath));

    await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,
      form,
      { headers: form.getHeaders() }
    );

    fs.unlinkSync(filePath);
    res.status(200).send("OK");
  } catch (err) {
    console.error(err);
    res.status(500).send("FAILED");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on ${PORT}`));
