import React from "react";
import styles from "../styles/FriendRequest.module.scss";
import { useEffect, useState } from "react";
import axios from "axios";
import { axiosAuthConfig, HOST_API } from "./service/utlis";
import { Button, Card } from "react-bootstrap";

function FriendRequest({
  id,
  timestamp,
  sender,
  receiver,
  isPending,
  token,
  setFriendsRequests,
  genericError,
  showToastWith,
}) {
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
    axios
      .put(`${HOST_API}invites/${action}/${id}`, {}, axiosAuthConfig(token))
      .then((res) => {
        setFriendsRequests((friendRequests) =>
          friendRequests.slice(0, friendRequests.length - 1)
        );
        showToastWith("Sucess", "", "Action completed sucessfully");
      })
      .catch((err) => genericError(err));
  };

  const checkIfPending = () => {
    if (isPending) {
      return (
        <div>
          <Button variant="dark" onClick={() => handleAction(ACCEPT)}>
            Accept
          </Button>
          <Button variant="danger" onClick={() => handleAction(REJECT)}>
            Reject
          </Button>
        </div>
      );
    } else {
      return (
        <div>
          <p>sent on {new Date(timestamp).toLocaleDateString()}</p>
        </div>
      );
    }
  };

  return (
    <Card className={styles.friendRequest}>
      <Card.Header>{username}</Card.Header>
      <Card.Body>
        <Card.Title>{`${name}`}</Card.Title>
        {checkIfPending()}
      </Card.Body>
    </Card>
  );
}

export default FriendRequest;
