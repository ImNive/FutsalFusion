const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const CSV_PATH = path.join(__dirname, '../../Data set.csv');
const TEAMS_JSON_PATH = path.join(__dirname, 'teams.json');

async function preprocess() {
  const results = [];
  const teams = new Set();

  return new Promise((resolve, reject) => {
    fs.createReadStream(CSV_PATH)
      .pipe(csv())
      .on('data', (data) => {
        // Normalize team names
        let teamA = data['Team A']?.trim();
        let teamB = data['Team B']?.trim();
        
        // Normalize specific typos
        if (teamA === 'ADCR Caxinas Poco Barca') teamA = 'ADCR Caxinas Poca Barca';
        if (teamB === 'ADCR Caxinas Poco Barca') teamB = 'ADCR Caxinas Poca Barca';

        if (teamA) teams.add(teamA);
        if (teamB) teams.add(teamB);
        
        data['Team A'] = teamA;
        data['Team B'] = teamB;
        results.push(data);
      })
      .on('end', () => {
        const teamList = Array.from(teams).sort();
        const teamMap = {};
        teamList.forEach((team, index) => {
          teamMap[team] = index;
        });

        // Save team mapping
        fs.writeFileSync(TEAMS_JSON_PATH, JSON.stringify(teamMap, null, 2));
        console.log(`Preprocessed ${results.length} matches and ${teamList.length} unique teams.`);
        
        const trainingData = results.map(match => {
          const teamAId = teamMap[match['Team A']?.trim()];
          const teamBId = teamMap[match['Team B']?.trim()];
          let label = 0; // Draw
          if (match.Winner === match['Team A']?.trim()) label = 1; // Team A wins
          if (match.Winner === match['Team B']?.trim()) label = 2; // Team B wins
          
          return { teamAId, teamBId, label };
        }).filter(d => d.teamAId !== undefined && d.teamBId !== undefined);

        resolve({ teamMap, trainingData });
      })
      .on('error', reject);
  });
}

module.exports = preprocess;

if (require.main === module) {
  preprocess().then(data => {
    console.log('Sample Training Data:', data.trainingData.slice(0, 5));
  }).catch(console.error);
}
