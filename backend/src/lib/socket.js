import { Server } from "socket.io";
import http from "http";
import express from "express";
import { randomUUID } from "crypto";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  },
});

const userSocketMap = new Map();
const waitingAnonymousUsers = new Set();
const anonymousPartners = new Map();
const anonymousRooms = new Map();
const anonymousBotSessions = new Map();
const anonymousBotTimers = new Map();
const blockedAnonymousPairs = new Set();
const anonymousMessageWindows = new Map();
const anonymousBots = [
  { name: "Stranger", greeting: "Hey! I’m an automated chat partner. What would you like to talk about?" },
  { name: "Stranger", greeting: "Hi there! I’m an automated chat partner. Tell me something you’re interested in!" },
  { name: "Stranger", greeting: "Hello! I’m an automated chat buddy. How’s your day going?" },
];
let nextBotIndex = 0;

export function getReceiverSocketId(receiverId) {
  return userSocketMap.get(receiverId);
}

const pairKey = (firstId, secondId) => [firstId, secondId].sort().join(":");

const getBotReply = (text, replyNumber) => {
  const normalizedText = text.toLowerCase();
  if (/\b(hi|hello|hey|hiya)\b/.test(normalizedText)) {
    return ["Hey again! What’s on your mind?", "Hi! Tell me a little more about yourself.", "Hello! What do you enjoy doing?"][replyNumber % 3];
  }
  if (/\b(how are you|how's it going|how are things)\b/.test(normalizedText)) {
    return ["I’m doing well—thanks for asking! How about you?", "All good in bot world! What have you been up to?", "Doing great! Got anything fun planned?"][replyNumber % 3];
  }
  if (/\b(name|who are you|are you (a )?bot|human)\b/.test(normalizedText)) {
    return "I’m an automated chat bot, not a human. I’m here to help you try out PingMe’s chat!";
  }
  if (/\b(weather|weekend|today|plans)\b/.test(normalizedText)) {
    return ["That sounds interesting! What do you like doing in your free time?", "Nice! Got any hobbies you’re excited about lately?", "I’d love to hear more—what do you enjoy most about it?"][replyNumber % 3];
  }
  if (normalizedText.includes("?")) {
    return ["Good question! I’m a simple demo bot, but I’m happy to keep chatting.", "I’m not sure, but tell me what you think!", "That’s interesting. What made you wonder about that?"][replyNumber % 3];
  }
  return ["That sounds interesting! Tell me more.", "I hear you. What happened next?", "Nice! What else is on your mind?", "Thanks for sharing that with me."][replyNumber % 4];
};

const endAnonymousChat = (socket, notifyPartner = true) => {
  const botSession = anonymousBotSessions.get(socket.id);
  if (botSession) {
    anonymousBotSessions.delete(socket.id);
    if (notifyPartner) socket.emit("anonymous:partner-left");
    return;
  }

  const partnerId = anonymousPartners.get(socket.id);
  const roomId = anonymousRooms.get(socket.id);
  if (!partnerId) return;

  anonymousPartners.delete(socket.id);
  anonymousPartners.delete(partnerId);
  anonymousRooms.delete(socket.id);
  anonymousRooms.delete(partnerId);
  socket.leave(roomId);
  io.sockets.sockets.get(partnerId)?.leave(roomId);

  if (notifyPartner) {
    io.to(partnerId).emit("anonymous:partner-left");
  }
};

const matchAnonymousUsers = () => {
  const waitingIds = [...waitingAnonymousUsers].filter((socketId) =>
    io.sockets.sockets.has(socketId),
  );

  for (let index = waitingIds.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [waitingIds[index], waitingIds[randomIndex]] = [waitingIds[randomIndex], waitingIds[index]];
  }

  for (let firstIndex = 0; firstIndex < waitingIds.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < waitingIds.length; secondIndex += 1) {
      const firstId = waitingIds[firstIndex];
      const secondId = waitingIds[secondIndex];
      if (blockedAnonymousPairs.has(pairKey(firstId, secondId))) continue;

      const firstSocket = io.sockets.sockets.get(firstId);
      const secondSocket = io.sockets.sockets.get(secondId);
      if (!firstSocket || !secondSocket) continue;

      const roomId = `anonymous:${randomUUID()}`;
      waitingAnonymousUsers.delete(firstId);
      waitingAnonymousUsers.delete(secondId);
      clearTimeout(anonymousBotTimers.get(firstId));
      clearTimeout(anonymousBotTimers.get(secondId));
      anonymousBotTimers.delete(firstId);
      anonymousBotTimers.delete(secondId);
      anonymousPartners.set(firstId, secondId);
      anonymousPartners.set(secondId, firstId);
      anonymousRooms.set(firstId, roomId);
      anonymousRooms.set(secondId, roomId);
      firstSocket.join(roomId);
      secondSocket.join(roomId);
      firstSocket.emit("anonymous:matched", { stranger: "Stranger" });
      secondSocket.emit("anonymous:matched", { stranger: "Stranger" });
      return;
    }
  }
};

const matchWithBot = (socket) => {
  anonymousBotTimers.delete(socket.id);
  if (!waitingAnonymousUsers.has(socket.id) || !socket.connected) return;

  waitingAnonymousUsers.delete(socket.id);
  const bot = anonymousBots[nextBotIndex % anonymousBots.length];
  nextBotIndex += 1;
  anonymousBotSessions.set(socket.id, { ...bot, replyCount: 0 });
  socket.emit("anonymous:matched", { stranger: bot.name, isBot: true });
  setTimeout(() => {
    if (anonymousBotSessions.has(socket.id) && socket.connected) {
      socket.emit("anonymous:message", {
        id: randomUUID(),
        text: bot.greeting,
        createdAt: new Date().toISOString(),
      });
    }
  }, 450);
};

const joinAnonymousQueue = (socket) => {
  if (anonymousPartners.has(socket.id)) endAnonymousChat(socket);
  if (anonymousBotSessions.has(socket.id)) endAnonymousChat(socket, false);
  waitingAnonymousUsers.add(socket.id);
  socket.emit("anonymous:queued");
  matchAnonymousUsers();
  if (waitingAnonymousUsers.has(socket.id)) {
    clearTimeout(anonymousBotTimers.get(socket.id));
    anonymousBotTimers.set(socket.id, setTimeout(() => matchWithBot(socket), 5000));
  }
};

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId && userId !== "undefined") {
    userSocketMap.set(userId, socket.id);
  }

  // Send list of online users to all clients
  io.emit("getOnlineUsers", [...userSocketMap.keys()]);

  socket.on("anonymous:join", () => {
    joinAnonymousQueue(socket);
  });

  socket.on("anonymous:next", () => {
    waitingAnonymousUsers.delete(socket.id);
    endAnonymousChat(socket);
    joinAnonymousQueue(socket);
  });

  socket.on("anonymous:leave", () => {
    waitingAnonymousUsers.delete(socket.id);
    endAnonymousChat(socket);
    socket.emit("anonymous:left");
  });

  socket.on("anonymous:message", (payload, acknowledge) => {
    const partnerId = anonymousPartners.get(socket.id);
    const botSession = anonymousBotSessions.get(socket.id);
    const message = typeof payload?.text === "string" ? payload.text.trim() : "";
    if ((!partnerId && !botSession) || !message) {
      acknowledge?.({ ok: false, message: "You are not currently in a chat." });
      return;
    }
    if (message.length > 2000) {
      acknowledge?.({ ok: false, message: "Messages must be 2,000 characters or fewer." });
      return;
    }

    const now = Date.now();
    const window = anonymousMessageWindows.get(socket.id);
    const activeWindow = window && now - window.startedAt < 10_000
      ? window
      : { startedAt: now, count: 0 };
    if (activeWindow.count >= 10) {
      acknowledge?.({ ok: false, message: "Please wait a moment before sending more messages." });
      return;
    }
    activeWindow.count += 1;
    anonymousMessageWindows.set(socket.id, activeWindow);

    const messageData = {
      id: randomUUID(),
      text: message,
      createdAt: new Date().toISOString(),
    };
    acknowledge?.({ ok: true, message: messageData });
    if (botSession) {
      botSession.replyCount += 1;
      const reply = getBotReply(message, botSession.replyCount - 1);
      setTimeout(() => {
        if (anonymousBotSessions.has(socket.id) && socket.connected) {
          socket.emit("anonymous:message", {
            id: randomUUID(),
            text: reply,
            createdAt: new Date().toISOString(),
          });
        }
      }, 700 + Math.floor(Math.random() * 700));
      return;
    }
    io.to(partnerId).emit("anonymous:message", messageData);
  });

  socket.on("anonymous:report", (payload) => {
    const partnerId = anonymousPartners.get(socket.id);
    const allowedReasons = new Set(["inappropriate", "spam", "other"]);
    if (!partnerId || !allowedReasons.has(payload?.reason)) return;

    blockedAnonymousPairs.add(pairKey(socket.id, partnerId));
    console.warn(`Anonymous chat report received (${payload.reason})`);
    socket.emit("anonymous:report-received");
    endAnonymousChat(socket);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
    if (userId && userSocketMap.get(userId) === socket.id) {
      userSocketMap.delete(userId);
    }
    waitingAnonymousUsers.delete(socket.id);
    clearTimeout(anonymousBotTimers.get(socket.id));
    anonymousBotTimers.delete(socket.id);
    endAnonymousChat(socket);
    anonymousMessageWindows.delete(socket.id);
    for (const blockedPair of blockedAnonymousPairs) {
      if (blockedPair.split(":").includes(socket.id)) blockedAnonymousPairs.delete(blockedPair);
    }
    io.emit("getOnlineUsers", [...userSocketMap.keys()]);
  });
});

export { io, app, server };
