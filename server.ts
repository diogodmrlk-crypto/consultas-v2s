
import express from "express";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import path from "path";

const app = express();
const PORT = 3000;
const upload = multer();

// Middleware
app.use(express.json());

// API Routes
app.post("/api/log", async (req, res) => {
  console.log("📩 Recebida requisição em /api/log");
  let webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (webhookUrl) webhookUrl = webhookUrl.trim().replace(/^["']|["']$/g, '');
  
  if (!webhookUrl) {
    console.error("❌ ERRO: DISCORD_WEBHOOK_URL não encontrada no ambiente.");
    return res.status(500).json({ 
      error: "Configuração ausente", 
      details: "Defina DISCORD_WEBHOOK_URL nas variáveis de ambiente (Secrets) do painel." 
    });
  }

  if (!webhookUrl.startsWith("https://discord.com/api/webhooks/")) {
    console.error("❌ ERRO: URL da Webhook inválida.");
    return res.status(400).json({ 
      error: "URL Inválida", 
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
      console.error(`❌ Erro do Discord: ${response.status} - ${errorText}`);
      return res.status(response.status).json({ 
        error: "Erro na API do Discord", 
        details: errorText,
        status: response.status
      });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error("Log error:", error);
    res.status(500).json({ error: "Falha ao conectar com o Discord", details: error.message });
  }
});

app.post("/api/capture", upload.any(), async (req, res) => {
  console.log("📸 Recebida requisição em /api/capture");
  let webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (webhookUrl) webhookUrl = webhookUrl.trim().replace(/^["']|["']$/g, '');

  if (!webhookUrl) {
    console.error("❌ ERRO: DISCORD_WEBHOOK_URL não encontrada no ambiente.");
    return res.status(500).json({ 
      error: "Webhook não configurada",
      details: "Verifique se você adicionou DISCORD_WEBHOOK_URL nas variáveis de ambiente."
    });
  }

  try {
    const formData = new FormData();
    
    // Add payload_json if present
    if (req.body.payload_json) {
      formData.append("payload_json", req.body.payload_json);
    }

    // Add files
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

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Discord API error: ${response.statusText} - ${errorText}`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Capture error:", error);
    res.status(500).json({ error: "Failed to send capture" });
  }
});

app.get("/api/status", (req, res) => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  res.json({
    webhook_configured: !!webhookUrl,
    environment: process.env.NODE_ENV || "development",
    node_version: process.version
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  // Serve static files in production
  app.use(express.static(path.resolve("dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve("dist/index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
