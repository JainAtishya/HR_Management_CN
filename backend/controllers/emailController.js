const nodemailer = require('nodemailer');
const EmailLog = require('../models/EmailLog');
const Member = require('../models/Member');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Email templates
  getEmailTemplate(type, data) {
    const templates = {
      onboarding: {
        subject: `Welcome to Coding Ninjas Club, ${data.memberName}! 🎉`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
            <div style="background: linear-gradient(135deg, #ff6b35 0%, #1e3a8a 50%, #1e293b 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">Welcome to Coding Ninjas Club!</h1>
            </div>
            
            <div style="background: white; padding: 30px; margin: 20px 0; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #1e3a8a; margin-top: 0;">Hi ${data.memberName}! 👋</h2>
              
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                Congratulations! You're now officially part of the <strong>Coding Ninjas Club</strong> family. We're excited to have you on board!
              </p>
              
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1e3a8a; margin-top: 0;">Your Details:</h3>
                <ul style="list-style: none; padding: 0; margin: 0;">
                  <li style="padding: 5px 0;"><strong>Name:</strong> ${data.memberName}</li>
                  <li style="padding: 5px 0;"><strong>Student ID:</strong> ${data.studentId}</li>
                  <li style="padding: 5px 0;"><strong>Department:</strong> ${data.department}</li>
                  <li style="padding: 5px 0;"><strong>Position:</strong> ${data.position}</li>
                  <li style="padding: 5px 0;"><strong>Join Date:</strong> ${new Date(data.joinDate).toLocaleDateString()}</li>
                </ul>
              </div>
              
              <h3 style="color: #1e3a8a;">What's Next? 🚀</h3>
              <ul style="color: #333; line-height: 1.6;">
                <li>Join our Discord/Slack community</li>
                <li>Attend our upcoming events and workshops</li>
                <li>Connect with fellow club members</li>
                <li>Start contributing to our projects</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="#" style="background: #ff6b35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Join Our Community</a>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                If you have any questions, feel free to reach out to us at 
                <a href="mailto:${process.env.FROM_EMAIL}" style="color: #1e3a8a;">${process.env.FROM_EMAIL}</a>
              </p>
            </div>
            
            <div style="text-align: center; color: #666; font-size: 12px; margin-top: 20px;">
              <p>© 2024 Coding Ninjas Club. All rights reserved.</p>
            </div>
          </div>
        `
      },
      
      warning: {
        subject: `Important Notice - Action Required`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
            <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">⚠️ Warning Notice</h1>
            </div>
            
            <div style="background: white; padding: 30px; margin: 20px 0; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #dc2626; margin-top: 0;">Dear ${data.memberName},</h2>
              
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                This is an official warning notice from the Coding Ninjas Club HR team.
              </p>
              
              <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0;">
                <h3 style="color: #dc2626; margin-top: 0;">${data.warningTitle}</h3>
                <p style="margin: 0; color: #333;">${data.warningDescription}</p>
              </div>
              
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #1e3a8a; margin-top: 0;">Warning Details:</h4>
                <ul style="list-style: none; padding: 0; margin: 0;">
                  <li style="padding: 5px 0;"><strong>Severity:</strong> ${data.severity}</li>
                  <li style="padding: 5px 0;"><strong>Category:</strong> ${data.category}</li>
                  <li style="padding: 5px 0;"><strong>Due Date:</strong> ${new Date(data.dueDate).toLocaleDateString()}</li>
                </ul>
              </div>
              
              <p style="color: #333; line-height: 1.6;">
                Please take immediate action to address this issue. If you have any questions or need clarification, 
                please contact the HR team as soon as possible.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="#" style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Contact HR Team</a>
              </div>
            </div>
            
            <div style="text-align: center; color: #666; font-size: 12px; margin-top: 20px;">
              <p>© 2024 Coding Ninjas Club. All rights reserved.</p>
            </div>
          </div>
        `
      },
      
      custom: {
        subject: data.subject || 'Message from Coding Ninjas Club',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
            <div style="background: linear-gradient(135deg, #ff6b35 0%, #1e3a8a 50%, #1e293b 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">Coding Ninjas Club</h1>
            </div>
            
            <div style="background: white; padding: 30px; margin: 20px 0; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #1e3a8a; margin-top: 0;">Hi ${data.memberName}!</h2>
              
              <div style="font-size: 16px; line-height: 1.6; color: #333;">
                ${data.content}
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                Best regards,<br>
                Coding Ninjas Club HR Team
              </p>
            </div>
            
            <div style="text-align: center; color: #666; font-size: 12px; margin-top: 20px;">
              <p>© 2024 Coding Ninjas Club. All rights reserved.</p>
            </div>
          </div>
        `
      }
    };

    return templates[type] || templates.custom;
  }

  async sendEmail(emailData) {
    try {
      const mailOptions = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        attachments: emailData.attachments || []
      };

      const result = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }
  }

  async sendOnboardingEmail(memberId, senderId) {
    try {
      const member = await Member.findById(memberId);
      if (!member) {
        throw new Error('Member not found');
      }

      const templateData = {
        memberName: member.name,
        studentId: member.studentId,
        department: member.department,
        position: member.position,
        joinDate: member.joinDate
      };

      const template = this.getEmailTemplate('onboarding', templateData);
      
      // Create email log
      const emailLog = new EmailLog({
        recipient: memberId,
        sender: senderId,
        emailType: 'Onboarding',
        subject: template.subject,
        body: template.html,
        templateUsed: 'onboarding',
        metadata: {
          source: 'Automated'
        }
      });

      const emailResult = await this.sendEmail({
        to: member.email,
        subject: template.subject,
        html: template.html
      });

      if (emailResult.success) {
        await emailLog.updateStatus('Sent');
      } else {
        await emailLog.updateStatus('Failed', { reason: emailResult.error });
        throw new Error(emailResult.error);
      }

      return { success: true, emailLog };
    } catch (error) {
      console.error('Send onboarding email error:', error);
      throw error;
    }
  }

  async sendWarningEmail(warningData, memberId, senderId) {
    try {
      const member = await Member.findById(memberId);
      if (!member) {
        throw new Error('Member not found');
      }

      const templateData = {
        memberName: member.name,
        warningTitle: warningData.title,
        warningDescription: warningData.description,
        severity: warningData.severity,
        category: warningData.category,
        dueDate: warningData.dueDate
      };

      const template = this.getEmailTemplate('warning', templateData);
      
      // Create email log
      const emailLog = new EmailLog({
        recipient: memberId,
        sender: senderId,
        emailType: 'Warning',
        subject: template.subject,
        body: template.html,
        templateUsed: 'warning',
        relatedWarning: warningData._id,
        metadata: {
          source: 'Automated'
        }
      });

      const emailResult = await this.sendEmail({
        to: member.email,
        subject: template.subject,
        html: template.html
      });

      if (emailResult.success) {
        await emailLog.updateStatus('Sent');
      } else {
        await emailLog.updateStatus('Failed', { reason: emailResult.error });
        throw new Error(emailResult.error);
      }

      return { success: true, emailLog };
    } catch (error) {
      console.error('Send warning email error:', error);
      throw error;
    }
  }

  async sendCustomEmail(emailData, senderId) {
    try {
      const results = [];
      
      for (const memberId of emailData.recipients) {
        const member = await Member.findById(memberId);
        if (!member) continue;

        const templateData = {
          memberName: member.name,
          subject: emailData.subject,
          content: emailData.body
        };

        const template = this.getEmailTemplate('custom', templateData);
        
        // Create email log
        const emailLog = new EmailLog({
          recipient: memberId,
          sender: senderId,
          emailType: emailData.emailType,
          subject: emailData.subject,
          body: emailData.body,
          templateUsed: emailData.templateUsed || 'custom',
          metadata: {
            source: 'Dashboard'
          }
        });

        const emailResult = await this.sendEmail({
          to: member.email,
          subject: emailData.subject,
          html: template.html
        });

        if (emailResult.success) {
          await emailLog.updateStatus('Sent');
        } else {
          await emailLog.updateStatus('Failed', { reason: emailResult.error });
        }

        results.push({
          member: member.name,
          email: member.email,
          success: emailResult.success,
          error: emailResult.error || null
        });
      }

      return { success: true, results };
    } catch (error) {
      console.error('Send custom email error:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();