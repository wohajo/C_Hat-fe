import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";
const ENDPOINT = "http://127.0.0.1:8081";

function ChatWindow() {
  const [response, setResponse] = useState("");

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    socket.on("my response", data => {
      setResponse(data);
    });
  }, []);

  return (
    <p>
      {response.message}
    </p>
  );
}

export default ChatWindow;