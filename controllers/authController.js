const bcrypt = require('bcryptjs');
const User = require('../model/User');
const jwt = require('jsonwebtoken');

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
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Some error occured' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });

    if(!user) {
      res.status(400).json({ message: "Invalid Credentials"});
    }

    const isMatch = await bcrypt.compare(password, user.password)
    
    if(!isMatch) {
      res.status(400).json({ message: "Invalid Credentials"});
    }

    const token = jwt.sign(
      { userId: user._id, role:user.role },
      process.env.JWT_SECRET
    )

    res.status(200).json({
      message: 'Login Successful',
      token,
      user: { email: user.email, role: user.role }
    })
  } catch(err) {
    res.status(400).json({ message: "Some error occured"});
  }
}

module.exports = { register, login };
