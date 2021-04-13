import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";
const ENDPOINT = "http://127.0.0.1:8081";
import styles from "../styles/Chat.module.scss";

function ChatWindow() {
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    socket.on("my response", (data) => {
      setResponses(responses => [...responses, data])
    });
  }, []);

  useEffect(() => {
      console.log(responses)
  }, [responses]);

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatArea}>
        <p className={styles.chatFromUser}>
          test chat from user
        </p>
        <p className={styles.chatToUser}>
          test chat from receiver a bit longer
        </p>
        {
          responses.map(response => <p key={response.timestamp} className={styles.chatFromUser}>{response.message}</p>)
        }
      </div>
      <div className={styles.messageArea}>
        <textarea
          className={styles.messageBox}
          id="message-box-contents"
          name="message-box-contents"
          placeholder="Type a message..."
        ></textarea>
      </div>
      <div className={styles.buttonsArea}>
        <button className={styles.sendButton}>Send</button>
      </div>
    </div>
  );
}

export default ChatWindow;
