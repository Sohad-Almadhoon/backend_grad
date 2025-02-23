import AppError from "../utils/AppError.js";

const checkSeller =
  (action) =>
  (req, res, next) => {
    if (!req.isSeller) {
      const errorMessage = `You are not allowed to ${action}!`;
      return next(new AppError(errorMessage, 403)); 
    }
    next();
  };

export default checkSeller;
