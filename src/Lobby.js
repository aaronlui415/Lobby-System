import { useState } from "react";
import { socket } from "./socket";

export default function Lobby({ setRoom }) {
  const [roomCode, setRoomCode] = useState("");

  function createRoom() {
    socket.emit("create_room", (code) => {
      setRoom(code);
    });
  }

  function joinRoom() {
    socket.emit("join_room", roomCode, "User");
    setRoom(roomCode);
  }

  return (
    <div>
      <h1>Lobby</h1>

      <button onClick={createRoom}>Create Room</button>

      <div>
        <input
          placeholder="Enter Room Code"
          onChange={(e) => setRoomCode(e.target.value)}
        />
        <button onClick={joinRoom}>Join Room</button>
      </div>
    </div>
  );
}