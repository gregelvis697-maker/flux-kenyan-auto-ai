-- Create email_templates table for customizable email content
CREATE TABLE public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_type text NOT NULL UNIQUE,
  subject text NOT NULL,
  body_html text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can view email templates"
ON public.email_templates FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update email templates"
ON public.email_templates FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert email templates"
ON public.email_templates FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Insert default templates
INSERT INTO public.email_templates (template_type, subject, body_html) VALUES
('approval', 'Your Flux Account Has Been Approved! 🎉', '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1a1a2e, #16213e); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .role-badge { background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; }
    .cta-button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 20px; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Flux!</h1>
    </div>
    <div class="content">
      <p>Hello {{name}},</p>
      <p>Great news! Your account has been approved as a <span class="role-badge">{{role}}</span>.</p>
      <p>You now have full access to all platform features. Log in to get started!</p>
      <a href="{{login_url}}" class="cta-button">Log In Now</a>
    </div>
    <div class="footer">
      <p>© 2024 Flux. All rights reserved.</p>
    </div>
  </div>
</body>
</html>'),
('rejection', 'Update on Your Flux Application', '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1a1a2e, #16213e); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .reason-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Application Update</h1>
    </div>
    <div class="content">
      <p>Hello {{name}},</p>
      <p>We regret to inform you that your application for <strong>{{role}}</strong> has not been approved at this time.</p>
      <div class="reason-box">
        <strong>Reason:</strong>
        <p>{{reason}}</p>
      </div>
      <p>If you believe this was an error or have questions, please contact our support team.</p>
    </div>
    <div class="footer">
      <p>© 2024 Flux. All rights reserved.</p>
    </div>
  </div>
</body>
</html>');