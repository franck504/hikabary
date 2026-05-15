import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import userRoutes from "./routes/UserRoutes";
import kabaryRoutes from "./routes/KabaryRoutes";
import sessionRoutes from "./routes/SessionRoutes";

dotenv.config();

const app = express();
const httpServer = createServer(app);
app.set("trust proxy", true);

const isDockerHopIp = (ip: string) =>
  /^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/.test(ip);

const getClientIp = (req: express.Request) => {
  const forwarded = req.headers["x-forwarded-for"];
  const forwardedIp = Array.isArray(forwarded)
    ? forwarded[0]
    : typeof forwarded === "string"
      ? forwarded.split(",")[0]?.trim()
      : "";
  const realIp = typeof req.headers["x-real-ip"] === "string" ? req.headers["x-real-ip"] : "";
  return forwardedIp || realIp || req.ip || req.socket.remoteAddress || "unknown";
};

const localOrigins = [/^http:\/\/192\.168\.\d+\.\d+:3000$/, "http://localhost:3000"];
const isAllowedOrigin = (origin?: string) => {
  if (!origin) return true;
  return localOrigins.some((allowed) =>
    typeof allowed === "string" ? allowed === origin : allowed.test(origin)
  );
};

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      callback(isAllowedOrigin(origin) ? null : new Error("CORS blocked"), isAllowedOrigin(origin));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  },
});

const PORT = Number(process.env.PORT) || 5000;

app.use(cors({
  origin: (origin, callback) => {
    callback(isAllowedOrigin(origin) ? null : new Error("CORS blocked"), isAllowedOrigin(origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use((req, res, next) => {
  const clientIp = getClientIp(req);
  const hopIp = req.socket.remoteAddress || "unknown";
  const xff = req.headers["x-forwarded-for"] || "-";
  const xri = req.headers["x-real-ip"] || "-";
  const host = req.headers.host || "-";
  const origin = req.headers.origin || "-";
  const ipType = isDockerHopIp(clientIp) ? "INTERNAL_DOCKER_HOP" : "CLIENT_DEVICE";
  console.log(
    `[BACKEND][HTTP] ${req.method} ${req.originalUrl} CLIENT_IP=${clientIp} CLIENT_TYPE=${ipType} SERVER_HOST=${host} HOP_IP=${hopIp} xff=${xff} xri=${xri} origin=${origin}`
  );
  next();
});

app.use(express.json({ limit: "8mb" }));
app.use(express.urlencoded({ extended: true, limit: "8mb" }));

// Routes API
app.use("/api/users", userRoutes);
app.use("/api/kabary", kabaryRoutes);
app.use("/api/sessions", sessionRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Kabary Backend with Real-time Signaling is running");
});

// Socket.io Logic for WebRTC & Chat
io.on("connection", (socket: Socket) => {
  const handshakeAddress = socket.handshake.address || "unknown";
  const socketXff = socket.handshake.headers["x-forwarded-for"] || "-";
  const socketOrigin = socket.handshake.headers.origin || "-";
  console.log(
    `\n[BACKEND][SOCKET] connect id=${socket.id} ip=${handshakeAddress} xff=${socketXff} origin=${socketOrigin}`
  );

  socket.on("join-room", (roomId: string) => {
    socket.join(roomId);
    console.log(`👤 [SOCKET] User ${socket.id} joined room: ${roomId}`);
    
    // Inform others that a new user joined
    socket.to(roomId).emit("user-joined", socket.id);
  });

  // Relay WebRTC signals (offer, answer, candidates)
  socket.on("signal", ({ roomId, signal, to }: { roomId: string, signal: any, to?: string }) => {
    if (to) {
      // Direct signal to a specific user
      io.to(to).emit("signal", { signal, from: socket.id });
    } else {
      // Broadcast signal to everyone else in the room
      socket.to(roomId).emit("signal", { signal, from: socket.id });
    }
  });

  // Relay Reactions (Emojis)
  socket.on("send-reaction", ({ roomId, icon }: { roomId: string, icon: string }) => {
    io.to(roomId).emit("new-reaction", { icon, id: Date.now() });
  });

  // Relay Chat Messages
  socket.on("send-message", ({ roomId, message, user }: { roomId: string, message: string, user: string }) => {
    io.to(roomId).emit("new-message", { message, user, timestamp: new Date() });
  });

  socket.on("disconnect", () => {
    console.log(`❌ [SOCKET] User disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🚀 [SERVER] Server is running on:`);
  console.log(`   - Local:    http://localhost:${PORT}`);
  console.log(`   - Network:  http://<host-ip>:${PORT}`);
  console.log(`📡 [SOCKET] Real-time signaling enabled`);
});
