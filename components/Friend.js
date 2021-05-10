import React from "react";
import styles from "../styles/FriendRequest.module.scss";
import { useEffect, useState } from "react";

function Friend({ id, firstName, lastName, username, isFound }) {
  const [name, setName] = useState("");

  useEffect(() => {
    setName(() => firstName + lastName);
  });

  const checkIfFound = () => {
    if (isFound) {
      return <button>I</button>;
    } else {
      return <button>D</button>;
    }
  };

  return (
    <div className={styles.friendRequest}>
      <div className={styles.requestUsername}>{username}</div>
      <div className={styles.requestName}>{name}</div>
      <div className={styles.requestButtons}>{checkIfFound()}</div>
    </div>
  );
}

export default Friend;
