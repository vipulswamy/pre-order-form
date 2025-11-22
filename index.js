const express = require("express");
const { google } = require("googleapis");
const PORT = process.env.PORT || 1337;

const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/", async (req, res) => {
  const { firstName, lastName, email, phone } = req.body;

 // NEW: Reads from environment variables
const auth = new google.auth.GoogleAuth({
  credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // CRITICAL: Handle newline characters
  },
  scopes: "https://www.googleapis.com/auth/spreadsheets",
});

  // Create client instance for auth
  const client = await auth.getClient();

  // Instance of Google Sheets API
  const googleSheets = google.sheets({ version: "v4", auth: client });

  const spreadsheetId = "1Otk9PvlZ63_bRs80cbCQtA2Ws7PZL_3Ys_TSXdgM-MA";

  // Get metadata about spreadsheet
  const metaData = await googleSheets.spreadsheets.get({
    auth,
    spreadsheetId,
  });

  // Read rows from spreadsheet
  const getRows = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: "Sheet1!A:D",
  });

  // Write row(s) to spreadsheet
  await googleSheets.spreadsheets.values.append({
    auth,
    spreadsheetId,
    range: "Sheet1!A:D",
    valueInputOption: "USER_ENTERED",
    resource: {
      values: [[firstName, lastName, email, phone]],
    },
  });

  res.send("Successfully submitted! Thank you!");
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));