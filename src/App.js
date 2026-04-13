import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function App() {
  const [screen, setScreen] = useState("home");
  const [roomCode, setRoomCode] = useState("");
  const [currentRoom, setCurrentRoom] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    socket.on("room_update", (data) => {
      setUsers(data);
    });

    return () => {
      socket.off("room_update");
    };
  }, []);

  const createRoom = () => {
    const code = Math.random().toString(36).substring(2, 7);
    setRoomCode(code);
    setCurrentRoom(code);
    socket.emit("create_room", code);
    setScreen("room");
  };

  const joinRoom = () => {
    socket.emit("join_room", roomCode);
    setCurrentRoom(roomCode);
    setScreen("room");
  };

  if (screen === "home") {
    return (
      <div style={{ padding: 20 }}>
        <h1>Lobby System</h1>

        <button onClick={createRoom}>Create Lobby</button>

        <div style={{ marginTop: 10 }}>
          <input
            placeholder="Enter room code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
          />
          <button onClick={joinRoom}>Join Lobby</button>
        </div>
      </div>
    );
  }

  if (screen === "room") {
    return (
      <div style={{ padding: 20 }}>
        <h2>Room: {currentRoom}</h2>

        <h3>Users in lobby:</h3>
        <ul>
          {users.map((u, i) => (
            <li key={i}>{u}</li>
          ))}
        </ul>

        <button
          onClick={() => {
            setScreen("home");
            setUsers([]);
            setRoomCode("");
          }}
        >
          Leave
        </button>
      </div>
    );
  }

  return null;
}