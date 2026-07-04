import { createServer } from "http";
import server from "./dist/server/server.js";
import fs from "fs";
import path from "path";

const PORT = process.env.PORT || 3000;

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const filePath = path.join(process.cwd(), "dist/client", url.pathname);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      const mime =
        ext === ".js"
          ? "application/javascript"
          : ext === ".css"
            ? "text/css"
            : "text/plain";
      res.setHeader("Content-Type", mime);
      res.end(fs.readFileSync(filePath));
      return;
    }

    const request = new Request(url, {
      method: req.method,
      headers: req.headers,
      body: req.method !== "GET" && req.method !== "HEAD" ? req : undefined,
    });

    const response = await server.fetch(request);

    res.statusCode = response.status;
    response.headers.forEach((value, key) => res.setHeader(key, value));

    if (response.body) {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }
    res.end();
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
}).listen(PORT, "0.0.0.0", () => {
  console.log(`Listening on http://0.0.0.0:${PORT}`);
});
