var express = require('express');
var router = express.Router();

router.post('/', function(req, res) {
  const education = req.body.education;

  // Dummy data
  const dummyTimes = [1245, 1300, 1350, 1400, 1455, 1500, 1600, 1700, 1800, 1900];
  const medianTime = dummyTimes[Math.floor(dummyTimes.length / 2)];

  res.render('adminreportresult', {
    education: education,
    medianTime: medianTime,
    topTimes: dummyTimes
  });
});

module.exports = router;
