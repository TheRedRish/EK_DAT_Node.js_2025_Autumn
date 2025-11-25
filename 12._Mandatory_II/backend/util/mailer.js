export function sendWelcomeEmail(recipientEmail) {
  const message = `Simulated email to ${recipientEmail}: Welcome to the site!`;
  console.log(message);
  return message;
}
