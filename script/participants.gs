const NOTIFICATION_SHEET_NAME = "notifications";

function getRecipents(evt) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
    `reponses - ${evt}`
  );
  // TODO get data ranges
  const data = sheet.getRange("C2:D").getValues();

  // if mail (item[0]) is non empty
  const mails = data.filter((item) =>
    (!!item[0]).reduce((stack, current) => {
      return [...stack, current[0]];
    }, [])
  );

  return mails.join(",");
}

function sendMails() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
    NOTIFICATION_SHEET_NAME
  );

  //
  const evtName = sheet.getRange("C4").getValue();
  const videoURL = sheet.getRange("C6").getValue();
  const mails = getRecipents(evtName);

  const htmlEmailBody = `<body><h1>La vidéo de votre séjour</h1><br><br><strong style="color:blue">Nous somme très heureux de partager ce bon souvenir avec vous</strong> 
  <br/>
  <p>
  <a href="${videoURL}" target="_blank">Lien de la vidéo youtube</a>
  </p>
  <i>Au plaisir de vous revoir en montagne!</i>
  </body>`;

  MailApp.sendEmail(mails, "Vidéo souvenir", "defaultText", {
    htmlBody: htmlEmailBody,
  });
}

// définition de la liste déroulante de selection des noms d'évenements
function updateSheetNamesDropdown() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var dropdownSheet = spreadsheet.getSheetByName(NOTIFICATION_SHEET_NAME);
  var dropdownCell = "C5";

  // Get all sheet names
  var sheetNames = spreadsheet
    .getSheets()
    .filter((item) => item.getName() !== NOTIFICATION_SHEET_NAME)
    .map((item) => item.getName().replace("reponses - ", ""));

  // Create a data validation rule with the sheet names
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(sheetNames)
    .setAllowInvalid(false)
    .build();

  // Apply the data validation rule to the dropdown cell
  dropdownSheet.getRange(dropdownCell).setDataValidation(rule);
}

// mise à jour de la liste déroulante quand un utilisateur ouvre le GoogleSheet
function onOpen() {
  console.log("open");
  updateSheetNamesDropdown();
}

// mise à jour de la liste déroulante quand une Sheet est ajoutée ou supprimée
function onEdit(e) {
  console.log("edit");

  // Check if a sheet is added or deleted
  updateSheetNamesDropdown();
}
