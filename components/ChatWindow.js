import React, { useState, useEffect } from "react";
import styles from "../styles/Chat.module.scss";
import { getSession, signOut } from "next-auth/client";
import { socket } from "./service/socket";
import { useRouter } from "next/router";
import axios from "axios";
import { useCookies } from "react-cookie";

function ChatWindow({ username }) {
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState(0);
  const [friends, setFriends] = useState([]);
  const [messages, setMessages] = useState([]);
  const [responses, setResponses] = useState([]);
  const [roomsMap, setRoomsMap] = useState(new Map());
  const [messageValue, setMessageValue] = useState("");
  const [currentRecipient, setCurrentRecipient] = useState("");
  const [currentRecipientId, setCurrentRecipientId] = useState(-1);
  const [cookies, setCookie] = useCookies(["name"]);
  const random = require("random-bigint");

  const router = useRouter();

  useEffect(async () => {
    await getSession().then(async (sessionRes) => {
      if (sessionRes !== null) {
        setToken(() => sessionRes.accessToken);
        setUserId(() => sessionRes.id);

        if (
          cookies.privateKey === undefined ||
          cookies.publicKey === undefined
        ) {
          await axios
            .get("http://localhost:8081/api/encryption/base", {
              auth: {
                username: sessionRes.accessToken,
                password: "x",
              },
              headers: {
                "Content-Type": "application/json;charset=UTF-8",
                "Access-Control-Allow-Origin": "*",
              },
            })
            .then((res) => {
              const base = BigInt(res.data.base, 16);
              const privateKey = random(res.data.base.toString(2).length);
              const publicKey = privateKey * base;

              setCookie("privateKey", `0x${privateKey.toString(16)}`, {
                path: "/",
              });
              setCookie("publicKey", `0x${publicKey.toString(16)}`, {
                path: "/",
              });

              axios.put(
                `http://localhost:8081/api/encryption/update-public-key/${sessionRes.id}`,
                { publicKey: `0x${publicKey.toString(16)}` },
                {
                  auth: {
                    username: sessionRes.accessToken,
                    password: "x",
                  },
                  headers: {
                    "Content-Type": "application/json;charset=UTF-8",
                    "Access-Control-Allow-Origin": "*",
                  },
                }
              );
            })
            .catch((err) => console.log(err));
        }

        await axios
          .get("http://localhost:8081/api/friends/my", {
            auth: {
              username: sessionRes.accessToken,
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
              joinRoom(
                sessionRes.accessToken,
                sessionRes.user.name,
                friend.username,
                friend.id
              );

              const friendUsername = friend.username;

              if (cookies.friendUsername === undefined) {
                console.log(`setting cookie for ${friendUsername}`);
                console.log(`friends public key: ${friend.publicKey}`);

                // TODO handle when friend has no public key yet
                // TODO also handle first login, cause cookies.privateKey is not seen yet for this function
                const friendPublicKey = BigInt(friend.publicKey, 16);
                const myPrivateKey = BigInt(cookies.privateKey, 16);
                const sharedSecret = friendPublicKey * myPrivateKey;

                console.log(
                  `sharedSecret with ${friendUsername}: ${sharedSecret}`
                );

                setCookie(friendUsername, `0x${sharedSecret.toString(16)}`, {
                  path: "/",
                });
              }
            });
          })
          .catch((err) => console.log(err));
      } else {
        router.push("/");
      }
    });
  }, []);

  useEffect(() => {
    socket.on("room name response", (data) => {
      setRoomsMap((roomsMap) => roomsMap.set(data.recipientId, data.roomName));
    });
    return () => socket.close();
  }, []);

  useEffect(() => {
    socket.on("room_response", (data) => {
      setResponses((responses) => [...responses, data]);
    });
    return () => socket.close();
  }, []);

  useEffect(() => {
    if (responses.length === 0) return;

    const message = responses[responses.length - 1];

    if (message.roomName === roomsMap.get(currentRecipientId)) {
      setMessages(() => [...messages, message]);
    } else {
      // TODO show message from another user
      console.log("message from another user");
    }
  }, [responses]);

  const sendMessage = () => {
    if (messageValue.length < 1) {
      return;
    }

    const receiver = friends.find(
      (friend) => friend.username === currentRecipient
    );
    const receiverRoom = roomsMap.get(receiver.id);

    socket.emit("room_message", {
      roomName: receiverRoom,
      sender: username,
      senderId: userId,
      receiver: currentRecipient,
      receiverId: receiver.id,
      contents: messageValue,
      token: token,
    });
    setMessageValue("");
  };

  const joinRoom = (token, username, recipient, recipientId) => {
    socket.emit("join", {
      token: token,
      username: username,
      recipient: recipient,
      recipientId: recipientId,
    });
  };

  const leaveRoom = (recipient) => {
    socket.emit("leave", {
      token: token,
      username: username,
      recipient: recipient,
    });

    console.log(`left room with ${recipient}`);
  };

  const checkUser = (userIdToCheck) => {
    if (userIdToCheck === userId) {
      return styles.chatFromUser;
    } else {
      return styles.chatToUser;
    }
  };

  const signOutHandler = () => {
    friends.forEach((friend) => {
      leaveRoom(friend.username);
    });
    socket.disconnect();
    router.push("/");
    signOut();
  };

  const checkIfActive = (givenId) => {
    if (givenId === currentRecipientId) {
      return styles.activeDiv;
    } else {
      return styles.friendDiv;
    }
  };

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
        setMessages(() => [...res.data.messages.datas]);
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.sidePanel}>
        <div className={styles.utilityWindow}>
          <div onClick={() => signOutHandler()} className={styles.utilityDiv}>
            Log out
          </div>
          <div
            onClick={() => router.push("/friends")}
            className={styles.utilityDiv}
          >
            {/* friends searching, addding, accepting/decilinig */}
            Friends
          </div>
        </div>
        <div className={styles.friendsWindow}>
          {friends.map((friend) => (
            <div
              className={checkIfActive(friend.id)}
              id={friend.id}
              name={friend.username}
              key={friend.id}
              onClick={() => {
                if (currentRecipientId !== friend.id) {
                  getMessages(friend.id);
                }
                setCurrentRecipient(() => friend.username);
                setCurrentRecipientId(() => friend.id);
              }}
            >
              {friend.username}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.chatArea}>
        {messages.map((response) => (
          <p key={response.timestamp} className={checkUser(response.senderId)}>
            {response.contents}
          </p>
        ))}
      </div>
      <div className={styles.messageArea}>
        <textarea
          disabled={currentRecipientId === -1 ? true : false}
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
