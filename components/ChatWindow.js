import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";
import styles from "../styles/Chat.module.scss";

const ENDPOINT = "http://127.0.0.1:8081";

function ChatWindow({ username, token }) {
  const [responses, setResponses] = useState([]);
  const [messageValue, setMessageValue] = useState("");
  const socket = socketIOClient(ENDPOINT);

  useEffect(() => {
    socket.on("my response", (data) => {
      setResponses((responses) => [...responses, data]);
    });
  }, []);

  const sendMessage = () => {
    if (messageValue.length < 1) {
      return;
    }
    socket.emit("my event", {
      user_name: username,
      message: messageValue,
      timestamp: Date.now(),
    });
    setMessageValue("");
  };

  const joinRoom1 = () => {
    socket.emit("leave", {room: username + "/" + "user2", token: token, username: username});
    socket.emit("join", {room: username + "/" + "user", token: token, username: username});
  };

  const joinRoom2 = () => {
    socket.emit("leave", {room: "ddd" + "/" + "user", token: token, username: username});
    socket.emit("join", {room: "ddd" + "/" + "user2", token: token, username: username});
  };

  const checkUser = (userToCheck) => {
    if (userToCheck === username) {
      return styles.chatFromUser;
    } else {
      return styles.chatToUser;
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatArea}>
        {responses.map((response) => (
          <p key={response.timestamp} className={checkUser(response.user_name)}>
            {response.message}
          </p>
        ))}
      </div>
      <div className={styles.messageArea}>
        <textarea
          className={styles.messageBox}
          id="message-box-contents"
          name="message-box-contents"
          placeholder="Type a message..."
          value={messageValue}
          onChange={(e) => {
            setMessageValue(e.target.value);
          }}
        ></textarea>
      </div>
      <div className={styles.buttonsArea}>
        <button className={styles.sendButton} onClick={sendMessage}>
          Send
        </button>
        <button onClick={() => joinRoom1()}>user</button>
        <button onClick={() => joinRoom2()}>user2</button>
      </div>
    </div>
  );
}

export default ChatWindow;
