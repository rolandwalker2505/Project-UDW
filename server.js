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

async function updatePostInJson(postId, changes, studentId) {
  if (!studentId) {
    throw createHttpError(401, "Bạn cần đăng nhập để sửa bài đăng.");
  }

  const dataDirectory = path.join(
    ROOT_DIRECTORY,
    "assets",
    "data",
  );
  const fileNames = ["lost-data.json", "found-data.json"];
  const files = await Promise.all(
    fileNames.map(async (fileName) => {
      const filePath = path.join(dataDirectory, fileName);
      const posts = JSON.parse(await readFile(filePath, "utf8"));

      if (!Array.isArray(posts)) {
        throw createHttpError(
          500,
          `${fileName} không chứa một mảng JSON.`,
        );
      }

      return { fileName, filePath, posts };
    }),
  );
  const sourceFile = files.find(({ posts }) =>
    posts.some((post) => String(post.id) === String(postId)),
  );

  if (!sourceFile) {
    throw createHttpError(404, "Không tìm thấy bài đăng.");
  }

  const postIndex = sourceFile.posts.findIndex(
    (post) => String(post.id) === String(postId),
  );
  const existingPost = sourceFile.posts[postIndex];
  const ownerStudentId =
    existingPost.creator &&
    typeof existingPost.creator === "object"
      ? String(existingPost.creator.studentId || "")
      : "";

  if (ownerStudentId !== String(studentId)) {
    throw createHttpError(
      403,
      "Bạn chỉ có thể sửa bài đăng của chính mình.",
    );
  }

  const editableFields = [
    "type",
    "title",
    "category",
    "content",
    "location",
    "contact",
    "image",
  ];
  const safeChanges = Object.fromEntries(
    editableFields
      .filter((fieldName) =>
        Object.hasOwn(changes, fieldName),
      )
      .map((fieldName) => [
        fieldName,
        changes[fieldName],
      ]),
  );
  const updatedPost = {
    ...existingPost,
    ...safeChanges,
    id: existingPost.id,
    creator: {
      ...existingPost.creator,
      name:
        typeof changes.creator?.name === "string"
          ? changes.creator.name
          : existingPost.creator.name,
      studentId: ownerStudentId,
    },
    createTime: existingPost.createTime,
    marked: existingPost.marked,
  };

  validatePost(updatedPost);

  const targetFileName =
    updatedPost.type === "found"
      ? "found-data.json"
      : "lost-data.json";
  const targetFile = files.find(
    ({ fileName }) => fileName === targetFileName,
  );

  sourceFile.posts.splice(postIndex, 1);
  targetFile.posts.unshift(updatedPost);

  const filesToWrite = new Set([sourceFile, targetFile]);
  await Promise.all(
    [...filesToWrite].map(({ filePath, posts }) =>
      writeFile(
        filePath,
        `${JSON.stringify(posts, null, 2)}\n`,
        "utf8",
      ),
    ),
  );

  return { fileName: targetFileName, post: updatedPost };
}

function enqueuePostWrite(writeOperation) {
  const queuedOperation = postWriteQueue.then(
    writeOperation,
  );

  postWriteQueue = queuedOperation.catch(() => {});

  return queuedOperation;
}

async function handleCreatePost(request, response) {
  try {
    const post = await readJsonBody(request);
    const result = await enqueuePostWrite(
      () => writePostToJson(post),
    );

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

async function handleUpdatePost(
  request,
  response,
  postId,
) {
  try {
    const changes = await readJsonBody(request);
    const studentId = request.headers["x-student-id"];
    const result = await enqueuePostWrite(
      () => updatePostInJson(postId, changes, studentId),
    );

    sendJson(response, 200, result);
  } catch (error) {
    console.error("Không sửa được bài đăng.", error);
    sendJson(response, error.statusCode || 500, {
      message: error.statusCode
        ? error.message
        : "Không sửa được bài đăng.",
    });
  }
}

function resolveStaticFile(pathname) {
  const requestedPath =
    pathname === "/"
      ? "pages/introduction.html"
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

    const postMatch = requestUrl.pathname.match(
      /^\/api\/posts\/([^/]+)$/,
    );

    if (request.method === "PATCH" && postMatch) {
      await handleUpdatePost(
        request,
        response,
        decodeURIComponent(postMatch[1]),
      );
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
