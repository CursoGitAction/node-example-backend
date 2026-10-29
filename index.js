import { createServer } from "node:http";

const PORT = Number(process.env.PORT) || 3000;

function sendJson(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
  });
  res.end(JSON.stringify(body));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("El cuerpo debe ser JSON válido"));
      }
    });
    req.on("error", reject);
  });
}

const server = createServer(async (req, res) => {
  const { pathname } = new URL(req.url ?? "/", "http://localhost");

  if (pathname !== "/test") {
    sendJson(res, 404, { ok: false, message: "No encontrado" });
    return;
  }

  if (req.method === "GET") {
    sendJson(res, 200, {
      ok: true,
      method: "GET",
      message: "Endpoint de prueba",
    });
    return;
  }

  if (req.method === "POST") {
    try {
      const data = await readJsonBody(req);
      sendJson(res, 200, {
        ok: true,
        method: "POST",
        message: "Datos recibidos",
        data,
      });
    } catch (error) {
      sendJson(res, 400, { ok: false, message: error.message });
    }
    return;
  }

  sendJson(res, 405, { ok: false, message: "Método no permitido" });
});

server.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
