const fs = require('fs');
const path = require('path');

const TEAM_ORDER = [
  'McLaren',
  'Ferrari',
  'Red Bull Racing',
  'Mercedes',
  'Aston Martin',
  'Alpine',
  'Haas',
  'Racing Bulls',
  'Williams',
  'Audi',
  'Cadillac'
];

function parseCsv(content) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < content.length; index++) {
    const character = content[index];
    if (quoted) {
      if (character === '"' && content[index + 1] === '"') {
        field += '"';
        index++;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ',') {
      row.push(field);
      field = '';
    } else if (character === '\n' || character === '\r') {
      if (character === '\r' && content[index + 1] === '\n') index++;
      row.push(field);
      if (row.some((value) => value !== '')) rows.push(row);
      row = [];
      field = '';
    } else {
      field += character;
    }
  }

  row.push(field);
  if (row.some((value) => value !== '')) rows.push(row);
  return rows;
}

function readDataset(filename) {
  const filePath = path.join(__dirname, '../../datasets', filename);
  const [headers, ...records] = parseCsv(fs.readFileSync(filePath, 'utf8'));
  return records.map((record) => Object.fromEntries(
    headers.map((header, index) => [header.replace(/^\uFEFF/, ''), record[index] || ''])
  ));
}

const SEED_DRIVERS = readDataset('drivers.csv').map((driver) => ({
  ...driver,
  number: Number(driver.number),
  titles: Number(driver.titles),
  rookie: driver.rookie === 'true',
  seasonPosition: Number(driver.seasonPosition),
  seasonPoints: Number(driver.seasonPoints)
}));
const SEED_RACES = readDataset('races.csv').map((race) => ({
  ...race,
  id: Number(race.id)
}));
const TEAM_COLORS = Object.fromEntries(SEED_DRIVERS.map(({ team, teamColor }) => [team, teamColor]));

function sortDrivers(drivers) {
  return [...drivers].sort((a, b) => {
    const teamDiff = TEAM_ORDER.indexOf(a.team) - TEAM_ORDER.indexOf(b.team);
    if (teamDiff !== 0) return teamDiff;
    return a.number - b.number;
  });
}

module.exports = { SEED_DRIVERS, SEED_RACES, TEAM_ORDER, TEAM_COLORS, sortDrivers };
