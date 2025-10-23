import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Validation schema
const waitlistSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  phone_number: z.string().trim().min(10, "Phone number must be at least 10 characters").max(20, "Phone number must be less than 20 characters"),
  role: z.enum(["dealer", "buyer", "importer"], { errorMap: () => ({ message: "Invalid role" }) })
});

// HTML sanitization to prevent XSS
const escapeHtml = (str: string): string => str
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

// Simple in-memory rate limiter (for production, use Redis or Supabase)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 3600000; // 1 hour in milliseconds
const RATE_LIMIT_MAX = 3; // Maximum 3 submissions per hour

const checkRateLimit = (identifier: string): boolean => {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    // Create new record or reset expired one
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting check
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
               req.headers.get('cf-connecting-ip') || 
               'unknown';
    
    if (!checkRateLimit(ip)) {
      console.log("Rate limit exceeded", { ip });
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Parse and validate input
    const rawData = await req.json();
    const validatedData = waitlistSchema.parse(rawData);

    console.log("Processing waitlist signup", { role: validatedData.role });

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      db: { schema: 'api' }
    });

    // Insert into waitlist table
    const { data: waitlistEntry, error: dbError } = await supabase
      .from("waitlist")
      .insert({ 
        name: validatedData.name, 
        email: validatedData.email, 
        phone_number: validatedData.phone_number,
        role: validatedData.role 
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error code:", dbError.code);
      
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

      // Generic error for client
      return new Response(
        JSON.stringify({ error: "Unable to process your request. Please try again." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Waitlist entry created with ID:", waitlistEntry.id);

    // Sanitize data for email HTML
    const safeName = escapeHtml(validatedData.name);
    const safeRole = escapeHtml(validatedData.role);
    const safeEmail = escapeHtml(validatedData.email);
    const safePhone = escapeHtml(validatedData.phone_number);

    // Send confirmation email to user
    try {
      await resend.emails.send({
        from: "Flux MVP <onboarding@resend.dev>",
        to: [validatedData.email],
        subject: "Welcome to Flux MVP Waitlist!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Welcome to Flux MVP, ${safeName}!</h1>
            <p>Thank you for joining our waitlist as a <strong>${safeRole}</strong>.</p>
            <p>We're excited to revolutionize the automotive industry in Kenya with AI-powered solutions.</p>
            <p>You'll be among the first to know when we launch!</p>
            <p style="margin-top: 30px;">Best regards,<br>The Flux Team</p>
          </div>
        `,
      });
      console.log("Confirmation email sent successfully");
    } catch (emailError) {
      console.error("Error sending confirmation email");
      // Don't fail the whole request if email fails
    }

    // Send notification email to Flux team
    try {
      await resend.emails.send({
        from: "Flux Waitlist <onboarding@resend.dev>",
        to: ["losern687@gmail.com"],
        subject: "New Waitlist Signup",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">New Waitlist Signup</h1>
            <p><strong>Name:</strong> ${safeName}</p>
            <p><strong>Email:</strong> ${safeEmail}</p>
            <p><strong>Phone:</strong> ${safePhone}</p>
            <p><strong>Role:</strong> ${safeRole}</p>
            <p><strong>Signed up at:</strong> ${new Date().toLocaleString()}</p>
          </div>
        `,
      });
      console.log("Notification email sent to team successfully");
    } catch (emailError) {
      console.error("Error sending notification email");
      // Don't fail the whole request if email fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Successfully joined the waitlist!"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      console.log("Validation error occurred");
      return new Response(
        JSON.stringify({ 
          error: error.errors[0]?.message || "Invalid input data"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.error("Unexpected error occurred");
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred. Please try again." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
