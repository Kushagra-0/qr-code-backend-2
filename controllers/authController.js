const User = require('../models/User');
const OTP = require('../models/Otp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

const generateOtp = () => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};

const sendOtp = async (userId, email) => {
  const otp = generateOtp();
  const otpExpiresAt = Date.now() + 10 * 60 * 1000;

  const otpEntry = new OTP({
    user: userId,
    otp,
    expiresAt: otpExpiresAt,
    type: 'email_verification',
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
  const { userId, otp } = req.body;

  if(!userId || !otp) {
    return res.status(400).json({ message: 'User ID and OTP are required.' });
  }

  const otpEntry = await OTP.findOne({
    user: userId,
    otp,
    type: 'email_verification',
  });

  if (!otpEntry) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  if (otpEntry.expiresAt < Date.now()) {
    return res.status(400).json({ message: 'OTP has expired' });
  }

  await User.findByIdAndUpdate(userId, { isVerified: true });

  await OTP.deleteMany({ user: userId, type: 'email_verification' });

  res.status(200).json({ message: 'OTP verified successfully' });
};

const requestForgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
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

    res.status(200).json({ 
      message: 'OTP sent for password reset', 
      user: {
        _id: user._id,
        email: email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const verifyForgotPasswordOtp = async (req, res) => {
  const { userId, otp } = req.body;

  const otpEntry = await OTP.findOne({
    user: userId,
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
    { userId: userId, type: 'password_reset' },
    process.env.JWT_SECRET,
    { expiresIn: '10m' }
  );

  await OTP.deleteOne({ _id: otpEntry._id });

  res.status(200).json({ message: 'OTP verified, you may now reset your password', resetToken });
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

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        _id: newUser._id,
        email: newUser.email,
        role: newUser.role,
      },
    });
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

    if (!user.isVerified) {
      return res.status(403).json({ message: "Email not verified. Please verify your email before logging in." });
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

const resendEmailVerificationOtp = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    // Delete any existing OTPs of this type
    await OTP.deleteMany({ user: userId, type: 'email_verification' });

    // Reuse your existing sendOtp function
    await sendOtp(userId, user.email);

    res.status(200).json({ message: 'OTP resent successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  requestForgotPassword,
  verifyEmailVerificationOtp,
  verifyForgotPasswordOtp,
  resetPassword,
  resendEmailVerificationOtp,
};