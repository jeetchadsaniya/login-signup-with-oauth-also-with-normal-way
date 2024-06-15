const successResponse = (
  res,
  data,
  message,
  contentType = "application/json"
) => {
  if (Buffer.isBuffer(data)) {
    res.statusCode = 200;
    res.end(data);
    return;
  }
  res.writeHead(200, { "Content-Type": contentType });
  res.end(
    JSON.stringify({
      statusCode: 200,
      data: data,
      message: message,
    })
  );
};

const serverErrorResponse = (
  res,
  message,
  contentType = "application/json"
) => {
  res.writeHead(500, { "Content-Type": contentType });
  res.end(
    JSON.stringify({
      statusCode: 500,
      message: message,
    })
  );
};

const badRequestResponse = (res, message, contentType = "application/json") => {
  res.writeHead(400, { "Content-Type": contentType });
  res.end(
    JSON.stringify({
      statusCode: 400,
      message: message,
    })
  );
};

const notFoundResponse = (res, message, contentType = "application/json") => {
  res.writeHead(404, { "Content-Type": contentType });
  res.end(
    JSON.stringify({
      statusCode: 404,
      message: message,
    })
  );
};

module.exports = {
  successResponse,
  serverErrorResponse,
  badRequestResponse,
  notFoundResponse,
};
