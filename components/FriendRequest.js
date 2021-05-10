import React from "react";
import styles from "../styles/FriendRequest.module.scss";
import { useEffect, useState } from "react";
import axios from "axios";

function FriendRequest({ id, status, timestamp, sender, receiver, isPending, token }) {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const REJECT = "reject";
  const ACCEPT = "accept";

  useEffect(() => {
    if (isPending) {
      setUsername(() => sender.username);
      setName(() => `${sender.firstName} ${sender.lastName}`);
    } else {
      setUsername(() => receiver.username);
      setName(() => `${receiver.firstName} ${receiver.lastName}`);
    }
  });

  const handleAction = (action) => {
    axios.put(`http://localhost:8081/api/invites/${action}/${id}`, {}, {
      auth: {
        username: token,
        password: "x",
      },
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "Access-Control-Allow-Origin": "*",
      },
    }).then((res) => console.log(res));
  }

  const checkIfPending = () => {
    if (isPending) {
      return (
        <div>
          <button onClick={() => handleAction(ACCEPT)}>A</button>
          <button onClick={() => handleAction(REJECT)}>R</button>
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
