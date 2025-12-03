// src/server/utils/csvTemplateParser.js

import moment from "moment";

export function parseCSVIntoTemplate(csvString) {
  const lines = csvString.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());
  const rows = lines.slice(1);

  return rows.map((line) => {
    const cols = line.split(",");
    const dateRaw = cols[0].trim(); // "03-12" or "12/03"
    const dateKey = moment(dateRaw, [
      "DD-MM",
      "MM-DD",
      "DD/MM",
      "MM/DD",
    ]).format("MM-DD");

    const slots = [];
    for (let i = 1; i < headers.length; i++) {
      const hhmm = cols[i].trim();
      if (!hhmm) continue;

      const [h, m] = hhmm.split(":");
      const minutes = parseInt(h) * 60 + parseInt(m);

      slots.push({ name: headers[i], time: minutes });
    }

    return { dateKey, slots };
  });
}
