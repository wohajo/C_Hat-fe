import React from "react";
import styles from "../styles/FriendRequest.module.scss";
import { useEffect, useState } from "react";
import axios from "axios";
import { Card, Button } from "react-bootstrap";
import { axiosAuthConfig } from "./service/utlis";

function Friend({
  id,
  firstName,
  lastName,
  username,
  isFound,
  token,
  setFriends,
  genericError,
  showToastWith,
}) {
  const [name, setName] = useState("");
  const HOST_API = "http://localhost:8081/api/";

  useEffect(() => {
    setName(() => firstName + lastName);
  });

  const handleInvite = () => {
    axios
      .post(`${HOST_API}invites/invite/${id}`, {}, axiosAuthConfig(token))
      .then(() => showToastWith("Success", "", "Invite was sent"))
      .catch((err) => genericError(err));
  };

  const handleDelete = () => {
    axios
      .delete(`${HOST_API}friends/remove/${id}`, axiosAuthConfig(token))
      .then(() => {
        setFriends((friends) => friends.slice(0, friends.length - 1));
        showToastWith("Success", "", "Invite was deleted");
      })
      .catch((err) => genericError(err));
  };

  const checkIfFound = () => {
    if (isFound) {
      return (
        <Button variant="dark" onClick={() => handleInvite()}>
          Invite
        </Button>
      );
    } else {
      return (
        <Button variant="danger" onClick={() => handleDelete()}>
          Remove
        </Button>
      );
    }
  };

  return (
    <Card className={styles.friendRequest}>
      <Card.Header>{username}</Card.Header>
      <Card.Body>
        <Card.Title>{`${firstName} ${lastName}`}</Card.Title>
        {checkIfFound()}
      </Card.Body>
    </Card>
  );
}

export default Friend;
