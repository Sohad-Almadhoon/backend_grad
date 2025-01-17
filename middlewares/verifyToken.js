import jwt from "jsonwebtoken";
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; 

  if (!token) {
    return res.status(401).json({ error: "No token provided." });
  }
  jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
    if (err) return next(createError(403, "Token is not valid!"));
    req.userId = payload.id;
    req.isSeller = payload.isSeller;
  });

  next();
};

export default verifyToken;
