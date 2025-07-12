export const welcomeEmailTemplates = {
  artist: {
    subject: "Welcome to Art Souk - Your Creative Journey Begins",
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #7c3aed; font-size: 28px; margin-bottom: 10px;">Welcome to Art Souk</h1>
          <p style="color: #d97706; font-size: 16px; margin: 0;">سوق آرت</p>
        </div>
        
        <h2 style="color: #1f2937; font-size: 24px; margin-bottom: 20px;">Welcome to the GCC's Premier Art Platform</h2>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
          Your artist profile is now live and ready to connect with collectors across the region. 
          You've joined a community of established artists who are successfully showcasing their work 
          and building meaningful relationships with collectors.
        </p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
          <h3 style="color: #7c3aed; font-size: 20px; margin-bottom: 15px;">🎨 Next Steps to Maximize Your Success:</h3>
          <ul style="color: #4b5563; font-size: 16px; line-height: 1.8;">
            <li>Upload 3-5 of your best artworks with high-quality photos</li>
            <li>Complete your artist biography and artistic journey</li>
            <li>Add your payment preferences for seamless transactions</li>
            <li>Connect your social media accounts to build your presence</li>
          </ul>
        </div>
        
        <div style="background: #fef3c7; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
          <h3 style="color: #d97706; font-size: 20px; margin-bottom: 15px;">💡 Pro Tips from Successful Artists:</h3>
          <ul style="color: #92400e; font-size: 16px; line-height: 1.8;">
            <li><strong>High-quality photos increase inquiries by 300%</strong> - Professional lighting makes all the difference</li>
            <li><strong>Complete profiles get 5x more collector interest</strong> - Share your artistic story</li>
            <li><strong>Regular uploads keep you visible</strong> - New work keeps collectors engaged</li>
            <li><strong>Respond quickly to inquiries</strong> - Fast responses build trust and close sales</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.PLATFORM_URL || 'https://artsouk.com'}/artworks/manage" 
             style="background: linear-gradient(135deg, #7c3aed 0%, #d97706 100%); 
                    color: white; 
                    padding: 15px 30px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    font-weight: bold; 
                    font-size: 16px; 
                    display: inline-block;">
            Complete Your Artist Profile →
          </a>
        </div>
        
        <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            Need help getting started? Our team is here to support your artistic journey. 
            Reply to this email with any questions, and we'll get back to you within 24 hours.
          </p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 15px;">
            Best regards,<br>
            The Art Souk Team
          </p>
        </div>
      </div>
    `,
    followUpSchedule: [3, 7, 14] // Days for follow-up emails
  },
  
  gallery: {
    subject: "Welcome to Art Souk - Amplify Your Gallery's Reach",
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #7c3aed; font-size: 28px; margin-bottom: 10px;">Welcome to Art Souk</h1>
          <p style="color: #d97706; font-size: 16px; margin: 0;">سوق آرت</p>
        </div>
        
        <h2 style="color: #1f2937; font-size: 24px; margin-bottom: 20px;">Your Digital Gallery Space is Ready</h2>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
          Welcome to the platform connecting galleries with collectors across the GCC. 
          Your gallery profile is now live and ready to showcase your artists to a broader audience 
          beyond your physical location.
        </p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
          <h3 style="color: #7c3aed; font-size: 20px; margin-bottom: 15px;">🏛️ Maximize Your Gallery's Impact:</h3>
          <ul style="color: #4b5563; font-size: 16px; line-height: 1.8;">
            <li>Invite your represented artists to join the platform</li>
            <li>Create your first virtual exhibition to showcase collections</li>
            <li>Complete your gallery verification for enhanced credibility</li>
            <li>Schedule upcoming events and workshops</li>
            <li>Connect with other galleries in the network</li>
          </ul>
        </div>
        
        <div style="background: #ecfdf5; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
          <h3 style="color: #059669; font-size: 20px; margin-bottom: 15px;">📈 Gallery Success Stories:</h3>
          <p style="color: #047857; font-size: 16px; line-height: 1.6;">
            Galleries on our platform report <strong>40% increase in collector inquiries</strong> 
            and expanded reach beyond their local market. Many have successfully hosted virtual 
            exhibitions that attracted international attention and new collector relationships.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.PLATFORM_URL || 'https://artsouk.com'}/manage/artists" 
             style="background: linear-gradient(135deg, #7c3aed 0%, #d97706 100%); 
                    color: white; 
                    padding: 15px 30px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    font-weight: bold; 
                    font-size: 16px; 
                    display: inline-block;">
            Set Up Your Gallery →
          </a>
        </div>
        
        <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            Ready to showcase your artists to a wider audience? Our gallery success team is 
            here to help you maximize your platform presence.
          </p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 15px;">
            Best regards,<br>
            The Art Souk Team
          </p>
        </div>
      </div>
    `,
    followUpSchedule: [3, 7] // Days for follow-up emails
  },
  
  collector: {
    subject: "Welcome to Art Souk - Your Art Discovery Begins",
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #7c3aed; font-size: 28px; margin-bottom: 10px;">Welcome to Art Souk</h1>
          <p style="color: #d97706; font-size: 16px; margin: 0;">سوق آرت</p>
        </div>
        
        <h2 style="color: #1f2937; font-size: 24px; margin-bottom: 20px;">Discover Authentic GCC Art</h2>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
          You now have access to the region's finest contemporary art collection. 
          Our platform connects you directly with verified artists and established galleries, 
          ensuring authenticity and quality in every piece you discover.
        </p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
          <h3 style="color: #7c3aed; font-size: 20px; margin-bottom: 15px;">🎨 Start Your Collection Journey:</h3>
          <ul style="color: #4b5563; font-size: 16px; line-height: 1.8;">
            <li>Browse curated artwork collections from top regional artists</li>
            <li>Follow your favorite artists to get updates on new works</li>
            <li>Set up artwork alerts for pieces matching your interests</li>
            <li>Connect directly with artists and galleries</li>
            <li>Participate in exclusive auctions and private sales</li>
          </ul>
        </div>
        
        <div style="background: #fef3c7; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
          <h3 style="color: #d97706; font-size: 20px; margin-bottom: 15px;">💎 Collector Benefits:</h3>
          <ul style="color: #92400e; font-size: 16px; line-height: 1.8;">
            <li><strong>Direct artist communication</strong> ensures authenticity and provenance</li>
            <li><strong>Flexible payment arrangements</strong> work with your preferences</li>
            <li><strong>Discover emerging talent</strong> before they gain international recognition</li>
            <li><strong>Support the growing GCC art community</strong> and cultural development</li>
            <li><strong>Access to exclusive events</strong> and private collection viewings</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.PLATFORM_URL || 'https://artsouk.com'}/artworks/featured" 
             style="background: linear-gradient(135deg, #7c3aed 0%, #d97706 100%); 
                    color: white; 
                    padding: 15px 30px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    font-weight: bold; 
                    font-size: 16px; 
                    display: inline-block;">
            Start Discovering Art →
          </a>
        </div>
        
        <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            Welcome to a community of passionate art collectors and cultural enthusiasts. 
            We're excited to help you discover your next favorite piece.
          </p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 15px;">
            Best regards,<br>
            The Art Souk Team
          </p>
        </div>
      </div>
    `,
    followUpSchedule: [3, 7] // Days for follow-up emails
  }
};