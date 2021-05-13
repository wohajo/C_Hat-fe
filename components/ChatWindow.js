import React, { useState, useEffect } from "react";
import styles from "../styles/Chat.module.scss";
import { getSession, signOut } from "next-auth/client";
import { socket } from "./service/socket";
import { useRouter } from "next/router";
import axios from "axios";
import { useCookies } from "react-cookie";
import { decryptString, encryptString } from "./service/utlis";

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
  const [cookies, setCookie] = useCookies([]);

  const random = require("random-bigint");

  const router = useRouter();

  useEffect(async () => {
    var resToken = "";
    var resId = "";
    var resUsername = "";
    var resBase = cookies.base;
    var privateKey = cookies.privateKey;
    var publicKey = cookies.publicKey;

    await getSession().then(async (sessionRes) => {
      if (sessionRes !== null) {
        resToken = sessionRes.accessToken;
        resId = sessionRes.id;
        resUsername = sessionRes.user.name;
        setToken(() => sessionRes.accessToken);
        setUserId(() => sessionRes.id);
      } else {
        router.push("/");
      }
    });

    await axios
      .get("http://localhost:8081/api/encryption/base", {
        auth: {
          username: resToken,
          password: "x",
        },
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "*",
        },
      })
      .then((res) => {
        if (cookies.base === undefined || cookies.base !== res.data.base) {
          setCookie("base", res.data.base, { path: "/" });
          resBase = res.data.base;
        }
      })
      .catch((err) => console.log(err));

    if (cookies.base !== resBase) {
      const base = BigInt(resBase, 16);
      privateKey = random(resBase.toString(2).length);
      publicKey = privateKey * base;

      setCookie("privateKey", `0x${privateKey.toString(16)}`, {
        path: "/",
      });
      setCookie("publicKey", `0x${publicKey.toString(16)}`, {
        path: "/",
      });

      axios.put(
        `http://localhost:8081/api/encryption/update-public-key/${resId}`,
        { publicKey: `0x${publicKey.toString(16)}` },
        {
          auth: {
            username: resToken,
            password: "x",
          },
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    await axios
      .get("http://localhost:8081/api/friends/my", {
        auth: {
          username: resToken,
          password: "x",
        },
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "*",
        },
      })
      .then((res) => {
        res.data.friends.forEach((friend) => {
          const friendUsername = friend.username;

          if (
            friend.publicKey !== "" ||
            friend.publicKey !== null ||
            friend.publicKey !== undefined
          ) {
            console.log(`setting cookie for ${friendUsername}`);
            console.log(`friends public key: ${friend.publicKey}`);

            const friendPublicKey = BigInt(friend.publicKey, 16);
            const myPrivateKey = BigInt(privateKey, 16);
            const sharedSecret = friendPublicKey * myPrivateKey;

            console.log(`sharedSecret with ${friendUsername}: ${sharedSecret}`);

            setCookie(friendUsername, `0x${sharedSecret.toString(16)}`, {
              path: "/",
            });

            joinRoom(resToken, resUsername, friend.username, friend.id);

            setFriends((friends) => [...friends, friend]);
          }
        });
      })
      .catch((err) => console.log(err));
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
      setMessages(() => [
        ...messages,
        {
          contents: decryptString(message.contents, cookies[currentRecipient]),
          receiverId: message.receiverId,
          senderId: message.senderId,
          timestamp: message.timestamp,
        },
      ]);
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

    const encryptedMessageString = encryptString(
      messageValue,
      cookies[currentRecipient]
    );

    socket.emit("room_message", {
      roomName: receiverRoom,
      sender: username,
      senderId: userId,
      receiver: currentRecipient,
      receiverId: receiver.id,
      contents: encryptedMessageString,
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

  const getMessages = async (userId, username) => {
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
        let msgs = [];
        res.data.messages.datas.forEach((msg) => {
          msgs.push({
            contents: decryptString(msg.contents, cookies[username]),
            receiverId: msg.receiverId,
            senderId: msg.senderId,
            timestamp: msg.timestamp,
          });
        });

        setMessages(() => [...msgs]);
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
                  getMessages(friend.id, friend.username);
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
        {currentRecipient === undefined ? (
          <div></div>
        ) : (
          messages.map((message) => {
            return (
              <p
                key={message.timestamp}
                className={checkUser(message.senderId)}
              >
                {message.contents}
              </p>
            );
          })
        )}
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
        <button
          className={styles.sendButton}
          onClick={sendMessage}
          disabled={currentRecipientId === -1 ? true : false}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;
