import React from "react";
import axios from "axios";
import { decryptString, getFromLocalStorage } from "./service/utlis";
import styles from "../styles/Chat.module.scss";

export default function FriendsList({
  friends,
  currentRecipientId,
  token,
  username,
  setCurrentRecipient,
  setCurrentRecipientId,
  setMessages,
}) {
  const HOST_API = "http://localhost:8081/api/";

  const checkIfActive = (givenId) => {
    if (givenId === currentRecipientId) {
      return styles.activeDiv;
    } else {
      return styles.friendDiv;
    }
  };

  const getMessages = async (userId, friendUsername, token) => {
    await axios
      .get(`${HOST_API}messages/with/${userId}/1`, {
        auth: {
          username: token,
          password: "x",
        },
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "*",
        },
      })
      .then((res) => {
        let msgs = [];
        console.log("setting new messages with get");
        res.data.messages.datas.forEach((msg) => {
          msgs.push({
            contents: decryptString(
              msg.contents,
              getFromLocalStorage(`${username}secretWith${friendUsername}`)
            ),
            receiverId: msg.receiverId,
            senderId: msg.senderId,
            timestamp: msg.timestamp,
          });
        });

        setMessages(() => [...msgs]);
      })
      .catch((err) => console.log(err));
  };

  return friends.map((friend) => (
    <div
      className={checkIfActive(friend.id)}
      id={friend.id}
      name={friend.username}
      key={friend.id}
      onClick={() => {
        if (currentRecipientId !== friend.id) {
          getMessages(friend.id, friend.username, token);
        }
        setCurrentRecipient(() => friend.username);
        setCurrentRecipientId(() => friend.id);
      }}
    >
      {friend.username}
    </div>
  ));
}
