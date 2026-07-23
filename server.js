const http = require("node:http");
const path = require("node:path");
const {
  readFile,
  stat,
  writeFile,
} = require("node:fs/promises");

const HOST = "localhost";
const PORT = Number(process.env.PORT) || 5500;
const ROOT_DIRECTORY = __dirname;
const MAX_REQUEST_SIZE = 1024 * 1024;

const CONTENT_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

let postWriteQueue = Promise.resolve();

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });

  response.end(JSON.stringify(data));
}

async function readJsonBody(request) {
  let body = "";

  for await (const chunk of request) {
    body += chunk;

    if (Buffer.byteLength(body) > MAX_REQUEST_SIZE) {
      throw createHttpError(
        413,
        "Dữ liệu bài đăng vượt quá giới hạn.",
      );
    }
  }

  try {
    return JSON.parse(body);
  } catch {
    throw createHttpError(
      400,
      "Dữ liệu gửi lên không phải JSON hợp lệ.",
    );
  }
}

function validatePost(post) {
  if (!post || typeof post !== "object") {
    throw createHttpError(
      400,
      "Thiếu dữ liệu bài đăng.",
    );
  }

  if (post.type !== "lost" && post.type !== "found") {
    throw createHttpError(
      400,
      "Loại bài đăng không hợp lệ.",
    );
  }

  const requiredFields = [
    "id",
    "title",
    "category",
    "content",
    "location",
    "contact",
    "createTime",
  ];

  const missingField = requiredFields.find(
    (fieldName) =>
      typeof post[fieldName] !== "string" ||
      !post[fieldName].trim(),
  );

  if (missingField) {
    throw createHttpError(
      400,
      `Trường ${missingField} không hợp lệ.`,
    );
  }

  if (
    !post.creator ||
    typeof post.creator !== "object" ||
    typeof post.creator.name !== "string" ||
    !post.creator.name.trim()
  ) {
    throw createHttpError(
      400,
      "Thông tin người đăng không hợp lệ.",
    );
  }
}

async function writePostToJson(post) {
  validatePost(post);

  const fileName =
    post.type === "found"
      ? "found-data.json"
      : "lost-data.json";

  const filePath = path.join(
    ROOT_DIRECTORY,
    "assets",
    "data",
    fileName,
  );

  const source = await readFile(filePath, "utf8");
  const posts = JSON.parse(source);

  if (!Array.isArray(posts)) {
    throw createHttpError(
      500,
      `${fileName} không chứa một mảng JSON.`,
    );
  }

  const duplicatePost = posts.some(
    (currentPost) =>
      String(currentPost.id) === String(post.id),
  );

  if (duplicatePost) {
    throw createHttpError(
      409,
      "Bài đăng đã tồn tại.",
    );
  }

  posts.unshift(post);

  await writeFile(
    filePath,
    `${JSON.stringify(posts, null, 2)}\n`,
    "utf8",
  );

  return {
    fileName,
    post,
  };
}

function enqueuePostWrite(post) {
  const operation = postWriteQueue.then(
    () => writePostToJson(post),
  );

  postWriteQueue = operation.catch(() => {});

  return operation;
}

async function handleCreatePost(request, response) {
  try {
    const post = await readJsonBody(request);
    const result = await enqueuePostWrite(post);

    console.log(
      `Đã lưu ${result.post.id} vào assets/data/${result.fileName}.`,
    );

    sendJson(response, 201, result);
  } catch (error) {
    console.error("Không lưu được bài đăng.", error);

    sendJson(
      response,
      error.statusCode || 500,
      {
        message:
          error.statusCode
            ? error.message
            : "Không lưu được bài đăng.",
      },
    );
  }
}

function resolveStaticFile(pathname) {
  const requestedPath =
    pathname === "/"
      ? "index.html"
      : pathname.replace(/^\/+/, "");

  const filePath = path.resolve(
    ROOT_DIRECTORY,
    decodeURIComponent(requestedPath),
  );

  const isInsideProject =
    filePath === ROOT_DIRECTORY ||
    filePath.startsWith(
      `${ROOT_DIRECTORY}${path.sep}`,
    );

  return isInsideProject ? filePath : null;
}

async function serveStaticFile(request, response, pathname) {
  const filePath = resolveStaticFile(pathname);

  if (!filePath) {
    sendJson(response, 403, {
      message: "Đường dẫn không hợp lệ.",
    });
    return;
  }

  try {
    const fileStats = await stat(filePath);

    if (!fileStats.isFile()) {
      throw createHttpError(
        404,
        "Không tìm thấy tài nguyên.",
      );
    }

    const extension =
      path.extname(filePath).toLowerCase();

    const content = await readFile(filePath);
    const cacheDisabled = [
      ".html",
      ".js",
      ".json",
    ].includes(extension);

    response.writeHead(200, {
      "Content-Type":
        CONTENT_TYPES[extension] ||
        "application/octet-stream",
      "Cache-Control":
        cacheDisabled
          ? "no-store"
          : "no-cache",
    });

    response.end(
      request.method === "HEAD"
        ? undefined
        : content,
    );
  } catch (error) {
    sendJson(
      response,
      error.statusCode || 404,
      {
        message: "Không tìm thấy tài nguyên.",
      },
    );
  }
}

const server = http.createServer(
  async (request, response) => {
    const requestUrl = new URL(
      request.url,
      `http://${request.headers.host || HOST}`,
    );

    if (
      request.method === "POST" &&
      requestUrl.pathname === "/api/posts"
    ) {
      await handleCreatePost(request, response);
      return;
    }

    if (requestUrl.pathname.startsWith("/api/")) {
      sendJson(response, 404, {
        message: "Không tìm thấy API.",
      });
      return;
    }

    if (
      request.method !== "GET" &&
      request.method !== "HEAD"
    ) {
      sendJson(response, 405, {
        message: "Phương thức không được hỗ trợ.",
      });
      return;
    }

    await serveStaticFile(
      request,
      response,
      requestUrl.pathname,
    );
  },
);

server.listen(PORT, HOST, () => {
  console.log(
    `Ứng dụng đang chạy tại http://${HOST}:${PORT}`,
  );
});
