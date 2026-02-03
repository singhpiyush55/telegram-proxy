import express from "express";
import axios from "axios";
import FormData from "form-data";
import bodyParser from "body-parser";
import "dotenv/config";

const app = express();

// Use raw body parser to catch the image/jpeg stream
app.use(bodyParser.raw({ type: 'image/jpeg', limit: '10mb' }));

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

app.post("/upload", async (req, res) => {
    console.log("\n--- [1] NEW INCOMING REQUEST ---");
    console.log("Content-Type:", req.headers["content-type"]);

    try {
        if (!req.body || req.body.length === 0) {
            console.error("❌ ERROR: No binary data received in request body.");
            return res.status(400).send("No data received");
        }

        console.log(`--- [2] BINARY DATA RECEIVED: ${req.body.length} bytes ---`);

        // Prepare Telegram Form
        const form = new FormData();
        form.append("chat_id", CHAT_ID);
        // We pass the Buffer (req.body) directly to Telegram
        form.append("photo", req.body, { filename: "upload.jpg", contentType: "image/jpeg" });

        console.log("--- [3] SENDING TO TELEGRAM ---");
        const response = await axios.post(
            `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,
            form,
            { headers: form.getHeaders() }
        );

        console.log("✅ SUCCESS: Telegram sent the photo.");
        res.status(200).send("OK");

    } catch (err) {
        console.error("--- ❌ [ERROR] ---");
        console.error(err.response?.data || err.message);
        res.status(500).send("FAILED");
    }
});

app.listen(3000, () => console.log("🚀 Server ready for raw image uploads on port 3000"));