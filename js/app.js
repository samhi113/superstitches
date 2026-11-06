import { API_PRIVATE_KEY } from "./api.js";

const data = document.getElementById("data");
const teamSelect = document.getElementById("teamSelect");
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

function displayStats(homeAway, jerseyCount) {
    data.innerHTML = "";

    for (let i = 0; i < Math.min(homeAway.length, jerseyCount); i++) {

        const row = homeAway[i];

        let newText = "<p>";

        row.forEach((cell, j) => {
            newText += cell ?? "";

            switch (j) {
                case 0:
                    newText += "</p><div class='records'><div class='home'><p>";
                    break;
                case 1:
                    newText += "-";
                    break;
                case 2:
                    newText += "</p><p>Home</p></div><div class='away'><p>";
                    break;
                case 3:
                    newText += "-";
                    break;
                case 4:
                    newText += "</p><p>Away</p></div><div class='overall'><p>";
                    break;
                case 5:
                    newText += "-";
                    break;
                case 6:
                    newText += "</p><p>Overall</p></div></div>";
                    break;
            }
        });

        const [background, foreground] = colors[i] ?? [
            "rgb(255,255,255)",
            "rgb(0,0,0)"
        ];

        data.innerHTML += `
            <div class="row" style="
                background-color: ${background};
                color: ${foreground};
            ">
                ${newText}
            </div>
        `;
    }
}

function changeTeams(sheetName, jerseyCount) {
  getSpreadsheetData("125NfCJlym_sgl7LG49j49EzqwPZJQeOB6p_3Kul83sk", `${sheetName}!B3:B${3 + jerseyCount}`, API_PRIVATE_KEY)
      .then( () => {
  getSpreadsheetValues("125NfCJlym_sgl7LG49j49EzqwPZJQeOB6p_3Kul83sk", `${sheetName}`, API_PRIVATE_KEY)
      .then( () => {
        var homeAway = [];
        for (let i = 0; i < jerseyCount + 1; i++) {
          homeAway.push(sheet[i+2].slice(1, 8));
        }
        displayStats(homeAway, jerseyCount+1);
      }
  )});
}

teamSelect.addEventListener("change", (e) => {
  var value = e.target.value;
  var len = value.length - 1;

  changeTeams(value.slice(0,len), parseInt(value.slice(len,)));
})

changeTeams("Stats", 6);