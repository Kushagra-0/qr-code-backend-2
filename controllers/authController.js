const User = require('../models/User');
const OTP = require('../models/Otp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOtp = async (userId, email) => {
  const otp = generateOtp();
  const otpExpiresAt = Date.now() + 10 * 60 * 1000;

  const otpEntry = new OTP({
    user: userId,
    otp,
    expiresAt: otpExpiresAt,
  });

  await otpEntry.save();

  await sendEmail(
    email,
    'Your OTP Code',
    `Your verification OTP is: ${otp}`
  );

  return otp;
};

const verifyEmailVerificationOtp = async (req, res) => {
  const { email, otp } = req.body;

  // Find the user by email
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  // Find the OTP entry linked to this user
  const otpEntry = await OTP.findOne({
    user: user._id,
    otp,
    type: 'email_verification',
  });

  if (!otpEntry) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  // Check if OTP has expired
  if (otpEntry.expiresAt < Date.now()) {
    return res.status(400).json({ message: 'OTP has expired' });
  }

  // Mark the user as verified (if needed)
  user.isVerified = true;
  await user.save();

  // Delete the OTP from the database (optional)
  await OTP.deleteOne({ _id: otpEntry._id });

  res.status(200).json({ message: 'OTP verified successfully' });
};

const requestForgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  const otp = generateOtp();
  const otpExpiresAt = Date.now() + 10 * 60 * 1000;

  await OTP.create({
    user: user._id,
    otp,
    type: 'forgot_password',
    expiresAt: otpExpiresAt,
  });

  await sendEmail(
    email,
    'Reset Password OTP',
    `Your OTP for resetting your password is: ${otp}`
  );

  res.status(200).json({ message: 'OTP sent for password reset' });
};

const verifyForgotPasswordOtp = async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  const otpEntry = await OTP.findOne({
    user: user._id,
    otp,
    type: 'forgot_password',
  });

  if (!otpEntry) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  if (otpEntry.expiresAt < Date.now()) {
    return res.status(400).json({ message: 'OTP has expired' });
  }

  const resetToken = jwt.sign(
    { userId: user._id, type: 'password_reset' },
    process.env.JWT_SECRET,
    { expiresIn: '10m' }
  );

  await OTP.deleteOne({ _id: otpEntry._id });

  res.status(200).json({ message: 'OTP verified, you may now reset your password' });
};

const resetPassword = async (req, res) => {
  const { newPassword } = req.body;
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token missing' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== 'password_reset') {
      return res.status(403).json({ message: 'Invalid token type' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(400).json({ message: 'User not found' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });

  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    const otp = await sendOtp(newUser._id, email);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.log(err)
    res.status(400).json({ message: 'Some error occured' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET
    )

    res.status(200).json({
      message: 'Login Successful',
      token,
      user: { email: user.email, role: user.role }
    })
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Some error occured" });
  }
}

module.exports = { 
  register, 
  login, 
  requestForgotPassword, 
  verifyEmailVerificationOtp, 
  verifyForgotPasswordOtp,
  resetPassword,
};