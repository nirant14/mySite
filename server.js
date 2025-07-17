// Reset password endpoint (for forgot password)
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mySite', { useNewUrlParser: true, useUnifiedTopology: true });

// User schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  isAdmin: { type: Boolean, default: false }
});
const User = mongoose.model('login', userSchema);

// Register endpoint
app.post('/api/register', async (req, res) => {
  const { username, password, isAdmin } = req.body;
  const existing = await User.findOne({ username });
  if (existing) {
    return res.status(409).json({ error: 'Username already exists' });
  }
  const hash = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hash, isAdmin: !!isAdmin });
  await user.save();
  res.status(201).json({ message: 'Created' });
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ userId: user._id }, 'SECRET_KEY');
    res.json({ token, isAdmin: user.isAdmin });
  } else {
    res.sendStatus(401);
  }
});

// Token validation endpoint
app.post('/api/validate', (req, res) => {
  const token = req.body.token;
  if (!token) return res.sendStatus(401);
  jwt.verify(token, 'SECRET_KEY', (err, decoded) => {
    if (err) return res.sendStatus(401);
    res.json({ valid: true, userId: decoded.userId });
  });
});

// Get all users
app.get('/api/users', async (req, res) => {
  const users = await User.find({}, { username: 1, isAdmin: 1, _id: 0 });
  res.json(users);
});

// Delete a user
app.delete('/api/users/:username', async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  if (user && user.isAdmin) {
    return res.status(403).json({ error: 'Admin user cannot be deleted' });
  }
  const result = await User.deleteOne({ username: req.params.username });
  if (result.deletedCount === 1) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Change password endpoint
app.post('/api/change-password', async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;
  if (!username || !oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const match = await bcrypt.compare(oldPassword, user.password);
  if (!match) {
    return res.status(401).json({ error: 'Old password is incorrect' });
  }
  const hash = await bcrypt.hash(newPassword, 10);
  user.password = hash;
  await user.save();
  res.json({ success: true });
});

// Reset password endpoint (for forgot password)
app.post('/api/reset-password', async (req, res) => {
  console.log('RESET PASSWORD endpoint called', req.body);
  const { username, newPassword } = req.body;
  if (!username || !newPassword) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const hash = await bcrypt.hash(newPassword, 10);
  user.password = hash;
  await user.save();
  res.json({ success: true });
});

app.listen(3000, () => console.log('Server running on port 3000'));
