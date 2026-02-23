import emailjs from '@emailjs/browser';

// EmailJS Configuration
// Get these from: https://dashboard.emailjs.com/
const EMAILJS_CONFIG = {
  serviceId: process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID || '',
  templateId: process.env.EXPO_PUBLIC_EMAILJS_TEMPLATE_ID || '',
  publicKey: process.env.EXPO_PUBLIC_EMAILJS_PUBLIC_KEY || '',
};

/**
 * Send friend request invitation email using EmailJS
 * No backend required - works directly from React Native!
 */
export async function sendFriendRequestEmail(
  recipientEmail: string,
  senderName: string,
  senderEmail: string,
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Generate deep links
    const deepLink = `managemate://friend-request?requestId=${requestId}&senderEmail=${encodeURIComponent(senderEmail)}&senderName=${encodeURIComponent(senderName)}`;
    const webLink = `https://managemate-32f1d.firebaseapp.com/friend-request?requestId=${requestId}&senderEmail=${encodeURIComponent(senderEmail)}&senderName=${encodeURIComponent(senderName)}`;

    // Email template parameters
    const templateParams = {
      to_email: recipientEmail,
      from_name: senderName,
      from_email: senderEmail,
      app_link: deepLink,
      web_link: webLink,
      request_id: requestId,
    };

    // Send email using EmailJS
    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams,
      EMAILJS_CONFIG.publicKey
    );

    console.log('✅ Email sent successfully:', response);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error sending email:', error);
    return { success: false, error: error.message || 'Failed to send email' };
  }
}

/**
 * Initialize EmailJS (call this once when app starts)
 */
export function initEmailJS() {
  if (EMAILJS_CONFIG.publicKey) {
    emailjs.init(EMAILJS_CONFIG.publicKey);
    console.log('✅ EmailJS initialized');
  } else {
    console.warn('⚠️ EmailJS public key not configured');
  }
}
