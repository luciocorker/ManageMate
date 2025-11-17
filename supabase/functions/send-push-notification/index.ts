// Supabase Edge Function to send push notifications via Expo
// Deploy with: supabase functions deploy send-push-notification

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const EXPO_PUSH_ENDPOINT = "https://exp.host/--/api/v2/push/send";

interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: any;
  sound?: string;
  badge?: number;
  priority?: "default" | "normal" | "high";
  channelId?: string;
}

serve(async (req) => {
  try {
    const { notificationId } = await req.json();

    if (!notificationId) {
      return new Response(
        JSON.stringify({ error: "notificationId is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the notification details
    const { data: notification, error: notifError } = await supabase
      .from("notifications")
      .select("*")
      .eq("id", notificationId)
      .single();

    if (notifError || !notification) {
      console.error("Notification not found:", notifError);
      return new Response(
        JSON.stringify({ error: "Notification not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get user's push tokens
    const { data: tokens, error: tokenError } = await supabase
      .from("push_tokens")
      .select("token")
      .eq("user_id", notification.user_id);

    if (tokenError || !tokens || tokens.length === 0) {
      console.log("No push tokens found for user:", notification.user_id);
      return new Response(
        JSON.stringify({ message: "No push tokens found" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Prepare push messages
    const messages: PushMessage[] = tokens.map((tokenRow) => ({
      to: tokenRow.token,
      title: notification.title,
      body: notification.body,
      data: notification.data || {},
      sound: "default",
      priority: "high",
      channelId: "default",
    }));

    // Send push notifications to Expo
    const response = await fetch(EXPO_PUSH_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Expo push failed:", result);
      return new Response(
        JSON.stringify({ error: "Failed to send push notification", details: result }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("Push notifications sent successfully:", result);

    return new Response(
      JSON.stringify({ success: true, result }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-push-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
