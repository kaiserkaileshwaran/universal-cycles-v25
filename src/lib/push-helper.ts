import { getFirebaseDatabase } from "@/firebase/firebase";
import { ref, get } from "firebase/database";

export async function sendPushNotification(title: string, body: string, url: string) {
  try {
    const dbRef = ref(getFirebaseDatabase(), "push_subscriptions");
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      const subsObj = snapshot.val();
      const subscriptions = Object.values(subsObj);
      
      if (subscriptions.length > 0) {
        await fetch("/api/push", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            body,
            url,
            subscriptions
          })
        });
      }
    }
  } catch (error) {
    console.error("Failed to trigger push notification", error);
  }
}
