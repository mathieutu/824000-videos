function myFunction(e) {
  Logger.log(JSON.stringify(e.namedValues)); // Log the namedValues object for debugging

  // Access the form fields correctly
  const email = e.namedValues["Email"][0];
  const nomSejour = e.namedValues["Nom du séjour"][0];
  const dateDebut = e.namedValues["Date de début"][0];
  const propal1 = e.namedValues["Proposition 1"][0];
  const propal2 = e.namedValues["Proposition 2"][0];
  const propal3 = e.namedValues["Proposition 3"][0];
  const propal4 = e.namedValues["Proposition 4"][0];

  Logger.log(propal1);
  Logger.log(propal1);
  Logger.log(propal1);

  const url = createForm(
    nomSejour,
    dateDebut,
    propal1,
    propal2,
    propal3,
    propal4
  );
  var qrCodeUrl = "https://quickchart.io/qr?text=" + encodeURIComponent(url);
  var qrCodeImage = UrlFetchApp.fetch(qrCodeUrl).getBlob();

  MailApp.sendEmail({
    to: email,
    subject: "Formulaire à partager avec les participants",
    htmlBody: url,
    attachments: [qrCodeImage],
  });

  const parentFolderId = "1MWxRUZ9O7aE7Q29KdWvS9If5al3ah3o0"; // Replace with your parent folder ID
  const newFolderName = nomSejour; // Replace with the desired new folder name
  createFolderInParent(parentFolderId, newFolderName);
}

function createForm(title, date, propal1, propal2, propal3, propal4) {
  var newForm = FormApp.create("Participants - " + title + " - " + date);
  newForm.addTextItem().setTitle("Nom et prénom").setRequired(true);
  newForm.addTextItem().setTitle("Numéro de téléphone").setRequired(true);
  var email = newForm.addTextItem().setTitle("Email");
  var emailValidation = FormApp.createTextValidation()
    .requireTextIsEmail()
    .build();
  email.setValidation(emailValidation);

  var propositions = [propal1, propal2, propal3, propal4].filter(Boolean);

  if (propositions.length > 0) {
    // Add the multiple-choice question only if there are valid propositions
    var item = newForm.addCheckboxItem();
    item
      .setTitle("Veuillez choisir les dates de rencontre post-événement")
      .setRequired(true)
      .setChoiceValues(propositions);
  } else {
    Logger.log(
      "No valid propositions available to create a multiple-choice question."
    );
  }
  const spreadsheet = SpreadsheetApp.openById(
    "1_72HoVV13SJp4kAZ95hKBwxLFk5Zg8jfZBTqqqJswVQ"
  );
  newForm.setDestination(
    FormApp.DestinationType.SPREADSHEET,
    spreadsheet.getId()
  );

  const url = newForm.getPublishedUrl();
  const formUrl = newForm.getEditUrl().replace("edit", "viewform");
  Logger.log(formUrl);
  // const formSheet = spreadsheet.getSheets().find(s => s.getFormUrl() == formUrl);
  // spreadsheet.getSheets().find(s => Logger.log(s));
  // Logger.log(formSheet)
  // if (formSheet) {
  //   formSheet.setName("reponses - " + title);
  // }

  // Retry mechanism to wait for the sheet to be created
  const formSheetName = "reponses - " + title;
  const maxRetries = 30;
  const retryDelay = 1000; // milliseconds

  for (let i = 0; i < maxRetries; i++) {
    SpreadsheetApp.flush();

    const formSheet = findFormSheet(formUrl);
    if (formSheet) {
      formSheet.setName(formSheetName);
      break;
    }
    Utilities.sleep(retryDelay);
  }

  return url;
}

function findFormSheet(formUrl) {
  const spreadsheet = SpreadsheetApp.openById(
    "1_72HoVV13SJp4kAZ95hKBwxLFk5Zg8jfZBTqqqJswVQ"
  );
  const sheets = spreadsheet.getSheets();
  for (let sheet of sheets) {
    Logger.log(sheet.getSheetName());
    spreadsheet.setActiveSheet(sheet);
    let urlToTry = spreadsheet.getActiveSheet().getFormUrl();
    Logger.log(urlToTry + "=====" + formUrl);
    if (urlToTry === formUrl) {
      return sheet;
    }
  }
  return null;
}

function createFolderInParent(parentFolderId, newFolderName) {
  const parentFolder = DriveApp.getFolderById(parentFolderId);
  const newFolder = parentFolder.createFolder(newFolderName);
  Logger.log(
    "Created folder: " +
      newFolder.getName() +
      " in parent folder: " +
      parentFolder.getName()
  );
}
