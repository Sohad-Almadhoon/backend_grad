import bcrypt from "bcrypt";
import prisma from "../utils/db.js";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
const register = async (req, res) => {
  const { email, password, username, whatsapp, isSeller } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        whatsapp,
        isSeller,
        email,
        password: hashedPassword,
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json(req.body);
  }
};
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Wrong Password" });
    }
    const token = jwt.sign(
      { id: user.id, isSeller: user.isSeller },
      process.env.JWT_SECRET
    );
    return res.status(200).json({
      token,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error logging in" });
  }
};

const forgetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
    await prisma.user.update({
      where: { email },
      data: { resetPasswordToken: hashedOtp, resetPasswordExpiry: expiry },
    });
    await sendEmail(
      email,
      "Password Reset OTP",
      `Your OTP for resetting your password is: ${otp}. It will expire in 15 minutes.`
    );

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const resetPassword = async (req, res) => {
  const { newPassword, otp, email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "Invalid email or OTP" }); // Check if OTP has expired

    if (new Date() > user.resetPasswordExpiry) {
      return res.status(400).json({ message: "OTP has expired" });
    }
    // Verify the OTP
    const isOtpValid = await bcrypt.compare(otp, user.resetPasswordToken);
    if (!isOtpValid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpiry: null,
      },
    });

    res.status(200).json({ message: "Password successfully reset" });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export { register, login, forgetPassword, resetPassword };
