import axios from "axios";
import ChatArea from "./ChatArea";
import MessageForm from "./MessageForm";
import FriendsList from "./FriendsList";
import { useRouter } from "next/router";
import { React, useContext } from "react";
import { useState, useEffect } from "react";
import {
  axiosAuthConfig,
  decryptString,
  getFromLocalStorage,
  isInLocalStorage,
  setInLocalStorage,
  truncate,
  HOST_API,
} from "./service/utlis";
import styles from "../styles/Chat.module.scss";
import { getSession, signOut } from "next-auth/client";
import { Toast } from "react-bootstrap";
import { SocketContext } from "./service/socket";
import { Button } from "react-bootstrap";

function ChatWindow() {
  const socket = useContext(SocketContext);
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState(0);
  const [friends, setFriends] = useState([]);
  const [messages, setMessages] = useState([]);
  const [responses, setResponses] = useState([]);
  const [roomsMap, setRoomsMap] = useState(new Map());
  const [currentRecipient, setCurrentRecipient] = useState("");
  const [currentRecipientId, setCurrentRecipientId] = useState(-1);
  const [showToast, setShowToast] = useState(false);
  const [toastMessasge, setToastMessasge] = useState("");
  const [toastTitle, setToastTitle] = useState("");
  const [toastSmall, setToastSmall] = useState("send You a message");
  const [messagePagination, setMessagePagination] = useState(2);
  const [olderMsgsButton, setOlderMsgsButton] = useState(false);

  const random = require("random-bigint");

  const router = useRouter();

  useEffect(async () => {
    let resToken = "";
    let resId = "";
    let resUsername = "";
    let resBase = getFromLocalStorage("base");

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

    let privateKey = getFromLocalStorage(`${resUsername}privateKey`);
    let publicKey = getFromLocalStorage(`${resUsername}publicKey`);

    await axios
      .get(`${HOST_API}encryption/base`, axiosAuthConfig(resToken))
      .then((res) => {
        if (
          getFromLocalStorage("base") !== res.data.base ||
          !isInLocalStorage(`${resUsername}privateKey`)
        ) {
          setInLocalStorage("base", res.data.base);
          resBase = res.data.base;

          const base = BigInt(resBase, 16);
          privateKey = random(resBase.toString(2).length);
          publicKey = privateKey * base;

          setInLocalStorage(
            `${resUsername}privateKey`,
            `0x${privateKey.toString(16)}`
          );
          setInLocalStorage(
            `${resUsername}publicKey`,
            `0x${publicKey.toString(16)}`
          );

          axios.put(
            `${HOST_API}encryption/update-public-key/${resId}`,
            { publicKey: `0x${publicKey.toString(16)}` },
            axiosAuthConfig(resToken)
          );
        }
      })
      .catch((err) => genericError(err));

    await axios
      .get(`${HOST_API}friends/my`, axiosAuthConfig(resToken))
      .then((res) => {
        res.data.friends.forEach((friend) => {
          const friendUsername = friend.username;

          const friendPublicKey = BigInt(friend.publicKey, 16);
          const myPrivateKey = BigInt(privateKey, 16);
          const sharedSecret = friendPublicKey * myPrivateKey;

          setInLocalStorage(`${friendUsername}`, friend.publicKey);
          setInLocalStorage(
            `${resUsername}secretWith${friendUsername}`,
            `0x${sharedSecret.toString(16)}`
          );
          joinRoom(resToken, resUsername, friend.username, friend.id);

          setFriends((friends) => [...friends, friend]);
        });
      })
      .catch((err) => genericError(err));
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
  }, []);

  useEffect(() => {
    if (responses.length === 0) return;

    const message = responses[responses.length - 1];

    if (message.roomName === roomsMap.get(currentRecipientId)) {
      setMessages(() => [
        ...messages,
        {
          id: message.id,
          contents: decryptString(
            message.contents,
            getFromLocalStorage(`${username}secretWith${currentRecipient}`)
          ),
          receiverId: message.receiverId,
          senderId: message.senderId,
          timestamp: message.timestamp,
        },
      ]);
    } else {
      let friend = friends.find((f) => f.id === message.senderId);
      showToastWith(
        friend.username,
        "wysłał Ci wiadomość",
        decryptString(
          message.contents,
          getFromLocalStorage(`${username}secretWith${friend.username}`)
        )
      );
    }
  }, [responses, username]);

  const genericError = (err) => {
    if (err.response === undefined) {
      showToastWith("Błąd połączenia", "", "Brak połączenia z serwerem");
      return;
    }
    if (err.response.status === 401)
      showToastWith(
        "Błąd",
        "coś poszło nie tak",
        "Sesja wygasła, zaloguj się ponownie."
      );
    else if (err.response.status === 500)
      showToastWith("Błąd", "coś poszło nie tak", "błąd po naszej stronie");
    else if (err.response.status === 403 || err.response.status === 409)
      showToastWith("Błąd", "", err.response.data.message);
    else showToastWith("Błąd", "coś poszło nie tak", "sprawdzimy to");
  };

  const showToastWith = (header, smallText, message) => {
    setToastTitle(() => header);
    setToastSmall(() => smallText);
    setToastMessasge(() => message);
    setShowToast(() => true);
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
  };

  const signOutHandler = () => {
    friends.forEach((friend) => {
      leaveRoom(friend.username);
    });
    socket.disconnect();
    router.push("/");
    signOut();
  };

  const handleOlderMessages = async () => {
    await axios
      .get(
        `${HOST_API}messages/with/${currentRecipientId}/${messagePagination}`,
        axiosAuthConfig(token)
      )
      .then((res) => {
        let msgs = [];
        res.data.messages.datas.forEach((msg) => {
          msgs.push({
            id: msg.id,
            contents: decryptString(
              msg.contents,
              getFromLocalStorage(`${username}secretWith${currentRecipient}`)
            ),
            receiverId: msg.receiverId,
            senderId: msg.senderId,
            timestamp: msg.timestamp,
          });
        });

        setMessages((messages) => [...msgs, ...messages]);
        setMessagePagination((messagePagination) => messagePagination + 1);
        if (msgs.length === 0) setOlderMsgsButton(() => true);
      })
      .catch((err) => genericError(err));
  };

  return (
    <>
      <Button
        variant="outline-dark"
        size="sm"
        disabled={olderMsgsButton}
        onClick={() => handleOlderMessages()}
      >
        Załaduj poprzednie wiadomości
      </Button>
      <div className={styles.chatContainer}>
        <div className={styles.sidePanel}>
          <div className={styles.utilityWindow}>
            <div onClick={() => signOutHandler()} className={styles.utilityDiv}>
              Wyloguj
            </div>
            <div
              onClick={() => router.push("/friends")}
              className={styles.utilityDiv}
            >
              Znajomi
            </div>
          </div>
          <div className={styles.friendsWindow}>
            <FriendsList
              friends={friends}
              currentRecipientId={currentRecipientId}
              token={token}
              setMessagePagination={setMessagePagination}
              setCurrentRecipient={setCurrentRecipient}
              setCurrentRecipientId={setCurrentRecipientId}
              setOlderMsgsButton={setOlderMsgsButton}
              setMessages={setMessages}
              username={username}
              genericError={genericError}
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
          <strong className="mr-auto">{toastTitle}</strong>
          <small style={{ marginLeft: "5px" }}>{toastSmall}</small>
        </Toast.Header>
        <Toast.Body>{truncate(toastMessasge, 80)}</Toast.Body>
      </Toast>
    </>
  );
}

export default ChatWindow;
