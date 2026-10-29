import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

const PORT = Number(process.env.PORT) || 3000;

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
  });
  res.end(JSON.stringify(body));
}

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    req.on("data", (chunk: Buffer) => chunks.push(chunk));
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
      const message = error instanceof Error ? error.message : "Error inesperado";
      sendJson(res, 400, { ok: false, message });
    }
    return;
  }

  sendJson(res, 405, { ok: false, message: "Método no permitido" });
});

server.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
