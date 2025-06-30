const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  const { fullName, email, password, country, phone, currency } = req.body;

  if (!fullName || !email || !password || !country || !phone || !currency) {
    return res.json({ success: false, message: 'Missing required fields' });
  }

  // TODO: Save to database (MongoDB, MySQL, Firebase, etc.)

  console.log('User registered:', { fullName, email });
  res.json({ success: true, message: 'Registration successful' });
});

module.exports = router;
