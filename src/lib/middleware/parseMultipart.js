// src/lib/middleware/parseMultipart.js
import formidable from "formidable";

/**
 * parseMultipart(request)
 * - returns { fields, files }
 *
 * Note: This utility uses formidable to parse multipart/form-data requests.
 */
export async function parseMultipart(request) {
  // Next.js request is a Web/Fetch Request. formidable expects Node's req/res.
  // But formidable can parse a Readable stream. We use request.arrayBuffer().
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.startsWith("multipart/form-data")) {
    // Not multipart
    const json = await request.json().catch(() => ({}));
    return { fields: json || {}, files: {} };
  }

  // Read body as buffer and feed to formidable
  const buf = Buffer.from(await request.arrayBuffer());

  return await new Promise((resolve, reject) => {
    const form = formidable({
      multiples: false,
      keepExtensions: true,
      // uploadDir: os.tmpdir(), // formidable default is fine
    });

    // parse buffer by emulating a Node IncomingMessage
    const nodeReq = new (class extends require("stream").Readable {
      _read() {
        this.push(buf);
        this.push(null);
      }
    })();

    // attach headers expected by formidable
    nodeReq.headers = Object.fromEntries(request.headers.entries());
    nodeReq.url = request.url;

    form.parse(nodeReq, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}
