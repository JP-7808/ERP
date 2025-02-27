import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  // Try to get the token from the Authorization header
  let token = req.headers.authorization?.split(" ")[1];

  // If no token in the header, try to get it from cookies
  if (!token && req.cookies.access_token) {
    token = req.cookies.access_token;
  }

  if (!token) {
    return res.status(401).json({ message: "Unauthorized - No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid token" });
  }
};

export default authMiddleware;
