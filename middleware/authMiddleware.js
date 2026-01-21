import jwt from "jsonwebtoken";
import User from "../model/userModel.js";
import asyncHandler from "./asyncHandler.js";

const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  // first extract jwt token from request
  token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      // -password excluudes the password as .select() returns all the fields
      req.user = await User.findById(decoded.userId).select("-password");
      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized :: Token failed");
    }
  } else {
    res.status(401);
    throw new Error("Not authorized :: Token not found");
  }
});

const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error("User not authorized as admin");
  }
};

export { authenticate, authorizeAdmin };
