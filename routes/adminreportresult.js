var express = require('express');
var router = express.Router();
const { getMedianSP, getTopTenSP } = require('../database');

router.get('/', async function(req, res, next) {
  try {
    const education = (req.query.education || '').trim();
    if (!education) return res.redirect('/adminreportselect');

    const [medianFont, medianText] = await Promise.all([
      getMedianSP(education, 'font'),
      getMedianSP(education, 'text')
    ]);
    const [topTenFont, topTenText] = await Promise.all([
      getTopTenSP(education, 'font'),
      getTopTenSP(education, 'text')
    ]);

    res.render('adminreportresult', {
      education,
      medianFont: medianFont ?? '—',
      medianText: medianText ?? '—',
      topTenFont,
      topTenText
    });
  } catch (err) { next(err); }
});

module.exports = router;
