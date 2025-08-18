var express = require('express');
var router = express.Router();
const { addTiming, getMedian, getTopTen } = require('../database');

/* GET results page. */
router.get('/', async function(req, res, next) {
  try {
    if (!req.session.logged_in) return res.redirect('/loginuser');
    const [medianFont, medianText] = await Promise.all([getMedian('font'), getMedian('text')]);
    const [topTenFont, topTenText] = await Promise.all([getTopTen('font'), getTopTen('text')]);
    res.render('timings', {
      username: req.session.username,
      userTime: null,
      medianFont: medianFont ?? '—',
      medianText: medianText ?? '—',
      topTenFont,
      topTenText
    });
  } catch (err) { next(err); }
});

/* POST timing from survey */
router.post('/', async function(req, res, next) {
  try {
    if (!req.session.logged_in) return res.redirect('/loginuser');
    const timing = parseInt(req.body.timing, 10);
    const timingType = (req.body.timingType || '').toLowerCase() === '1' || req.body.timingType === 'font'
      ? 'font'
      : (req.body.timingType === 'text' ? 'text' : (req.session.survey_mode === 1 ? 'font' : 'text'));
    if (!Number.isFinite(timing) || timing <= 0) {
      return res.status(400).send('Invalid timing');
    }
    await addTiming({ username: req.session.username, timing_ms: timing, type: timingType });
    const [medianFont, medianText] = await Promise.all([getMedian('font'), getMedian('text')]);
    const [topTenFont, topTenText] = await Promise.all([getTopTen('font'), getTopTen('text')]);
    res.render('timings', {
      username: req.session.username,
      userTime: timing,
      medianFont: medianFont ?? '—',
      medianText: medianText ?? '—',
      topTenFont,
      topTenText
    });
  } catch (err) { next(err); }
});

module.exports = router;
