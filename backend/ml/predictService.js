const tf = require('@tensorflow/tfjs');
const fs = require('fs');
const path = require('path');

const MODEL_PATH = path.join(__dirname, '../ml/model.json');
const TEAMS_PATH = path.join(__dirname, '../ml/teams.json');

let model = null;
let teamMap = null;
let reverseTeamMap = null;

async function loadModel() {
  if (model) return { model, teamMap };

  const bundle = JSON.parse(fs.readFileSync(MODEL_PATH, 'utf8'));
  teamMap = JSON.parse(fs.readFileSync(TEAMS_PATH, 'utf8'));
  reverseTeamMap = Object.fromEntries(Object.entries(teamMap).map(([k, v]) => [v, k]));

  // Reconstruct model
  model = await tf.models.modelFromJSON(bundle.modelTopology);
  
  // Reconstruct weights
  const weights = bundle.weightsManifest.map(w => {
    return tf.tensor(w.data, w.shape, w.dtype);
  });
  model.setWeights(weights);

  return { model, teamMap };
}

async function predict(teamA, teamB) {
  const { model, teamMap } = await loadModel();
  const numTeams = Object.keys(teamMap).length;

  const teamAId = teamMap[teamA];
  const teamBId = teamMap[teamB];

  if (teamAId === undefined || teamBId === undefined) {
    throw new Error('Invalid team name(s)');
  }

  const inputArrA = new Array(numTeams).fill(0);
  const inputArrB = new Array(numTeams).fill(0);
  inputArrA[teamAId] = 1;
  inputArrB[teamBId] = 1;

  const inputTensor = tf.tensor2d([[...inputArrA, ...inputArrB]]);
  const prediction = model.predict(inputTensor);
  const probabilities = await prediction.data();

  // 0: Draw, 1: Team A, 2: Team B
  const labels = ['DRAW', teamA, teamB];
  const maxIndex = probabilities.indexOf(Math.max(...probabilities));

  return {
    winner: labels[maxIndex],
    probabilities: {
      draw: (probabilities[0] * 100).toFixed(2) + '%',
      [teamA]: (probabilities[1] * 100).toFixed(2) + '%',
      [teamB]: (probabilities[2] * 100).toFixed(2) + '%'
    }
  };
}

module.exports = { predict, loadModel };
