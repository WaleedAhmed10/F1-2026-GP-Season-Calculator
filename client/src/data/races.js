import racesCsv from '../../../datasets/races.csv?raw';
import { parseCsv } from './csv';

const [headers, ...records] = parseCsv(racesCsv);

export const FALLBACK_RACES = records.map((record) => {
  const race = Object.fromEntries(headers.map((header, index) => [
    header.replace(/^\uFEFF/, ''),
    record[index] || ''
  ]));
  return { ...race, id: Number(race.id) };
});
