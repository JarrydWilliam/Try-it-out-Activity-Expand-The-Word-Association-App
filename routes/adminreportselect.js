var express = require('express');
var router = express.Router();
const { pool } = require('../database');

router.get('/', async function(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT education FROM users WHERE education IS NOT NULL AND education <> '' ORDER BY education`
    );
    res.render('adminreportselect', { message: '', educations: rows.map(r => r.education) });
  } catch (err) { next(err); }
});

router.post('/', async function(req, res) {
  const education = (req.body.education || '').trim();
  if (!education) return res.status(400).render('adminreportselect', { message: 'Please choose an educational type.', educations: [] });
  res.redirect(`/adminreportresult?education=${encodeURIComponent(education)}`);
});

module.exports = router;
