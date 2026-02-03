import express from "express";
import multer from "multer";
import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import "dotenv/config";

const app = express();

// Multer configuration with logging in mind
const upload = multer({ dest: "/tmp" });

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

app.post("/upload", (req, res, next) => {
    // LOG 1: Incoming Request Headers
    console.log("\n--- [1] NEW INCOMING REQUEST ---");
    console.log("Time:", new Date().toLocaleTimeString());
    console.log("Content-Type:", req.headers["content-type"]);
    next();
}, upload.any(), async (req, res) => {
    try {
        // LOG 2: Body and Files received by Multer
        console.log("--- [2] PAYLOAD RECEIVED ---");
        console.log("Body Parameters:", req.body);
        
        if (!req.files || req.files.length === 0) {
            console.error("❌ ERROR: Multer did not find any files. Check MacroDroid 'Name' field.");
            return res.status(400).send("No file received");
        }

        const file = req.files[0];
        console.log("File detected:", {
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: `${(file.size / 1024).toFixed(2)} KB`,
            tempPath: file.path
        });

        // LOG 3: Preparing Telegram Request
        console.log("--- [3] SENDING TO TELEGRAM ---");
        const form = new FormData();
        form.append("chat_id", CHAT_ID);
        form.append("photo", fs.createReadStream(file.path));

        const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`;
        
        const response = await axios.post(telegramUrl, form, {
            headers: form.getHeaders(),
        });

        // LOG 4: Success
        console.log("✅ SUCCESS: Telegram accepted the photo.");
        console.log("Telegram Message ID:", response.data.result?.message_id);

        // Cleanup
        fs.unlinkSync(file.path);
        res.status(200).send("OK");

    } catch (err) {
        // LOG 5: Failure Details
        console.error("--- ❌ [ERROR] ---");
        if (err.response) {
            console.error("Telegram API Error:", err.response.data);
        } else {
            console.error("Server Error:", err.message);
        }
        
        // Cleanup temp file even on failure
        if (req.files?.[0]?.path) {
            fs.unlinkSync(req.files[0].path);
        }
        
        res.status(500).send("FAILED");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Debug Server running on port ${PORT}`);
    console.log(`Target Chat ID: ${CHAT_ID}`);
    if(!BOT_TOKEN) console.warn("⚠️ WARNING: BOT_TOKEN is missing!");
});