// lib/Email.js - Test ortamında async sorun çözümü

const nodemailer = require('nodemailer');
const config = require('../config');

class Email {
    constructor() {
        // Test ortamında nodemailer oluşturma
        if (process.env.NODE_ENV === 'test' || process.env.LOG_LEVEL === 'off') {
            this.transporter = null; // Test modunda transporter oluşturma
            return;
        }
        
        this.createTransporter();
    }

    async createTransporter() {
        if (!config.EMAIL.auth.user) {
            let testAccount = await nodemailer.createTestAccount();
            console.log("Test Account Created: ", testAccount.user);

            this.transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
        } else {
            this.transporter = nodemailer.createTransport({
                host: config.EMAIL.host,
                port: config.EMAIL.port || 587,
                secure: false,
                auth: {
                    user: config.EMAIL.auth.user,
                    pass: config.EMAIL.auth.pass,
                },
            });
        }
    }

    async send(to, subject, text, html) {
        // Test modunda email gönderme
        if (process.env.NODE_ENV === 'test' || process.env.LOG_LEVEL === 'off') {
            console.log(`[TEST MODE] Email would be sent to: ${to}`);
            return { success: true, message: 'Test mode - email not sent' };
        }

        if (!this.transporter) {
            await this.createTransporter();
        }

        try {
            let info = await this.transporter.sendMail({
                from: config.EMAIL.auth.user || '"Test Account" <test@ethereal.email>',
                to: to,
                subject: subject,
                text: text,
                html: html,
            });

            console.log("Message sent: %s", info.messageId);
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

            return info;
        } catch (error) {
            console.error("Email send error:", error);
            throw error;
        }
    }
}

module.exports = new Email();