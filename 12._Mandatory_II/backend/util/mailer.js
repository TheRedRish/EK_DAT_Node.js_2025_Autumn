export function sendWelcomeEmail(recipientEmail) {
  const message = `Simulated email to ${recipientEmail}: Welcome to the site!`;
  console.log(message);
  return message;
}

export function sendPasswordResetEmail(recipientEmail, newPassword) {
  const message = `Simulated email to ${recipientEmail}: Your password has been reset. New password: ${newPassword}`;
  console.log(message);
  return message;
}
