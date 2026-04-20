const express = require('express');
const router = express.Router();
const { predict } = require('../ml/predictService');

// @route POST /api/predict
// @desc Predict winner between two teams
// @access Public
router.post('/', async (req, res) => {
  const { teamA, teamB } = req.body;

  if (!teamA || !teamB) {
    return res.status(400).json({ message: 'Please provide both teamA and teamB names' });
  }

  try {
    const result = await predict(teamA, teamB);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Prediction failed' });
  }
});

module.exports = router;
