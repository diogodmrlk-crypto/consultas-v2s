import express from "express";
import multer from "multer";

const app = express();
const upload = multer();

app.use(express.json());

app.get("/api/status", (req, res) => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  res.json({
    webhook_configured: !!webhookUrl,
    environment: "vercel-serverless",
    node_version: process.version
  });
});

app.post("/api/log", async (req, res) => {
  console.log("📩 Vercel: Recebida requisição em /api/log");
  let webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (webhookUrl) webhookUrl = webhookUrl.trim().replace(/^["']|["']$/g, '');

  if (!webhookUrl) {
    return res.status(500).json({ error: "DISCORD_WEBHOOK_URL not set" });
  }

  if (!webhookUrl.startsWith("https://discord.com/api/webhooks/")) {
    return res.status(400).json({ 
      error: "Invalid Webhook URL", 
      details: "A URL deve começar com https://discord.com/api/webhooks/" 
    });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ 
        error: "Discord Error", 
        details: errorText,
        status: response.status 
      });
    }
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to send to Discord", details: error.message });
  }
});

app.post("/api/capture", upload.any(), async (req, res) => {
  console.log("📸 Vercel: Recebida requisição em /api/capture");
  let webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (webhookUrl) webhookUrl = webhookUrl.trim().replace(/^["']|["']$/g, '');

  if (!webhookUrl) {
    return res.status(500).json({ error: "DISCORD_WEBHOOK_URL not set" });
  }

  if (!webhookUrl.startsWith("https://discord.com/api/webhooks/")) {
    return res.status(400).json({ 
      error: "Invalid Webhook URL", 
      details: "A URL deve começar com https://discord.com/api/webhooks/" 
    });
  }

  try {
    const formData = new FormData();
    if (req.body.payload_json) {
      formData.append("payload_json", req.body.payload_json);
    }

    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file: any) => {
        const blob = new Blob([file.buffer], { type: file.mimetype });
        formData.append(file.fieldname, blob, file.originalname);
      });
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      body: formData,
    });
    res.json({ success: response.ok });
  } catch (error) {
    res.status(500).json({ error: "Failed to send capture" });
  }
});

export default app;
