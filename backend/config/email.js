const nodemailer = require('nodemailer');

// Create transporter for sending emails
const createTransporter = () => {
    return nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT),
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

// Send email function
const sendEmail = async (to, subject, htmlContent) => {
    try {
        const transporter = createTransporter();
        
        // Verify transporter configuration
        await transporter.verify();
        
        const mailOptions = {
            from: `Meeting Summarizer <${process.env.EMAIL_USER}>`,
            to: Array.isArray(to) ? to.join(', ') : to,
            subject: subject,
            html: htmlContent,
            text: htmlContent.replace(/<[^>]*>/g, '') // Strip HTML for text version
        };
        
        const result = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', result.messageId);
        return { success: true, messageId: result.messageId };
        
    } catch (error) {
        console.error('Email sending error:', error);
        return { success: false, error: error.message };
    }
};

// Format summary for email
const formatSummaryEmail = (originalText, summary, customPrompt) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Meeting Summary</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f4f4f4; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
            .summary { background-color: #fff; border-left: 4px solid #007bff; padding: 20px; margin: 20px 0; }
            .prompt { background-color: #e9f7ef; padding: 15px; border-radius: 5px; margin: 10px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
            .original { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; max-height: 200px; overflow-y: auto; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🤖 AI Meeting Summary</h1>
            <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>
        
        ${customPrompt ? `
        <div class="prompt">
            <h3>📝 Custom Instructions Used:</h3>
            <p><em>"${customPrompt}"</em></p>
        </div>
        ` : ''}
        
        <div class="summary">
            <h2>📋 Summary</h2>
            <div>${summary.replace(/\n/g, '<br>')}</div>
        </div>
        
        <div class="original">
            <h3>📄 Original Transcript (Preview)</h3>
            <div>${originalText.substring(0, 500).replace(/\n/g, '<br>')}${originalText.length > 500 ? '...' : ''}</div>
        </div>
        
        <div class="footer">
            <p>This summary was generated using AI technology. Please review for accuracy.</p>
        </div>
    </body>
    </html>
    `;
};

module.exports = {
    sendEmail,
    formatSummaryEmail
};