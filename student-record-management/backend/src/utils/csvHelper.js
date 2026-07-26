// Minimal, dependency-free CSV helpers (no external csv library needed for this scale of data)

const toCsv = (rows, columns) => {
  const header = columns.map((c) => c.label).join(',');
  const lines = rows.map((row) =>
    columns
      .map((c) => {
        const raw = c.value(row);
        const str = raw === undefined || raw === null ? '' : String(raw);
        // Escape values containing commas, quotes or newlines
        if (/[",\n]/.test(str)) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      })
      .join(',')
  );
  return [header, ...lines].join('\n');
};

const parseCsv = (text) => {
  const [headerLine, ...lines] = text.trim().split(/\r?\n/);
  const headers = headerLine.split(',').map((h) => h.trim());
  return lines
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const values = line.split(',').map((v) => v.trim());
      return headers.reduce((acc, header, idx) => {
        acc[header] = values[idx];
        return acc;
      }, {});
    });
};

module.exports = { toCsv, parseCsv };
