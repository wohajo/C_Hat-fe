import axios from "axios";
import ChatArea from "./ChatArea";
import MessageForm from "./MessageForm";
import FriendsList from "./FriendsList";
import { useRouter } from "next/router";
import { useCookies } from "react-cookie";
import { socket } from "./service/socket";
import { React, useCallback } from "react";
import { useState, useEffect } from "react";
import { axiosAuthConfig, decryptString, truncate } from "./service/utlis";
import styles from "../styles/Chat.module.scss";
import { getSession, signOut } from "next-auth/client";
import { Toast } from "react-bootstrap";

function ChatWindow() {
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState(0);
  const [friends, setFriends] = useState([]);
  const [messages, setMessages] = useState([]);
  const [responses, setResponses] = useState([]);
  const [roomsMap, setRoomsMap] = useState(new Map());
  const [currentRecipient, setCurrentRecipient] = useState("");
  const [currentRecipientId, setCurrentRecipientId] = useState(-1);
  const [cookies, setCookie] = useCookies([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessasge, setToastMessasge] = useState("");
  const [toastUsername, setToastUsername] = useState("");
  const HOST_API = "http://localhost:8081/api/";

  const random = require("random-bigint");

  const router = useRouter();

  useEffect(async () => {
    let resToken = "";
    let resId = "";
    let resUsername = "";
    let resBase = cookies.base;
    let privateKey = cookies.privateKey;
    let publicKey = cookies.publicKey;

    await getSession().then(async (sessionRes) => {
      if (sessionRes !== null) {
        resToken = sessionRes.accessToken;
        resId = sessionRes.id;
        resUsername = sessionRes.user.name;
        setToken(() => sessionRes.accessToken);
        setUserId(() => sessionRes.id);
        setUsername(() => sessionRes.user.name);
      } else {
        router.push("/");
      }
    });

    await axios
      .get(`${HOST_API}encryption/base`, axiosAuthConfig(resToken))
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
        `${HOST_API}encryption/update-public-key/${resId}`,
        { publicKey: `0x${publicKey.toString(16)}` },
        axiosAuthConfig(resToken)
      );
    }

    await axios
      .get(`${HOST_API}friends/my`, axiosAuthConfig(resToken))
      .then((res) => {
        res.data.friends.forEach((friend) => {
          const friendUsername = friend.username;

          console.log(`setting cookie for ${friendUsername}`);
          console.log(`friends public key: ${friend.publicKey}`);

          const friendPublicKey = BigInt(friend.publicKey, 16);
          const myPrivateKey = BigInt(privateKey, 16);
          const sharedSecret = friendPublicKey * myPrivateKey;

          console.log(`sharedSecret with ${friendUsername}: ${sharedSecret}`);

          setCookie(friendUsername, friend.publicKey, {
            path: "/",
          });
          setCookie(
            "secretWith" + friendUsername,
            `0x${sharedSecret.toString(16)}`,
            {
              path: "/",
            }
          );
          joinRoom(resToken, resUsername, friend.username, friend.id);

          setFriends((friends) => [...friends, friend]);
        });
      })
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    socket.on("room_response", (data) => {
      setResponses((responses) => [...responses, data]);
    });

    socket.on("sid", (data) => {
      getSession().then(async (sessionRes) => {
        if (sessionRes !== null)
          socket.emit("sid_event", {
            sid: data.sid,
            username: sessionRes.user.name,
          });
      });
    });

    socket.on("room name response", (data) => {
      setRoomsMap((roomsMap) => roomsMap.set(data.recipientId, data.roomName));
    });
    return () => socket.close();
  }, []);

  useEffect(() => {
    if (responses.length === 0) return;

    const message = responses[responses.length - 1];

    if (message.roomName === roomsMap.get(currentRecipientId)) {
      console.log("setting messages from socket");
      setMessages(() => [
        ...messages,
        {
          contents: decryptString(
            message.contents,
            cookies["secretWith" + currentRecipient]
          ),
          receiverId: message.receiverId,
          senderId: message.senderId,
          timestamp: message.timestamp,
        },
      ]);
    } else {
      let friend = friends.find((f) => f.id === message.senderId);
      console.log(friend);
      setToastUsername(friend.username);
      setToastMessasge(
        decryptString(message.contents, cookies["secretWith" + friend.username])
      );
      setShowToast(() => true);
    }
  }, [responses]);

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
  };

  const signOutHandler = () => {
    friends.forEach((friend) => {
      leaveRoom(friend.username);
    });
    socket.disconnect();
    router.push("/");
    signOut();
  };

  return (
    <>
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
              Friends
            </div>
          </div>
          <div className={styles.friendsWindow}>
            <FriendsList
              friends={friends}
              currentRecipientId={currentRecipientId}
              token={token}
              cookies={cookies}
              setCurrentRecipient={setCurrentRecipient}
              setCurrentRecipientId={setCurrentRecipientId}
              setMessages={setMessages}
            />
          </div>
        </div>
        <div className={styles.chatArea}>
          <ChatArea
            currentRecipient={currentRecipient}
            messages={messages}
            userId={userId}
          />
        </div>
        <div className={styles.messageArea}>
          <MessageForm
            cookies={cookies}
            currentRecipient={currentRecipient}
            currentRecipientId={currentRecipientId}
            friends={friends}
            roomsMap={roomsMap}
            socket={socket}
            username={username}
            userId={userId}
            token={token}
          />
        </div>
      </div>
      <Toast
        style={{
          position: "absolute",
          top: 4,
        }}
        show={showToast}
        delay={3000}
        autohide
        onClose={() => setShowToast(false)}
      >
        <Toast.Header closeButton={false}>
          <strong className="mr-auto">{toastUsername}</strong>
          <small style={{ marginLeft: "5px" }}>send You a message</small>
        </Toast.Header>
        <Toast.Body>{truncate(toastMessasge, 80)}</Toast.Body>
      </Toast>
    </>
  );
}

export default ChatWindow;
