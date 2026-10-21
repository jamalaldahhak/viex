export function notFoundHandler(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.status = 404;

  next(error);
}

// Error-handling middleware must have four parameters: err, req, res, next.
export const errorHandler = (err, req, res, next) => {
  // Delegate if a response has already started; Express can handle the rest.
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Internal Server Error";

  // Handle common Mongoose errors with clearer HTTP status codes.
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  } else if (err.name === "ValidationError") {
    statusCode = 400;
    message = err.message;
  } else if (err.code === 11000) {
    statusCode = 409;
    message = "A record with this value already exists";
  } else if (statusCode >= 500) {
    // Avoid exposing internal server details in production.
    message =
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message || "Internal Server Error";
  }
  res.status(statusCode).json({
    success: false,
    message,
  });
};
