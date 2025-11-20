import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const serverUrl = process.env.REACT_APP_SERVER_URL || "http://localhost:3001";

const socket = io(serverUrl);

function App() {
  const params = new URLSearchParams(window.location.search);
  const team = params.get("team"); // "alpha" or "bravo" or null

  const [phase, setPhase] = useState("waiting");
  const [turn, setTurn] = useState(null);
  const [bans, setBans] = useState([]);
  const [picks, setPicks] = useState([]);

  useEffect(() => {
    socket.on("stateUpdate", (data) => {
      setPhase(data.phase);
      setTurn(data.turn);
      setBans(data.bans);
      setPicks(data.picks);
    });

    return () => socket.off("stateUpdate");
  }, []);

  const start = () => {
    socket.emit("start");
  };

  const ban = (target) => {
    if (team !== turn) return alert("あなたのターンではありません");
    socket.emit("ban", { team, target });
  };

  const pick = (weapon) => {
    if (team !== turn) return alert("あなたのターンではありません");
    socket.emit("pick", { team, weapon });
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>スプラトゥーン バンピック</h1>

      <p>あなたのチーム: <b>{team ?? "観戦"}</b></p>
      <p>現在フェーズ: {phase}</p>
      <p>現在のターン: {turn}</p>

      {phase === "waiting" && (
        <button onClick={start}>開始</button>
      )}

      <h2>BAN</h2>
      <p>{bans.join(", ")}</p>

      <h2>PICK</h2>
      <p>{picks.join(", ")}</p>

      {team && (
        <>
          <h2>操作</h2>
          <button onClick={() => ban("stage1")}>ステージ1 BAN</button>
          <button onClick={() => ban("stage2")}>ステージ2 BAN</button>
          <button onClick={() => pick("weapon1")}>武器1 PICK</button>
          <button onClick={() => pick("weapon2")}>武器2 PICK</button>
        </>
      )}

      <hr />
      <h3>チームURL</h3>
      <p>Alpha: {window.location.origin}?team=alpha</p>
      <p>Bravo: {window.location.origin}?team=bravo</p>
      <p>観戦: {window.location.origin}</p>
    </div>
  );
}

export default App;
