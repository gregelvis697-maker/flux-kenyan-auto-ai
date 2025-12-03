-- Add role-specific email templates
INSERT INTO public.email_templates (template_type, subject, body_html) VALUES
('dealer_approval', 'Welcome to Flux - Your Dealer Account is Approved! 🚗', '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; }
    .content { padding: 30px; }
    .role-badge { background: #3b82f6; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; }
    .feature-list { background: #f0f9ff; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .feature-list li { margin: 10px 0; color: #1e40af; }
    .cta-button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 20px; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚗 Welcome, Dealer!</h1>
    </div>
    <div class="content">
      <p>Hello {{name}},</p>
      <p>Great news! Your <span class="role-badge">Dealer</span> account has been approved.</p>
      <div class="feature-list">
        <h3>As a dealer, you can now:</h3>
        <ul>
          <li>📋 Create and manage vehicle import requests</li>
          <li>🚚 Track shipment status in real-time</li>
          <li>📊 View your import history and analytics</li>
          <li>🤝 Connect with verified importers</li>
        </ul>
      </div>
      <p>Start by creating your first import request to find the perfect vehicles for your inventory.</p>
      <a href="{{login_url}}" class="cta-button">Access Your Dashboard</a>
    </div>
    <div class="footer">
      <p>© 2024 Flux. Your trusted automotive import platform.</p>
    </div>
  </div>
</body>
</html>'),
('importer_approval', 'Welcome to Flux - Your Importer Account is Approved! 🌍', '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #065f46, #10b981); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; }
    .content { padding: 30px; }
    .role-badge { background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; }
    .feature-list { background: #ecfdf5; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .feature-list li { margin: 10px 0; color: #065f46; }
    .cta-button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 20px; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌍 Welcome, Importer!</h1>
    </div>
    <div class="content">
      <p>Hello {{name}},</p>
      <p>Great news! Your <span class="role-badge">Importer</span> account has been approved.</p>
      <div class="feature-list">
        <h3>As an importer, you can now:</h3>
        <ul>
          <li>🔍 Browse available import requests from dealers</li>
          <li>✅ Accept and fulfill vehicle import orders</li>
          <li>📦 Manage shipments and update delivery status</li>
          <li>💰 Track earnings and transaction history</li>
        </ul>
      </div>
      <p>Start exploring available requests and grow your import business today.</p>
      <a href="{{login_url}}" class="cta-button">View Available Requests</a>
    </div>
    <div class="footer">
      <p>© 2024 Flux. Your trusted automotive import platform.</p>
    </div>
  </div>
</body>
</html>'),
('dealer_rejection', 'Update on Your Flux Dealer Application', '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .reason-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
    .next-steps { background: #f0f9ff; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Dealer Application Update</h1>
    </div>
    <div class="content">
      <p>Hello {{name}},</p>
      <p>We have reviewed your dealer application and unfortunately we are unable to approve it at this time.</p>
      <div class="reason-box">
        <strong>Reason:</strong>
        <p>{{reason}}</p>
      </div>
      <div class="next-steps">
        <h3>What you can do:</h3>
        <ul>
          <li>Review the feedback provided above</li>
          <li>Ensure your business documentation is complete</li>
          <li>Contact our support team for clarification</li>
          <li>Reapply once issues have been addressed</li>
        </ul>
      </div>
    </div>
    <div class="footer">
      <p>© 2024 Flux. Questions? Contact support@flux.com</p>
    </div>
  </div>
</body>
</html>'),
('importer_rejection', 'Update on Your Flux Importer Application', '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #065f46, #10b981); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .reason-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
    .next-steps { background: #ecfdf5; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Importer Application Update</h1>
    </div>
    <div class="content">
      <p>Hello {{name}},</p>
      <p>We have reviewed your importer application and unfortunately we are unable to approve it at this time.</p>
      <div class="reason-box">
        <strong>Reason:</strong>
        <p>{{reason}}</p>
      </div>
      <div class="next-steps">
        <h3>What you can do:</h3>
        <ul>
          <li>Review the feedback provided above</li>
          <li>Verify your import licenses and certifications</li>
          <li>Contact our support team for clarification</li>
          <li>Reapply once issues have been addressed</li>
        </ul>
      </div>
    </div>
    <div class="footer">
      <p>© 2024 Flux. Questions? Contact support@flux.com</p>
    </div>
  </div>
</body>
</html>');