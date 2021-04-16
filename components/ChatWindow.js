import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";
import { useSession, getSession } from "next-auth/client";
import styles from "../styles/Chat.module.scss";

const ENDPOINT = "http://127.0.0.1:8081";


function ChatWindow({ username }) {
  const [responses, setResponses] = useState([]);
  const [messageValue, setMessageValue] = useState("");
  const [session, loading] = useSession();
  const socket = socketIOClient(ENDPOINT);

  useEffect(() => {
    socket.on("my response", (data) => {
      setResponses((responses) => [...responses, data]);
    });
  }, []);

  useEffect(() => {
    console.log(responses);
  }, [responses]);

  const sendMessage = () => {
    if (messageValue.length < 1) {
      return
    }
    socket.emit("my event", {
      user_name: username,
      message: messageValue,
      timestamp: Date.now(),
    });
    setMessageValue("");
  };

  const checkUser = (userToCheck) => {
    if (userToCheck === username) {
      return styles.chatFromUser
    } else {
      return styles.chatToUser
    }
  }

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
        <button
          className={styles.sendButton}
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;
