import driversCsv from '../../../datasets/drivers.csv?raw';
import { parseCsv } from './csv';

const [headers, ...records] = parseCsv(driversCsv);
export const FALLBACK_DRIVERS = records.map((record) => {
  const driver = Object.fromEntries(headers.map((header, index) => [
    header.replace(/^\uFEFF/, ''),
    record[index] || ''
  ]));
  return {
    ...driver,
    number: Number(driver.number),
    titles: Number(driver.titles),
    rookie: driver.rookie === 'true',
    seasonPosition: Number(driver.seasonPosition),
    seasonPoints: Number(driver.seasonPoints)
  };
});
