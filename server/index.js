import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" }
});

let state = {
  teams: { alpha: { bans: {}, picks: [], stagePick: null }, bravo: { bans: {}, picks: [], stagePick: null } },
  phase: "ban",
  banStep: 0,
  stagePickStep: 0,
  pickStep: 0,
  timer: 20,
  started: false
};

io.on("connection", socket => {
  socket.emit("stateUpdate", state);
  socket.on("stateChange", newState => {
    state = newState;
    io.emit("stateUpdate", state);
  });
});

const clientBuildPath = path.join(__dirname, "../client/build");
app.use(express.static(clientBuildPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

const port = process.env.PORT || 3000;
httpServer.listen(port, () => console.log(`Server running on port ${port}`));
