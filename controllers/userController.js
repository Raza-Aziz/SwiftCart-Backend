import asyncHandler from "../middleware/asyncHandler.js";
import User from "../model/userModel.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/createToken.js";

const createUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    throw new Error("Please fill all the fields");
  }

  const userExists = await User.findOne({ email });
  if (userExists) res.status(400).send("User already exists");

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({ username, email, password: hashedPassword });

  try {
    // .save() saves in mongoDB database
    await newUser.save();
    generateToken(res, newUser._id);

    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      password: newUser.password,
      isAdmin: newUser.isAdmin,
    });
  } catch (error) {
    res.status(400);
    throw new Error("Please enter valid credentials");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  // extract the credentials
  const { email, password } = req.body;

  // find if user exists in DB
  const existingUser = await User.findOne({ email });

  // if user exists
  if (existingUser) {
    // check if password is valid by comparing the new password (and calculate its hash (automatically))
    // with the existing user's hashed password
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password,
    );

    // if password is indeed valid
    if (isPasswordValid) {
      // generate an http cookie
      generateToken(res, existingUser._id);

      res.status(201).json({
        _id: existingUser._id,
        username: existingUser.username,
        email: existingUser.email,
        password: existingUser.password,
      });
    }
  }

  return; // to exit the function
});

const logoutCurrentUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "User logged out successfully" });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  // res.status(201)
  res.json(users);
});

export { createUser, loginUser, logoutCurrentUser, getAllUsers };
