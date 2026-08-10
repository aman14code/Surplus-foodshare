const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

const sendSmsNotification = async (to, message) => {
  if (!client) {
    console.warn(`Mock SMS to ${to}: ${message}`);
    return { success: true, mock: true };
  }

  try {
    const response = await client.messages.create({
      body: message,
      from: twilioNumber,
      to
    });
    console.log("SMS sent:", response.sid);
    return { success: true, sid: response.sid };
  } catch (error) {
    console.error("Twilio error:", error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendSmsNotification
};
