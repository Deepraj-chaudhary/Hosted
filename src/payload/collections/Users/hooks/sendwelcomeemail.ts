export const welcomeMessage = async (name: string, email: string) => {
    return {
        to: email,
        from: 'no-reply@merph.in',
        subject: 'Welcome to Merph.in!',
        text: `Dear ${name},

We are thrilled to welcome you to our website! 🎉

As you log in for the first time, we want to express our heartfelt gratitude for choosing us. Here at Merph, we are dedicated to providing you with the best experience possible.

Feel free to explore our site, discover our wide range of products/services, and take advantage of any special offers we may have. Should you have any questions or need assistance, our customer support team is always here to help.

Thank you for joining us on this journey. We look forward to serving you and making your experience with us truly exceptional.

Best regards,
Team Merph`,
        html: `<p>Dear ${name},</p>
<p>We are thrilled to welcome you to our website! 🎉</p>
<p>As you log in for the first time, we want to express our heartfelt gratitude for choosing us. Here at <strong>Merph</strong>, we are dedicated to providing you with the best experience possible.</p>
<p>Feel free to explore our site, discover our wide range of products/services, and take advantage of any special offers we may have. Should you have any questions or need assistance, our customer support team is always here to help.</p>
<p>Thank you for joining us on this journey. We look forward to serving you and making your experience with us truly exceptional.</p>
<p>Best regards,<br>Team Merph</p>`,
    };
}
