import { NextResponse } from "next/server";
import webpush from "web-push";

const publicVapidKey = "BHlYLUDGSORDJcFzmFUaWCNABgrQp69NAs8a0kyh50exPuZMURV6nl6MMWia8BPd9YdGWw6ObjF671en25-NtZ8";
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || "TOz5K6pa0O831UMBIO9kNcw-i0ASsA10WA_-gZrUYME";

webpush.setVapidDetails(
  "mailto:test@example.com",
  publicVapidKey,
  privateVapidKey
);

export async function POST(req: Request) {
  try {
    const { title, body, url, subscriptions } = await req.json();

    if (!subscriptions || !Array.isArray(subscriptions)) {
      return NextResponse.json({ error: "No subscriptions provided" }, { status: 400 });
    }

    const payload = JSON.stringify({
      title: title.startsWith("Universal Cycles") ? title : `Universal Cycles: ${title}`,
      body,
      url: url || "/",
      icon: "/cycle.png" // Using PNG for better OS compatibility in notifications
    });

    const sendPromises = subscriptions.map((sub) =>
      webpush.sendNotification(sub, payload).catch((e) => {
        console.error("Error sending to subscription", sub.endpoint, e);
        return null;
      })
    );

    await Promise.all(sendPromises);

    return NextResponse.json({ success: true, message: `Sent push to ${subscriptions.length} subscribers.` });
  } catch (error) {
    console.error("Push Error:", error);
    return NextResponse.json({ error: "Failed to send push notification" }, { status: 500 });
  }
}
