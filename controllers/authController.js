const bcrypt = require('bcryptjs');
const User = require('../model/User');

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

module.exports = { register };
