import React from "react";
import styles from "../styles/Chat.module.scss";

// TODO load previous messsages button (pages)

export default function ChatArea({ currentRecipient, messages, userId }) {
  const checkUser = (userIdToCheck) => {
    if (userIdToCheck === userId) {
      return styles.chatFromUser;
    } else {
      return styles.chatToUser;
    }
  };

  if (currentRecipient === undefined) {
    return <></>;
  } else {
    return messages.map((message) => {
      return (
        <p key={message.timestamp} className={checkUser(message.senderId)}>
          {message.contents}
        </p>
      );
    });
  }
}
