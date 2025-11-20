import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

// ------------------------
//  ゲームステート保持
// ------------------------
let state = {
  phase: "waiting",
  turn: "alpha",
  bans: [],
  picks: []
};

// 全員に状態送信
const update = () => io.emit("stateUpdate", state);

// ------------------------
//  イベント処理
// ------------------------

io.on("connection", (socket) => {
  console.log("connected:", socket.id);
  socket.emit("stateUpdate", state);

  socket.on("start", () => {
    state = { phase: "ban", turn: "alpha", bans: [], picks: [] };
    update();
  });

  socket.on("ban", ({ team, target }) => {
    if (team !== state.turn) return;
    state.bans.push(`${team}:${target}`);
    state.turn = state.turn === "alpha" ? "bravo" : "alpha";

    if (state.bans.length >= 4) {
      state.phase = "pick";
      state.turn = "alpha";
    }
    update();
  });

  socket.on("pick", ({ team, weapon }) => {
    if (team !== state.turn) return;
    state.picks.push(`${team}:${weapon}`);
    state.turn = state.turn === "alpha" ? "bravo" : "alpha";

    if (state.picks.length >= 8) {
      state.phase = "done";
    }
    update();
  });
});

// ------------------------

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
