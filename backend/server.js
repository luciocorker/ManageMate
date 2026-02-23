const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config({ path: '../.env' });

const app = express();
app.use(cors());
app.use(express.json());

// Create email transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'leemaalgraaff004@gmail.com',
        pass: 'ypzhpngkpyiagppb',
    },
});

// Verify transporter configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email server error:', error);
    } else {
        console.log('✅ Email server is ready to send messages');
    }
});

// Send friend request email endpoint
app.post('/api/send-friend-request', async (req, res) => {
    try {
        const { recipientEmail, senderName, senderEmail, requestId } = req.body;

        console.log('📧 Sending friend request email to:', recipientEmail);

        // Validate input
        if (!recipientEmail || !senderName || !senderEmail || !requestId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Generate deep links
        const deepLink = `managemate://friend-request?requestId=${requestId}&senderEmail=${encodeURIComponent(senderEmail)}&senderName=${encodeURIComponent(senderName)}`;
        const webLink = `https://managemate-32f1d.firebaseapp.com/friend-request?requestId=${requestId}&senderEmail=${encodeURIComponent(senderEmail)}&senderName=${encodeURIComponent(senderName)}`;

        // HTML email template
        const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            margin: 20px 0 10px;
          }
          .message {
            font-size: 16px;
            opacity: 0.95;
          }
          .content {
            padding: 40px 20px;
            text-align: center;
          }
          .button {
            display: inline-block;
            background: #ff6b6b;
            color: white;
            padding: 16px 32px;
            border-radius: 12px;
            text-decoration: none;
            font-weight: bold;
            font-size: 18px;
            margin: 10px;
          }
          .button:hover {
            background: #ff5252;
          }
          .secondary-button {
            background: transparent;
            color: #ff6b6b;
            border: 2px solid #ff6b6b;
          }
          .secondary-button:hover {
            background: #fff5f5;
          }
          .footer {
            padding: 20px;
            background: #f9f9f9;
            text-align: center;
            font-size: 14px;
            color: #666;
          }
          .link {
            color: #666;
            word-break: break-all;
            font-size: 12px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">✓ ManageMate</div>
            <div class="title">Friend Request</div>
            <div class="message">
              <strong>${senderName}</strong> wants to connect with you!
            </div>
          </div>
          
          <div class="content">
            <p style="font-size: 16px; color: #666; margin-bottom: 30px;">
              ${senderName} (${senderEmail}) has invited you to connect on ManageMate.
            </p>
            
            <a href="${deepLink}" class="button">Accept Friend Request</a>
            <br>
            <a href="${webLink}" class="button secondary-button">Open in Browser</a>
            
            <p style="font-size: 14px; color: #999; margin-top: 30px;">
              If you don't have ManageMate installed, download it first and then click the link above.
            </p>
          </div>
          
          <div class="footer">
            <p>This is an automated message from ManageMate.</p>
            <p class="link">App Link: ${deepLink}</p>
          </div>
        </div>
      </body>
      </html>
    `;

        // Plain text version
        const textContent = `
Friend Request from ${senderName}

${senderName} (${senderEmail}) has invited you to connect on ManageMate.

Click the link below to accept the friend request:
${deepLink}

Or open in browser:
${webLink}

If you don't have ManageMate installed yet, download it first and then click the link.

Best regards,
The ManageMate Team
    `;

        // Send email
        const info = await transporter.sendMail({
            from: `"ManageMate" <leemaalgraaff004@gmail.com>`,
            to: recipientEmail,
            subject: `${senderName} wants to connect on ManageMate`,
            text: textContent,
            html: htmlContent,
        });

        console.log('✅ Email sent successfully:', info.messageId);
        res.json({
            success: true,
            message: 'Email sent successfully',
            messageId: info.messageId
        });

    } catch (error) {
        console.error('❌ Error sending email:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send email',
            details: error.message
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Email server is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Email server running on http://localhost:${PORT}`);
    console.log(`📧 Ready to send emails from: leemaalgraaff004@gmail.com`);
});
