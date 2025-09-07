const nodemailer = require('nodemailer');

// Create email transporter (using Gmail as example - can be configured for other providers)
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send meeting invitation email
const sendMeetingInvitation = async (req, res) => {
  try {
    const { 
      attendeeEmail, 
      meetingTitle, 
      meetingDate, 
      meetingTime, 
      meetingId, 
      hostName,
      meetingLink 
    } = req.body;

    const transporter = createTransporter();

    // Email template
    const emailTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">MeetingMind Invitation</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">You're invited to join a meeting</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #667eea; margin-top: 0;">${meetingTitle}</h3>
            <p><strong>Host:</strong> ${hostName}</p>
            <p><strong>Date:</strong> ${meetingDate}</p>
            <p><strong>Time:</strong> ${meetingTime}</p>
            <p><strong>Meeting ID:</strong> ${meetingId}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${meetingLink}" 
               style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Join Meeting
            </a>
          </div>
          
          <div style="background: #e9ecef; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <h4 style="margin-top: 0; color: #495057;">Meeting Features:</h4>
            <ul style="color: #6c757d; margin-bottom: 0;">
              <li>Live AI-powered transcription</li>
              <li>Automatic meeting insights and summaries</li>
              <li>Real-time collaboration tools</li>
              <li>Action item tracking</li>
            </ul>
          </div>
          
          <p style="color: #6c757d; font-size: 14px; margin-top: 30px;">
            This invitation was sent via MeetingMind. If you have any issues joining the meeting, 
            please contact the meeting host.
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"MeetingMind" <${process.env.EMAIL_USER}>`,
      to: attendeeEmail,
      subject: `Meeting Invitation: ${meetingTitle}`,
      html: emailTemplate
    };

    const info = await transporter.sendMail(mailOptions);
    
    res.status(200).json({
      success: true,
      message: `Invitation sent successfully to ${attendeeEmail}`,
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Error sending invitation:', error);
    console.error('Email config:', {
      user: process.env.EMAIL_USER ? 'Set' : 'Not set',
      pass: process.env.EMAIL_PASS ? 'Set' : 'Not set'
    });
    res.status(500).json({
      success: false,
      message: 'Failed to send invitation',
      error: error.message
    });
  }
};

// Send bulk invitations
const sendBulkInvitations = async (req, res) => {
  try {
    const { attendees, meetingDetails } = req.body;
    const results = [];

    for (const attendeeEmail of attendees) {
      try {
        const inviteData = {
          attendeeEmail,
          ...meetingDetails
        };

        // Reuse the single invitation logic
        await sendMeetingInvitation({ body: inviteData }, { 
          status: () => ({ json: () => {} }),
          json: () => {}
        });

        results.push({
          email: attendeeEmail,
          status: 'sent',
          success: true
        });
      } catch (error) {
        results.push({
          email: attendeeEmail,
          status: 'failed',
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;

    res.status(200).json({
      success: true,
      message: `Sent ${successCount} invitations successfully, ${failCount} failed`,
      results
    });

  } catch (error) {
    console.error('Error sending bulk invitations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send bulk invitations',
      error: error.message
    });
  }
};

module.exports = {
  sendMeetingInvitation,
  sendBulkInvitations
};
