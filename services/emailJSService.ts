import emailjs from '@emailjs/browser';

// EmailJS Configuration
// Get these from: https://dashboard.emailjs.com/
const EMAILJS_CONFIG = {
  serviceId: process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID || '',
  templateId: process.env.EXPO_PUBLIC_EMAILJS_TEMPLATE_ID || '',
  publicKey: process.env.EXPO_PUBLIC_EMAILJS_PUBLIC_KEY || '',
};

/**
 * Initialize EmailJS with your public key
 */
export function initEmailJS() {
  if (EMAILJS_CONFIG.publicKey) {
    emailjs.init(EMAILJS_CONFIG.publicKey);
    console.log('✅ EmailJS initialized');
  } else {
    console.warn('⚠️ EmailJS public key not configured');
  }
}

/**
 * Send friend request invitation email using EmailJS
 */
export async function sendFriendRequestEmail(
  recipientEmail: string,
  senderName: string,
  senderEmail: string,
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate configuration
    if (!EMAILJS_CONFIG.serviceId || !EMAILJS_CONFIG.templateId || !EMAILJS_CONFIG.publicKey) {
      throw new Error('EmailJS not configured. Please add credentials to .env file.');
    }

    // Generate deep links
    const deepLink = `managemate://friend-request?requestId=${requestId}&senderEmail=${encodeURIComponent(senderEmail)}&senderName=${encodeURIComponent(senderName)}`;
    const webLink = `https://managemate-32f1d.firebaseapp.com/friend-request?requestId=${requestId}&senderEmail=${encodeURIComponent(senderEmail)}&senderName=${encodeURIComponent(senderName)}`;

    // Template parameters for EmailJS
    const templateParams = {
      to_email: recipientEmail,
      to_name: recipientEmail.split('@')[0], // Use email username as name
      from_name: senderName,
      from_email: senderEmail,
      app_link: deepLink,
      web_link: webLink,
      request_id: requestId,
    };

    console.log('📧 Sending friend request email via EmailJS...');
    console.log('  To:', recipientEmail);
    console.log('  From:', senderName);

    // Send email using EmailJS
    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams,
      EMAILJS_CONFIG.publicKey
    );

    console.log('✅ Email sent successfully:', response.status, response.text);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error sending email via EmailJS:', error);
    return { 
      success: false, 
      error: error.text || error.message || 'Failed to send email' 
    };
  }
}

/**
 * Verify EmailJS configuration
 */
export function verifyEmailJSConfig(): boolean {
  const isConfigured = !!(
    EMAILJS_CONFIG.serviceId &&
    EMAILJS_CONFIG.templateId &&
    EMAILJS_CONFIG.publicKey
  );

  if (isConfigured) {
    console.log('✅ EmailJS configuration verified');
  } else {
    console.warn('⚠️ EmailJS not configured. Missing:');
    if (!EMAILJS_CONFIG.serviceId) console.warn('  - Service ID');
    if (!EMAILJS_CONFIG.templateId) console.warn('  - Template ID');
    if (!EMAILJS_CONFIG.publicKey) console.warn('  - Public Key');
  }

  return isConfigured;
}
