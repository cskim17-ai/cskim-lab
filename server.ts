import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import multer from "multer";
import fs from "fs";
import axios from "axios";
import * as cheerio from "cheerio";

// Configure multer for file uploads
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // API Route: Book Info Proxy (Kyobobook Kiosk)
  app.get("/api/book-info", async (req, res) => {
    // ... (existing code skipped for brevity in thought, but I'll provide full block here)
    const { barcode } = req.query;
    if (!barcode) return res.status(400).json({ error: "Barcode is required" });

    try {
      const url = `https://kiosk.kyobobook.co.kr/bookInfoInk?site=001&barcode=${barcode}&ejkGb=KOR`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      const html = response.data;
      const $ = cheerio.load(html);

      // Extract raw data from scripts (Next.js state)
      let jsonData: any = null;
      $('script').each((i, el) => {
        const text = $(el).text();
        if (text.includes('bookShelfData')) {
          try {
            const match = text.match(/8:\[.*?({.*}).*?\]/);
            if (match && match[1]) {
              const rawJson = match[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\');
              jsonData = JSON.parse(rawJson);
            }
          } catch (e) {
            console.error('JSON Parse error in script:', e);
          }
        }
      });

      if (!jsonData) {
        const title = $('.p_book_info h3').text().trim();
        const authorInfo = $('.p_book_info div').first().text().trim();
        const stockText = $('.p_stock').text().trim();
        const mapUrl = $('.mapPrintImg').attr('src');
        
        jsonData = {
          kbCommodityData: { data: { commodityInfo: { cmdtName: title } } },
          fallback: true,
          authorInfo,
          stockText,
          mapUrl
        };
      }

      res.json(jsonData);
    } catch (error) {
      console.error('Proxy error:', error);
      res.status(500).json({ error: "Failed to fetch book info" });
    }
  });

  // API Route: Image Proxy to bypass CORS for html2canvas
  app.get("/api/image-proxy", async (req, res) => {
    const { url } = req.query;
    if (!url || typeof url !== 'string') return res.status(400).send("URL is required");

    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const contentType = response.headers['content-type'] as string;
      if (contentType) {
        res.set('Content-Type', contentType);
      }
      res.send(response.data);
    } catch (error) {
      res.status(500).send("Failed to fetch image");
    }
  });

  // API Route: File Upload
  app.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    console.log(`File uploaded: ${req.file.path}`);
    res.json({ 
      message: "File uploaded successfully", 
      filename: req.file.filename,
      path: req.file.path 
    });
  });

  // API Route: Health Check
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
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
