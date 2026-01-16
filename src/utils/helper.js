import axiosApi from "../config/axios";

export const subscribeForPush = async (userId) => {
  console.log({ userId });
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;

  const reg = await navigator.serviceWorker.ready;

  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      import.meta.env.VITE_VAPID_PUBLIC_KEY
    ),
  });

  await axiosApi.post("/save-subscription", {
    userId,
    subscription,
  });
};

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
