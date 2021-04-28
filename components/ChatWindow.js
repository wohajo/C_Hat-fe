import { getSession } from "next-auth/client";
import React, { useState, useEffect } from "react";
import styles from "../styles/Chat.module.scss";
import { socket } from "./service/socket";
import axios from "axios";

function ChatWindow({ username }) {
  const [responses, setResponses] = useState([]);
  const [roomsMap, setRoomsMap] = useState(new Map());
  const [currentRoom, setCurrentRoom] = useState("");
  const [token, setToken] = useState("");
  const [messageValue, setMessageValue] = useState("");
  const [friends, setFriends] = useState([]);


  useEffect(async () => {
    await getSession()
    .then((res) => {
      if (res !== null) {
        setToken(res.accessToken);
        axios
        .get("http://localhost:8081/api/friends/my", {
          auth: {
            username: res.accessToken,
            password: "x",
          },
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
          },
        })
        .then((res) => {
          console.log(res);
          setFriends(() => [...res.data.friends]);
        })
        .catch((err) => console.log(err));
      } else {
        router.push("/");
      }
    })
  }, []);

  useEffect(() => {
    console.log(friends);
  }, [friends]);

  useEffect(() => {
    socket.on("global response", (data) => {
      setResponses((responses) => [...responses, data]);
    });

    socket.on("room_name_response", (data) => {
      console.log(`joined ${data.roomName} with ${data.recipient}`);
      setCurrentRoom(() => data.roomName);
      setRoomsMap((roomsMap) => roomsMap.set(data.recipient, data.roomName));
    });

    return () => socket.close();
  }, []);

  const sendMessage = () => {
    if (messageValue.length < 1) {
      return;
    }

    socket.emit("global message", {
      user_name: username,
      message: messageValue,
      timestamp: Date.now(),
    });
    setMessageValue("");
  };

  const joinRoom = (recipient) => {
    socket.emit("join", {
      token: token,
      username: username,
      recipient: recipient,
    });

    setCurrentRoom(() => roomsMap.get(recipient));
  };

  const leaveRoom = (recipient) => {
    socket.emit("leave", {
      token: token,
      username: username,
      recipient: recipient,
    });

    const newRooms = roomsMap;
    newRooms.delete(recipient);
    console.log(`left room with ${recipient}`);
    newRooms.forEach((val, key) => console.log(`${val}:${key}`));
    setRoomsMap(() => newRooms);
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
          onKeyUp={(event) => {
            if (event.key === "Enter") {
              sendMessage();
            }
          }}
        ></textarea>
      </div>
      <div className={styles.buttonsArea}>
        <button className={styles.sendButton} onClick={sendMessage}>
          Send
        </button>
        <button onClick={() => joinRoom("user")}>join user</button>
        <button onClick={() => leaveRoom("user")}>leave user</button>
        <button onClick={() => joinRoom("user2")}>join user2</button>
        <button onClick={() => leaveRoom("user2")}>leave user2</button>
        <button onClick={() => joinRoom("user3")}>join user3</button>
        <button onClick={() => leaveRoom("user3")}>leave user3</button>
      </div>
    </div>
  );
}

export default ChatWindow;
