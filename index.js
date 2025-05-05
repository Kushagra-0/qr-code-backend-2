const express = require('express');
const app = express();
const port = 3010;
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');

app.use(cors());
app.get('/', (req, res) => {
  res.status(201).json({ msg: 'Server is running' });
});

app.use('/api/auth', authRoutes);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
