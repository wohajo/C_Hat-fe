import React from "react";
import styles from "../styles/FriendRequest.module.scss";
import { useEffect, useState } from "react";

function FriendRequest({ id, status, timestamp, sender, receiver, isPending }) {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (isPending) {
      setUsername(() => sender.username);
      setName(() => `${sender.firstName} ${sender.lastName}`);
    } else {
      setUsername(() => receiver.username);
      setName(() => `${receiver.firstName} ${receiver.lastName}`);
    }
  });

  const checkIfPending = () => {
    if (isPending) {
      return (
        <div>
          <button>A</button>
          <button>R</button>
        </div>
      );
    } else {
      return <div>
        <p>sent on {new Date(timestamp).toLocaleDateString()}</p>
      </div>
    }
  };

  return (
    <div className={styles.friendRequest}>
      <div className={styles.requestUsername}>{username}</div>
      <div className={styles.requestName}>{name}</div>
      <div className={styles.requestButtons}>{checkIfPending()}</div>
    </div>
  );
}

export default FriendRequest;
