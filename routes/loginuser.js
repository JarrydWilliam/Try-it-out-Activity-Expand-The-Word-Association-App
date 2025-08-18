var express = require('express');
var router = express.Router();
const { getSalt, getUserByUsername } = require('../database');

/* GET page 1: enter username */
router.get('/', function(req, res) {
  res.render('loginuser', { message: '' });
});

/* POST page 1: lookup salt and render password screen */
router.post('/', async function(req, res, next) {
  try {
    const username = (req.body.username || '').trim();
    if (!username) {
      return res.status(400).render('loginuser', { message: 'Please enter a username.' });
    }
    const salt = await getSalt(username);
    if (!salt) {
      return res.status(404).render('loginuser', { message: 'User not found.' });
    }
    res.render('loginpassword', { username, salt, message: '' });
  } catch (err) {
    next(err);
  }
});

/* POST page 2: verify password hash */
router.post('/verify', async function(req, res, next) {
  try {
    const username = (req.body.username || '').trim();
    const clientHash = (req.body.hash || '').trim().toLowerCase();

    const user = await getUserByUsername(username);
    if (!user) {
      return res.status(404).render('loginuser', { message: 'User not found.' });
    }
    if (!clientHash || clientHash.length !== 64) {
      return res.status(400).render('loginpassword', { username, salt: user.salt, message: 'Invalid password.' });
    }
    if (clientHash !== user.password_hash.toLowerCase()) {
      return res.status(401).render('loginpassword', { username, salt: user.salt, message: 'Incorrect password.' });
    }

    // success
    req.session.logged_in = true;
    req.session.username = username;
    req.session.role = user.role;
    return res.redirect('/survey');
  } catch (err) {
    next(err);
  }
});

router.get('/logout', function(req, res) {
  req.session.destroy(() => res.redirect('/'));
});

module.exports = router;
