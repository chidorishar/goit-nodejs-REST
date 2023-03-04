const sgMail = require('@sendgrid/mail');
const { EMAIL_SENDER_ADDRESS } = process.env;

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail({ recieverEmail, topic, messageText, messageMarkup }) {
  const msg = {
    to: recieverEmail, // Change to your recipient
    from: EMAIL_SENDER_ADDRESS, // Change to your verified sender
    subject: topic,
    text: messageText,
    html: messageMarkup,
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    console.log(`Error while sending email. \nError message: ${error.message}`);
  }
}

module.exports = sendEmail;
