import driversCsv from '../../../datasets/drivers.csv?raw';

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
