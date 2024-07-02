function myFunction(e) {
  Logger.log(JSON.stringify(e));
  FormApp.getActiveForm();
  const email = Session.getActiveUser().getEmail();
  const html = JSON.stringify(e.namedValues);
  MailApp.sendEmail({
    to: email,
    subject: "Form submit",
    htmlBody: html,
  });
}
