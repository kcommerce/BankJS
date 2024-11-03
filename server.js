const express = require('express');
const session = require('express-session');

const app = express();
const PORT = 3000;

// In-memory "database"
const users = {
  user1: { password: 'password1', balance: 100 },
  user2: { password: 'password2', balance: 200 },
};

// Middleware for parsing JSON bodies
app.use(express.json());

// Session setup
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
}));

// Authentication middleware
const authenticate = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users[username];

  if (user && user.password === password) {
    req.session.user = username;
    res.json({ message: 'Login successful' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Logout route
app.post('/logout', authenticate, (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.json({ message: 'Logout successful' });
  });
});

// Deposit route
app.post('/deposit', authenticate, (req, res) => {
  const { amount } = req.body;
  const username = req.session.user;

  if (amount <= 0) {
    return res.status(400).json({ error: 'Amount must be positive' });
  }

  users[username].balance += amount;
  res.json({ message: 'Deposit successful', balance: users[username].balance });
});

// Withdraw route
app.post('/withdraw', authenticate, (req, res) => {
  const { amount } = req.body;
  const username = req.session.user;

  if (amount <= 0) {
    return res.status(400).json({ error: 'Amount must be positive' });
  }

  if (users[username].balance < amount) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }

  users[username].balance -= amount;
  res.json({ message: 'Withdrawal successful', balance: users[username].balance });
});

// Route to check balance
app.get('/balance', authenticate, (req, res) => {
  const username = req.session.user;
  res.json({ balance: users[username].balance });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
