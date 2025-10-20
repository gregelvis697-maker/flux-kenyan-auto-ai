import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WaitlistRequest {
  name: string;
  email: string;
  role: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, role }: WaitlistRequest = await req.json();

    console.log("Processing waitlist signup:", { name, email, role });

    // Validate input
    if (!name || !email || !role) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!["dealer", "buyer", "importer"].includes(role)) {
      return new Response(
        JSON.stringify({ error: "Invalid role" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert into waitlist table
    const { data: waitlistEntry, error: dbError } = await supabase
      .from("waitlist")
      .insert({ name, email, role })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      
      // Check if it's a duplicate email error
      if (dbError.code === "23505") {
        return new Response(
          JSON.stringify({ error: "This email is already on the waitlist" }),
          {
            status: 409,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      throw dbError;
    }

    console.log("Waitlist entry created:", waitlistEntry);

    // Send confirmation email to user
    try {
      const userEmailResponse = await resend.emails.send({
        from: "Flux MVP <onboarding@resend.dev>",
        to: [email],
        subject: "Welcome to Flux MVP Waitlist!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Welcome to Flux MVP, ${name}!</h1>
            <p>Thank you for joining our waitlist as a <strong>${role}</strong>.</p>
            <p>We're excited to revolutionize the automotive industry in Kenya with AI-powered solutions.</p>
            <p>You'll be among the first to know when we launch!</p>
            <p style="margin-top: 30px;">Best regards,<br>The Flux Team</p>
          </div>
        `,
      });

      console.log("Confirmation email sent to user:", userEmailResponse);
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
      // Don't fail the whole request if email fails
    }

    // Send notification email to Flux team
    try {
      const teamEmailResponse = await resend.emails.send({
        from: "Flux Waitlist <onboarding@resend.dev>",
        to: ["hello@flux.co.ke"],
        subject: "New Waitlist Signup",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">New Waitlist Signup</h1>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Role:</strong> ${role}</p>
            <p><strong>Signed up at:</strong> ${new Date().toLocaleString()}</p>
          </div>
        `,
      });

      console.log("Notification email sent to team:", teamEmailResponse);
    } catch (emailError) {
      console.error("Error sending notification email:", emailError);
      // Don't fail the whole request if email fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Successfully joined the waitlist!",
        data: waitlistEntry
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in waitlist-signup function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
