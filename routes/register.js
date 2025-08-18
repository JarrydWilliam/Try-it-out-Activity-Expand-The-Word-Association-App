var express = require('express');
var router = express.Router();
const { registerUserSP, getUserByUsername } = require('../database');

/* GET page. */
router.get('/', function(req, res) {
  res.render('register', { message: '' });
});

/* POST page — use stored procedure register_user */
router.post('/', async function(req, res, next) {
  try {
    const { username, name, email, gender, education, salt, hash } = req.body;
    if (!username || !salt || !hash || !education) {
      return res.status(400).render('register', { message: 'Please complete all required fields.' });
    }
    const existing = await getUserByUsername(username);
    if (existing) {
      return res.status(409).render('register', { message: 'Username already exists.' });
    }
    await registerUserSP({
      username,
      name: name || null,
      email: email || null,
      gender: gender || null,
      education,
      salt,
      password_hash: hash
    });
    res.redirect('/loginuser');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
