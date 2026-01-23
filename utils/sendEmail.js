const sgMail = require('@sendgrid/mail');

const sendEmail = async (options) => {
    // Set API Key from SMTP_PASSWORD which holds the SendGrid API Key
    sgMail.setApiKey(process.env.SMTP_PASSWORD);

    const msg = {
        to: options.email,
        from: {
            email: process.env.FROM_EMAIL,
            name: process.env.FROM_NAME,
        },
        subject: options.subject,
        text: options.message,
        // html: options.message, // You can add HTML support if needed
    };

    try {
        await sgMail.send(msg);
        console.log('Email sent successfully via SendGrid');
    } catch (error) {
        console.error('SendGrid Error:', error);

        if (error.response) {
            console.error('SendGrid Error Body:', error.response.body);
        }

        throw new Error('Email could not be sent');
    }
};

module.exports = sendEmail;
