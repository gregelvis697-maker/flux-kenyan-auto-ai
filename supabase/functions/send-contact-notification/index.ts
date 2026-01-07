import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactNotificationRequest {
  contact_request_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { contact_request_id }: ContactNotificationRequest = await req.json();

    // Fetch the contact request with vehicle and dealer info
    const { data: contactRequest, error: fetchError } = await supabase
      .from("contact_requests")
      .select(`
        *,
        vehicles (
          id,
          make,
          model,
          year,
          price,
          dealer_id
        )
      `)
      .eq("id", contact_request_id)
      .single();

    if (fetchError || !contactRequest) {
      console.error("Error fetching contact request:", fetchError);
      return new Response(
        JSON.stringify({ error: "Contact request not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fetch dealer email from profiles
    const { data: dealerProfile, error: dealerError } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", contactRequest.vehicles.dealer_id)
      .single();

    if (dealerError || !dealerProfile) {
      console.error("Error fetching dealer profile:", dealerError);
      return new Response(
        JSON.stringify({ error: "Dealer not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const vehicle = contactRequest.vehicles;
    const vehicleName = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
    const formattedPrice = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(vehicle.price);

    // Send email to dealer
    const emailResponse = await resend.emails.send({
      from: "Flux Auto <notifications@resend.dev>",
      to: [dealerProfile.email],
      subject: `New Inquiry for ${vehicleName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0a0a0b; color: #fafafa; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #18181b; border-radius: 12px; overflow: hidden; border: 1px solid #27272a;">
            <div style="background: linear-gradient(135deg, #00d4ff, #00b4d8); padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; color: #0a0a0b;">New Vehicle Inquiry</h1>
            </div>
            <div style="padding: 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #a1a1aa;">
                Hello ${dealerProfile.full_name || 'Dealer'},
              </p>
              <p style="margin: 0 0 25px; font-size: 16px; line-height: 1.6; color: #fafafa;">
                You have received a new inquiry for your listing:
              </p>
              <div style="background-color: #27272a; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                <h2 style="margin: 0 0 10px; font-size: 20px; color: #00d4ff;">${vehicleName}</h2>
                <p style="margin: 0; font-size: 18px; font-weight: bold; color: #22c55e;">${formattedPrice}</p>
              </div>
              <div style="background-color: #27272a; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                <h3 style="margin: 0 0 15px; font-size: 16px; color: #a1a1aa;">Buyer Information</h3>
                <p style="margin: 0 0 8px; font-size: 16px; color: #fafafa;"><strong>Name:</strong> ${contactRequest.buyer_name}</p>
                <p style="margin: 0 0 8px; font-size: 16px; color: #fafafa;"><strong>Email:</strong> <a href="mailto:${contactRequest.buyer_email}" style="color: #00d4ff;">${contactRequest.buyer_email}</a></p>
                ${contactRequest.buyer_phone ? `<p style="margin: 0 0 8px; font-size: 16px; color: #fafafa;"><strong>Phone:</strong> <a href="tel:${contactRequest.buyer_phone}" style="color: #00d4ff;">${contactRequest.buyer_phone}</a></p>` : ''}
              </div>
              <div style="background-color: #27272a; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                <h3 style="margin: 0 0 15px; font-size: 16px; color: #a1a1aa;">Message</h3>
                <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #fafafa;">${contactRequest.message}</p>
              </div>
              <p style="margin: 0; font-size: 14px; color: #71717a; text-align: center;">
                Please respond promptly to maintain good customer relations.
              </p>
            </div>
            <div style="background-color: #27272a; padding: 20px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #71717a;">
                © 2026 Flux Auto. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    // Log the email
    await supabase.from("email_logs").insert({
      recipient_email: dealerProfile.email,
      recipient_user_id: contactRequest.vehicles.dealer_id,
      email_type: "contact_request_notification",
      status: "sent",
      sent_at: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-contact-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
