const errorHandler = (err, req, res, next) => {
  const errorStatus = err.statusCode || 500;
  const errorMessage = err.message || "Something went wrong!";

  if (err.isOperational) {
    return res.status(errorStatus).json({
      success: false,
      error: {
        message: errorMessage,
      },
    });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    error: {
      message: "Internal Server Error",
    },
  });
};

export default errorHandler;
