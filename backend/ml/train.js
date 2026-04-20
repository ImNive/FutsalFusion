const tf = require('@tensorflow/tfjs');
const preprocess = require('./preprocess');
const path = require('path');
const fs = require('fs');

const MODEL_SAVE_PATH = 'file://' + path.join(__dirname, 'model');

async function trainModel() {
  const { teamMap, trainingData } = await preprocess();
  const numTeams = Object.keys(teamMap).length;

  // Prepare Tensors
  // We use one-hot encoding for the two teams
  const inputs = trainingData.map(d => {
    const arrA = new Array(numTeams).fill(0);
    const arrB = new Array(numTeams).fill(0);
    arrA[d.teamAId] = 1;
    arrB[d.teamBId] = 1;
    return [...arrA, ...arrB];
  });

  const labels = trainingData.map(d => d.label); // 0: Draw, 1: Team A, 2: Team B

  const xs = tf.tensor2d(inputs);
  const ys = tf.oneHot(tf.tensor1d(labels, 'int32'), 3);

  // Define Model
  const model = tf.sequential();
  model.add(tf.layers.dense({
    inputShape: [numTeams * 2],
    units: 32,
    activation: 'relu'
  }));
  model.add(tf.layers.dense({
    units: 16,
    activation: 'relu'
  }));
  model.add(tf.layers.dense({
    units: 3,
    activation: 'softmax' // Output probabilities for 3 classes
  }));

  model.compile({
    optimizer: tf.train.adam(0.01),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy']
  });

  console.log('Starting training...');
  await model.fit(xs, ys, {
    epochs: 100,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        if (epoch % 20 === 0) {
          console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}, acc = ${logs.acc.toFixed(4)}`);
        }
      }
    }
  });

  console.log('Training complete. Formatting for save...');
  
  // Custom save to JSON for Node.js environment without tfjs-node
  const modelJson = await model.toJSON();
  const weights = await model.getWeights();
  const weightsData = await Promise.all(weights.map(w => w.data()));
  const weightsManifest = weights.map((w, i) => ({
    name: w.name,
    shape: w.shape,
    dtype: w.dtype,
    data: Array.from(weightsData[i]) // Convert TypedArray to standard Array for JSON
  }));

  const bundle = {
    modelTopology: JSON.parse(modelJson),
    weightsManifest
  };

  fs.writeFileSync(path.join(__dirname, 'model.json'), JSON.stringify(bundle, null, 2));
  console.log('Model saved to ml/model.json');

  return { model, teamMap };
}

if (require.main === module) {
  trainModel().catch(console.error);
}

module.exports = trainModel;
