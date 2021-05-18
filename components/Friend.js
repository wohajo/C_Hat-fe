import React from "react";
import styles from "../styles/FriendRequest.module.scss";
import { useEffect, useState } from "react";
import axios from "axios";

function Friend({ id, firstName, lastName, username, isFound, userId, token }) {
  const [name, setName] = useState("");
  const HOST_API = "http://localhost:8081/api/";

  useEffect(() => {
    setName(() => firstName + lastName);
  });

  const handleInvite = () => {
    axios
      .post(
        `${HOST_API}users/invite/${id}`,
        {},
        {
          auth: {
            username: token,
            password: "x",
          },
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
          },
        }
      )
      .then((res) => console.log(res));
  };

  const handleDelete = () => {
    axios
      .delete(`${HOST_API}friends/remove/${id}`, {
        auth: {
          username: token,
          password: "x",
        },
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "*",
        },
      })
      .then((res) => console.log(res));
  };

  const checkIfFound = () => {
    if (isFound) {
      return <button onClick={() => handleInvite()}>I</button>;
    } else {
      return <button onClick={() => handleDelete()}>D</button>;
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
