// ==========================
// Reactクライアントアプリ（client/src/App.js）
// ==========================
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const stages = ["マサバ海峡大橋", "ユノハナ大渓谷", "コンブトラック", "ゴンズイ地区"];
const weapons = ["スプラシューター", "52ガロン", "N-ZAP", "スプラローラー", "スプラチャージャー"];
const initialTeams = {
  alpha: { bans: { stage: null, weapon: null }, picks: Array(4).fill(null), stagePick: null },
  bravo: { bans: { stage: null, weapon: null }, picks: Array(4).fill(null), stagePick: null },
};

export default function App() {
  const query = new URLSearchParams(window.location.search);
  const team = query.get("team");

  const [teams, setTeams] = useState(initialTeams);
  const [phase, setPhase] = useState("ban");
  const [banStep, setBanStep] = useState(0);
  const [stagePickStep, setStagePickStep] = useState(0);
  const [pickStep, setPickStep] = useState(0);
  const [timer, setTimer] = useState(20);
  const [started, setStarted] = useState(false);
  const [ready, setReady] = useState({ alpha: false, bravo: false });

  const socketRef = useRef(null);
  const timerRef = useRef(null);

  const currentTeam = banStep % 2 === 0 ? "alpha" : "bravo";
  const isStageBan = banStep < 2;

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io("https://YOUR-RENDER-URL.onrender.com");

      socketRef.current.on("stateUpdate", (newState) => {
        setTeams(newState.teams);
        setPhase(newState.phase);
        setBanStep(newState.banStep);
        setStagePickStep(newState.stagePickStep);
        setPickStep(newState.pickStep);
        setTimer(newState.timer);
        setStarted(newState.started);
        setReady(newState.ready || { alpha: false, bravo: false });
      });
    }
    return () => socketRef.current && socketRef.current.disconnect();
  }, []);

  const bannedStages = [teams.alpha.bans.stage, teams.bravo.bans.stage].filter(Boolean);
  const bannedWeapons = [teams.alpha.bans.weapon, teams.bravo.bans.weapon].filter(Boolean);

  function sendUpdate(newState) {
    socketRef.current?.emit("stateChange", newState);
  }

  function handleReady() {
    const newReady = { ...ready, [team]: true };
    setReady(newReady);
    sendUpdate({ teams, phase, banStep, stagePickStep, pickStep, timer, started, ready: newReady });
  }

  function startGame() {
    if (!started && ready.alpha && ready.bravo) {
      sendUpdate({ teams, phase, banStep, stagePickStep, pickStep, timer: 20, started: true, ready });
      setStarted(true);
    }
  }

  const baseUrl = window.location.origin + window.location.pathname;
  const alphaUrl = `${baseUrl}?team=alpha`;
  const bravoUrl = `${baseUrl}?team=bravo`;

  return (
    <div className="p-4 space-y-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-center">Splatoon BAN/PICK</h1>

      {!started ? (
        <div className="text-center space-y-4">
          {!ready[team] ? (
            <button className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={handleReady}>
              準備完了
            </button>
          ) : (
            <p className="text-green-600 font-bold">準備完了</p>
          )}

          {ready.alpha && ready.bravo ? (
            <button className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600" onClick={startGame}>
              ゲーム開始
            </button>
          ) : (
            <p className="text-gray-700">両チームの準備完了を待っています...</p>
          )}

          <div>
            <p>Alpha用URL: <span className="text-gray-700 select-all">{alphaUrl}</span></p>
            <p>Bravo用URL: <span className="text-gray-700 select-all">{bravoUrl}</span></p>
          </div>
        </div>
      ) : (
        <p className="text-center text-lg">残り時間: <strong>{timer}s</strong></p>
      )}
    </div>
  );
}
