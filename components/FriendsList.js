import React from "react";
import axios from "axios";
import {
  axiosAuthConfig,
  decryptString,
  getFromLocalStorage,
} from "./service/utlis";
import styles from "../styles/Chat.module.scss";
import { HOST_API } from "./service/utlis";

export default function FriendsList({
  friends,
  currentRecipientId,
  token,
  username,
  setCurrentRecipient,
  setCurrentRecipientId,
  setMessages,
  setMessagePagination,
  setOlderMsgsButton,
  genericError,
}) {
  const checkIfActive = (givenId) => {
    if (givenId === currentRecipientId) {
      return styles.activeDiv;
    } else {
      return styles.friendDiv;
    }
  };

  const getMessages = async (userId, friendUsername, token) => {
    await axios
      .get(`${HOST_API}messages/with/${userId}/1`, axiosAuthConfig(token))
      .then((res) => {
        let msgs = [];
        res.data.messages.datas.forEach((msg) => {
          msgs.push({
            id: msg.id,
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
      .catch((err) => genericError(err));
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
        setMessagePagination(() => 2);
        setOlderMsgsButton(() => false);
      }}
    >
      <b>{friend.username}</b>
      <p>{`${friend.firstName} ${friend.lastName}`}</p>
    </div>
  ));
}
