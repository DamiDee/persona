import { writeFile } from "node:fs/promises";

const [route = "home", output = "/tmp/persona-audit.png", theme = "dark", viewport = "desktop"] = process.argv.slice(2);
const pages = await fetch("http://127.0.0.1:9223/json/list").then((response) => response.json());
console.log("pages", pages.length);
const page = pages.find((item) => item.type === "page");
if (!page) throw new Error("No page target found");

const socket = new WebSocket(page.webSocketDebuggerUrl);
const pending = new Map();
let id = 0;

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (!message.id || !pending.has(message.id)) return;
  const task = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) task.reject(new Error(message.error.message));
  else task.resolve(message.result);
});

await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});
console.log("connected");

const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const messageId = ++id;
    pending.set(messageId, { resolve, reject });
    socket.send(JSON.stringify({ id: messageId, method, params }));
  });

const isMobile = viewport === "mobile";
await send("Emulation.setDeviceMetricsOverride", {
  width: isMobile ? 390 : 1440,
  height: isMobile ? 844 : 1200,
  deviceScaleFactor: isMobile ? 2 : 1,
  mobile: isMobile,
});

await send("Runtime.evaluate", {
  expression: `localStorage.setItem("persona-theme", JSON.stringify({ state: { theme: ${JSON.stringify(theme)} }, version: 0 }))`,
});

let url = "http://127.0.0.1:5173/";
if (route === "login") url += "login";
if (route.startsWith("chat")) {
  await send("Runtime.evaluate", {
    expression: `localStorage.setItem("persona-auth", JSON.stringify({ state: { user: { name: "Demo User", email: "demo@example.com", plan: "free" }, isAuthenticated: true }, version: 0 }))`,
  });
  if (route === "chat-empty") {
    await send("Runtime.evaluate", {
      expression: `localStorage.setItem("persona-chats", JSON.stringify({ state: { conversations: [{ id: "chat-empty", personaId: "persona-01", title: "New conversation", lastMessage: "", updatedAt: new Date().toISOString(), messages: [] }], activeConversationId: "chat-empty", activePersonaId: "persona-01" }, version: 0 }))`,
    });
    url += "app/chat/chat-empty";
  } else {
    await send("Runtime.evaluate", { expression: `localStorage.removeItem("persona-chats")` });
    url += "app/chat/chat-01";
  }
}

await send("Page.navigate", { url });
console.log("navigated", url);
await new Promise((resolve) => setTimeout(resolve, 2800));
const capture = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
await writeFile(output, Buffer.from(capture.data, "base64"));
console.log("saved", output);
socket.close();
