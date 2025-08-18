var express = require('express');
var router = express.Router();

const WORDS = ['RED','BLUE','GREEN','YELLOW','PURPLE','ORANGE','BLACK','WHITE','PINK'];
const COLORS = ['red','blue','green','yellow','purple','orange','black','white','pink'];

/* GET survey page. */
router.get('/', function(req, res) {
  if (!req.session.logged_in) {
    return res.redirect('/loginuser');
  }

  // Flip or initialize survey mode: 0 = text (read word), 1 = font (read color)
  if (typeof req.session.survey_mode === 'undefined') {
    req.session.survey_mode = Math.floor(Math.random() * 2);
  } else {
    req.session.survey_mode = (req.session.survey_mode + 1) % 2;
  }

  const numRounds = 20;
  const indices = Array.from({length: numRounds}, () => Math.floor(Math.random() * 9));

  const surveyMode = req.session.survey_mode; // 0 or 1
  const surveyModeText = surveyMode === 0 ? 'Text of words' : 'Font colors';
  const instructions = surveyMode === 0
    ? 'Read the text (ignore the font color).'
    : 'Read the font color (ignore the text).';

  res.render('survey', {
    username: req.session.username,
    words: WORDS,
    colors: COLORS,
    indices,
    numRounds,
    surveyMode,
    surveyModeText,
    instructions
  });
});

module.exports = router;
