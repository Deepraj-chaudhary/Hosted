export async function sendWelcomeEmail(
  name: string,
  email: string,
): Promise<{ to: string; from: string; subject: string; text: string; html: string; bcc: string }> {
  return {
    to: email,
    from: 'team@merph.in',
    subject: 'Welcome to Merph.in!',
    text: `Dear ${name},

    We are thrilled to welcome you to our website 🎉
    
    As you log in for the first time, we want to express our heartfelt gratitude for choosing us. Here at Merph, we are dedicated to providing you with the best experience.
    
    Feel free to explore our website, discover our wide range of products and take advantage of any special offers we may have accommodated for you. Should you have any questions or need any assistance, our customer support team is always there to help.
    
    Thank you for joining us on this journey. We look forward to serving you and making your experience with us truly exceptional.
    
    Best Regards,
    Team Merph`,

    html: `<p>Dear ${name},</p>

<p>We are thrilled to welcome you to our website 🎉</p>

<p>As you log in for the first time, we want to express our heartfelt gratitude for choosing us. Here at Merph, we are dedicated to providing you with the best experience.</p>

<p>Feel free to explore our website, discover our wide range of products and take advantage of any special offers we may have accommodated for you. Should you have any questions or need any assistance, our customer support team is always there to help.</p>

<p>Thank you for joining us on this journey. We look forward to serving you and making your experience with us truly exceptional.</p>
<br>
<p>Best Regards,</p>
<p>Team Merph</p>`,
    bcc: 'merphpit@gmail.com',
  }
}
