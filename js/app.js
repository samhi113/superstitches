import { API_PRIVATE_KEY } from "./api.js";

const data = document.getElementById("data");
var sheet;
const colors = [];

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

    const data = await response.json();
    const values = data.values ?? [];

    // console.log("Data retrieved:", values);
    sheet = values;
  } catch (error) {
    console.error("Failed to fetch spreadsheet data:", error.message);
    throw error;
  }
}

async function getSpreadsheetData(spreadsheetId, range, apiKey) {
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

    const data = await response.json();
    const rowData = data.sheets?.[0]?.data?.[0]?.rowData ?? [];

    rowData.forEach((row) => {
      const cell = row.values?.[0] ?? {};
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

    console.log(colors);
    return colors;
  } catch (error) {
    console.error(error);
    return [];
  }
}

function displayStats(homeAway) {
    data.innerHTML = "";

    for (let i = 0; i < homeAway.length; i++) {
        var newText = "<p>";

        const row = homeAway[i];
        
        for (let j = 0; j < row.length; j++) {
            const cell = row[j];
            
            newText += cell;

            switch (j) {
                case 0:
                    newText += "</p><div class='records'><div class='home'><p>"
                    break;
                case 1:
                    newText += "-"
                    break;
                case 2:
                    newText += "</p><p>Home</p></div><div class='away'><p>"
                    break;
                case 3:
                    newText += "-"
                    break;
                case 4:
                    newText += "</p><p>Away</p></div><div class='overall'><p>"
                    break;
                case 5:
                    newText += "-"
                    break;
                case 6:
                    newText += "</p><p>Overall</p></div></div>"
                    break;
                default:
                    break;
            }
        }

        data.innerHTML += `<div class="row" style="background-color: ${colors[i][0]}; color: ${colors[i][1]}">` + newText + "</div>";
    }
}

getSpreadsheetData("125NfCJlym_sgl7LG49j49EzqwPZJQeOB6p_3Kul83sk", "Stats!B3:B9", API_PRIVATE_KEY)
    .then( () => {
getSpreadsheetValues("125NfCJlym_sgl7LG49j49EzqwPZJQeOB6p_3Kul83sk", "Stats", API_PRIVATE_KEY)
    .then( () => {
            var pacersHomeAway = [sheet[2].slice(1, 8), sheet[3].slice(1, 8), sheet[4].slice(1, 8), sheet[5].slice(1, 8), sheet[6].slice(1, 8), sheet[7].slice(1, 8), sheet[8].slice(1, 8)];

            console.log(sheet);
            console.log(pacersHomeAway);

            displayStats(pacersHomeAway);
        }
)});
