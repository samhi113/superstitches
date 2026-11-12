import { API_PRIVATE_KEY } from "./api.js";

const data = document.getElementById("data");
var sheet;
const colors = [];
const colorFinal = [];

async function getSpreadsheetValues(spreadsheetId, range, apiKey) {
  const encodedRange = encodeURIComponent(range);

  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}?key=${apiKey}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorDetails = await response.json().catch(() => ({}));

      throw new Error(
        `${response.status}): ${errorDetails.error?.message || response.statusText}`
      );
    }

    const jsonData = await response.json();
    const values = jsonData.values ?? [];

    // console.log("Data retrieved:", values);
    sheet = values;
  } catch (error) {
    console.error("Failed to fetch spreadsheet data:", error.message);
    throw error;
  }
}

async function getSpreadsheetData(spreadsheetId, range, apiKey) {
  colors.length = 0;

  const encodedRange = encodeURIComponent(range);
  const fields = encodeURIComponent(
    "sheets.data.rowData.values.userEnteredFormat(backgroundColor,textFormat.foregroundColor)"
  );

  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}` +
    `?ranges=${encodedRange}&fields=${fields}&key=${apiKey}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.status} ${response.statusText}`);
    }

    const jsonData = await response.json();
    const rowData = jsonData.sheets?.[0]?.data?.[0]?.rowData ?? [];

    
    rowData.forEach((row) => {
        row.values?.forEach((cell) => {
            const format = cell.userEnteredFormat ?? {};

            const bg = format.backgroundColor ?? {};
            const text = format.textFormat?.foregroundColor ?? {};

            const toRGB = (color) => [
                Math.round((color.red ?? 0) * 255),
                Math.round((color.green ?? 0) * 255),
                Math.round((color.blue ?? 0) * 255),
            ];

            colors.push([
            "rgb(" + toRGB(bg).join() + ")",
            "rgb(" + toRGB(text).join() + ")",
            ]);
        });
    });


    // console.log(colors);
    var colorTemp = [];

    for (let i = 0; i < colors.length; i++) {
        if (i % 5 === 0){
          colorTemp.push(colors[i]);
        }

        if (colorTemp.length === 6) {
            colorFinal.push(colorTemp);
            colorTemp = [];
        }
    }

    console.log(sheet);
    return colorFinal;
  } catch (error) {
    console.error(error);
    return [];
  }
}

function displayStats() {
    data.innerHTML = "";

    // Six groups of five columns
    for (let group = 0; group < 6; group++) {

        let teams = [];

        // Collect teams from all spreadsheet rows
        sheet.forEach((row, rowIndex) => {
            const start = group * 5;
            const entries = row.slice(start, start + 5);

            // Skip empty teams
            if (entries.every(value =>
                value == null || String(value).trim() === ""
            )) {
                return;
            }

            // Get corresponding color
            const colorIndex = rowIndex * 30 + start;

            teams.push({
                entries,
                background: colors[colorIndex]?.[0] ?? "transparent",
                color: colors[colorIndex]?.[1] ?? "#000"
            });
        });

        // Sort by fourth column (index 3), highest first
        teams.sort((a, b) => {
            return Number(a.entries[3]) - Number(b.entries[3]);
        });

        // Build table
        let html = `
            <table class="standings-table">
                <thead>
                    <tr>
                        <th>Team</th>
                        <th>Stat 2</th>
                        <th>Stat 3</th>
                        <th>Stat 4</th>
                        <th>Games Left</th>
                    </tr>
                </thead>
                <tbody>
        `;

        teams.forEach(team => {
            html += `
                <tr style="
                    background-color: ${team.background};
                    color: ${team.color};
                ">
            `;

            team.entries.forEach(value => {
                html += `<td>${value ?? ""}</td>`;
            });

            html += `</tr>`;
        });

        html += `
                </tbody>
            </table>
        `;

        data.innerHTML += html;
    }
}

function changeTeams() {
  getSpreadsheetData("125NfCJlym_sgl7LG49j49EzqwPZJQeOB6p_3Kul83sk", "Standings!B4:AE33", API_PRIVATE_KEY)
      .then( () => {
        getSpreadsheetValues("125NfCJlym_sgl7LG49j49EzqwPZJQeOB6p_3Kul83sk", "Standings!B4:AE33", API_PRIVATE_KEY)
        .then( () => {
            displayStats();
        })
      });
}

changeTeams();