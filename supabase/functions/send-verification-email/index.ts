import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationEmailRequest {
  recipientEmail: string;
  recipientName: string;
  recipientUserId: string;
  role: string;
  action: 'approved' | 'rejected';
  rejectionReason?: string;
}

const getApprovalEmailHtml = (name: string, role: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a1628; color: #ffffff; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; margin-bottom: 40px; }
    .logo { font-size: 32px; font-weight: bold; background: linear-gradient(135deg, #00d4ff, #0099ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .content { background: linear-gradient(180deg, #0f1f35 0%, #0a1628 100%); border-radius: 16px; padding: 40px; border: 1px solid rgba(0, 212, 255, 0.2); }
    .title { font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #00d4ff; }
    .message { font-size: 16px; line-height: 1.6; color: #a0aec0; margin-bottom: 30px; }
    .button { display: inline-block; background: linear-gradient(135deg, #00d4ff, #0099ff); color: #0a1628; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; }
    .footer { text-align: center; margin-top: 40px; color: #64748b; font-size: 14px; }
    .role-badge { display: inline-block; background: rgba(0, 212, 255, 0.1); color: #00d4ff; padding: 4px 12px; border-radius: 20px; font-size: 14px; text-transform: capitalize; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">FLUX</div>
    </div>
    <div class="content">
      <div class="title">🎉 Account Verified!</div>
      <p class="message">
        Hello ${name || 'there'},<br><br>
        Great news! Your Flux account has been verified as a <span class="role-badge">${role}</span>.<br><br>
        You now have full access to all ${role} features on the Flux platform. Start exploring and make the most of your new capabilities!
      </p>
      <a href="${Deno.env.get('SITE_URL') || 'https://flux-auto.lovable.app'}/auth" class="button">Login to Dashboard</a>
    </div>
    <div class="footer">
      <p>© 2024 Flux Automotive. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

const getRejectionEmailHtml = (name: string, role: string, reason: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a1628; color: #ffffff; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; margin-bottom: 40px; }
    .logo { font-size: 32px; font-weight: bold; background: linear-gradient(135deg, #00d4ff, #0099ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .content { background: linear-gradient(180deg, #0f1f35 0%, #0a1628 100%); border-radius: 16px; padding: 40px; border: 1px solid rgba(239, 68, 68, 0.2); }
    .title { font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #ef4444; }
    .message { font-size: 16px; line-height: 1.6; color: #a0aec0; margin-bottom: 20px; }
    .reason-box { background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; padding: 16px; border-radius: 0 8px 8px 0; margin: 20px 0; }
    .reason-title { font-weight: 600; color: #ef4444; margin-bottom: 8px; }
    .reason-text { color: #a0aec0; }
    .footer { text-align: center; margin-top: 40px; color: #64748b; font-size: 14px; }
    .role-badge { display: inline-block; background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 4px 12px; border-radius: 20px; font-size: 14px; text-transform: capitalize; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">FLUX</div>
    </div>
    <div class="content">
      <div class="title">Application Not Approved</div>
      <p class="message">
        Hello ${name || 'there'},<br><br>
        We regret to inform you that your application to join Flux as a <span class="role-badge">${role}</span> has not been approved at this time.
      </p>
      <div class="reason-box">
        <div class="reason-title">Reason:</div>
        <div class="reason-text">${reason}</div>
      </div>
      <p class="message">
        If you believe this was a mistake or have additional information to provide, please contact our support team.
      </p>
    </div>
    <div class="footer">
      <p>© 2024 Flux Automotive. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { recipientEmail, recipientName, recipientUserId, role, action, rejectionReason }: VerificationEmailRequest = await req.json();

    const subject = action === 'approved' 
      ? "🎉 Your Flux Account Has Been Verified!"
      : "Flux Application Status Update";

    const html = action === 'approved'
      ? getApprovalEmailHtml(recipientName, role)
      : getRejectionEmailHtml(recipientName, role, rejectionReason || 'No specific reason provided');

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "Flux <onboarding@resend.dev>",
      to: [recipientEmail],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    // Log the email in database
    const { error: logError } = await supabaseClient
      .from('email_logs')
      .insert({
        recipient_email: recipientEmail,
        recipient_user_id: recipientUserId,
        email_type: `verification_${action}`,
        status: 'sent',
        sent_at: new Date().toISOString(),
      });

    if (logError) {
      console.error("Error logging email:", logError);
    }

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-verification-email function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);