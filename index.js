const express = require('express');
const app = express();
const port = 3010;
require('dotenv').config();
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');
const cors = require('cors');

app.use(express.json());
app.use(cors());

connectDB();

app.get('/', (req, res) => {
  res.status(201).json({ msg: 'Server is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
