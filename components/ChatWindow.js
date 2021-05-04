import React, { useState, useEffect } from "react";
import styles from "../styles/Chat.module.scss";
import { getSession, signOut } from "next-auth/client";
import { socket } from "./service/socket";
import { useRouter } from "next/router";
import axios from "axios";

function ChatWindow({ username }) {
  const [token, setToken] = useState("");
  const [friends, setFriends] = useState([]);
  const [responses, setResponses] = useState([]);
  const [roomsMap, setRoomsMap] = useState(new Map());
  const [messageValue, setMessageValue] = useState("");
  const [currentRecipient, setCurrentRecipient] = useState("");
  const router = useRouter();

  useEffect(async () => {
    await getSession().then((res1) => {
      if (res1 !== null) {
        setToken(() => res1.accessToken);
        console.log(res1.user.name);
        axios
          .get("http://localhost:8081/api/friends/my", {
            auth: {
              username: res1.accessToken,
              password: "x",
            },
            headers: {
              "Content-Type": "application/json;charset=UTF-8",
              "Access-Control-Allow-Origin": "*",
            },
          })
          .then((res) => {
            setFriends(() => [...res.data.friends]);
            res.data.friends.forEach((friend) => {
              console.log(friend);
              joinRoom(res1.accessToken, res1.user.name, friend.username);
            });
          })
          .catch((err) => console.log(err));
      } else {
        router.push("/");
      }
    });
  }, []);

  useEffect(() => {
    socket.on("global response", (data) => {
      setResponses((responses) => [...responses, data]);
    });

    socket.on("room_name_response", (data) => {
      console.log(`joined ${data.roomName} with ${data.recipient}`);
      setCurrentRecipient(() => data.recipient);
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

  const joinRoom = (token, username, recipient) => {
    socket.emit("join", {
      token: token,
      username: username,
      recipient: recipient,
    });

    setCurrentRecipient(() => roomsMap.get(recipient.key));
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

  const signOutHandler = () => {
    router.push("/");
    signOut();
  };

  const checkIfActive = (givenUsername) => {
    if (givenUsername === currentRecipient) {
      return styles.activeDiv;
    } else {
      return styles.friendDiv;
    }
  }

  const getMessages = async (userId) => {
    await axios
      .get(`http://localhost:8081/api/messages/with/${userId}/1`, {
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
        setResponses(() => [...res.data.messages.datas]);
      })
      .catch((err) => console.log(err));
  }

  return (
    <div className={styles.chatContainer}>
      <div className={styles.sidePanel}>
        <div className={styles.utilityWindow}>
          <div onClick={() => signOutHandler()} className={styles.utilityDiv}>
            Log out
          </div>
          <div onClick={() => router.push("/friends")} className={styles.utilityDiv}>
            {/* friends searching, addding, accepting/decilinig */}
            Friends
          </div>
        </div>
        <div className={styles.friendsWindow}>
          {friends.map((friend) => (
            <div
              className={checkIfActive(friend.username)}
              id={friend.id}
              name={friend.username}
              key={friend.id}
              onClick={() => {
                if (currentRecipient !== friend.username) {
                  getMessages(friend.id);
                  setCurrentRecipient(() => friend.username);  
                }
              }}
            >
              {friend.username}
            </div>
          ))}
        </div>
      </div>
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
            if (event.key === "Enter" && !event.shiftKey) {
              sendMessage();
            }
          }}
        ></textarea>
      </div>
      <div className={styles.buttonsArea}>
        <button className={styles.sendButton} onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;
