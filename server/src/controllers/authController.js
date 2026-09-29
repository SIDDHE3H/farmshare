const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { queryRow, run } = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

exports.signup = async (req, res) => {
  try {
    const { name, email, phone, password, village, taluka, district, state } = req.body;

    if (!name || !email || !phone || !password || !village || !taluka || !district || !state) {
      return res.status(400).json({ message: 'All fields are required (name, email, phone, password, village, taluka, district, state).' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = queryRow('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = run(`
      INSERT INTO users (name, email, phone, password_hash, village, taluka, district, state)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [name.trim(), cleanEmail, phone.trim(), passwordHash, village.trim(), taluka.trim(), district.trim(), state.trim()]);

    const newUser = queryRow('SELECT id, name, email, phone, village, taluka, district, state, created_at FROM users WHERE id = ?', [result.lastInsertRowid]);
    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: newUser
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Internal server error during signup.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = queryRow('SELECT * FROM users WHERE email = ?', [cleanEmail]);
    if (!user) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    const sanitizedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      village: user.village,
      taluka: user.taluka,
      district: user.district,
      state: user.state,
      created_at: user.created_at
    };

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful.',
      token,
      user: sanitizedUser
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error during login.' });
  }
};

exports.getMe = async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, village, taluka, district, state } = req.body;
    const userId = req.user.id;

    if (!name || !phone || !village || !taluka || !district || !state) {
      return res.status(400).json({ message: 'All profile fields are required.' });
    }

    run(`
      UPDATE users
      SET name = ?, phone = ?, village = ?, taluka = ?, district = ?, state = ?
      WHERE id = ?
    `, [name.trim(), phone.trim(), village.trim(), taluka.trim(), district.trim(), state.trim(), userId]);

    const updated = queryRow('SELECT id, name, email, phone, village, taluka, district, state, created_at FROM users WHERE id = ?', [userId]);

    res.json({
      message: 'Profile updated successfully.',
      user: updated
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Failed to update profile.' });
  }
};
