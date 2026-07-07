import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";
import { z } from "https://esm.sh/zod@3.23.8";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const RequestSchema = z.object({
  recipientEmail: z.string().trim().email().max(255),
  recipientName: z.string().trim().max(200).optional().default(""),
  recipientUserId: z.string().uuid(),
  role: z.enum(["buyer", "dealer", "importer", "admin"]),
  action: z.enum(["approved", "rejected"]),
  rejectionReason: z.string().trim().max(1000).optional(),
});

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

interface EmailTemplate {
  template_type: string;
  subject: string;
  body_html: string;
}

// HTML escape function for security
const escapeHtml = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Fallback templates in case database is unavailable
const getFallbackApprovalHtml = (name: string, role: string) => `
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
        Hello ${escapeHtml(name) || 'there'},<br><br>
        Great news! Your Flux account has been verified as a <span class="role-badge">${escapeHtml(role)}</span>.<br><br>
        You now have full access to all ${escapeHtml(role)} features on the Flux platform.
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

const getFallbackRejectionHtml = (name: string, role: string, reason: string) => `
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
        Hello ${escapeHtml(name) || 'there'},<br><br>
        We regret to inform you that your application to join Flux as a ${escapeHtml(role)} has not been approved at this time.
      </p>
      <div class="reason-box">
        <div class="reason-title">Reason:</div>
        <div class="reason-text">${escapeHtml(reason)}</div>
      </div>
      <p class="message">
        If you believe this was a mistake, please contact our support team.
      </p>
    </div>
    <div class="footer">
      <p>© 2024 Flux Automotive. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// Replace template variables with actual values
const replaceTemplateVariables = (html: string, variables: Record<string, string>): string => {
  let result = html;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, escapeHtml(value));
  }
  return result;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Require an authenticated admin caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    const { data: isAdmin } = await supabaseClient.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Validate input
    const parsed = RequestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    const { recipientEmail, recipientName, recipientUserId, role, action, rejectionReason } = parsed.data;

    console.log(`Processing ${action} email for ${recipientEmail} (${role})`);

    // Determine the template type to use (role-specific first, then fallback to generic)
    const roleSpecificType = `${role}_${action}`;
    const genericType = action;

    // Try to fetch role-specific template first, then generic
    let template: EmailTemplate | null = null;
    
    const { data: roleTemplate } = await supabaseClient
      .from('email_templates')
      .select('template_type, subject, body_html')
      .eq('template_type', roleSpecificType)
      .maybeSingle();

    if (roleTemplate) {
      template = roleTemplate;
      console.log(`Using role-specific template: ${roleSpecificType}`);
    } else {
      const { data: genericTemplate } = await supabaseClient
        .from('email_templates')
        .select('template_type, subject, body_html')
        .eq('template_type', genericType)
        .maybeSingle();
      
      if (genericTemplate) {
        template = genericTemplate;
        console.log(`Using generic template: ${genericType}`);
      }
    }

    // Prepare template variables
    const siteUrl = Deno.env.get('SITE_URL') || 'https://flux-auto.lovable.app';
    const variables: Record<string, string> = {
      name: recipientName || 'there',
      role: role,
      login_url: `${siteUrl}/auth`,
      reason: rejectionReason || 'No specific reason provided',
    };

    let subject: string;
    let html: string;

    if (template) {
      // Use database template
      subject = replaceTemplateVariables(template.subject, variables);
      html = replaceTemplateVariables(template.body_html, variables);
    } else {
      // Use fallback templates
      console.log('No template found in database, using fallback');
      subject = action === 'approved' 
        ? "🎉 Your Flux Account Has Been Verified!"
        : "Flux Application Status Update";
      html = action === 'approved'
        ? getFallbackApprovalHtml(recipientName, role)
        : getFallbackRejectionHtml(recipientName, role, rejectionReason || 'No specific reason provided');
    }

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
        email_type: `verification_${action}_${role}`,
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
