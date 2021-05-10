import { useSession, getSession } from "next-auth/client";
import allStyles from "../styles/All.module.scss";
import styles from "../styles/Friends.module.scss";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import FriendRequest from "../components/FriendRequest";
import axios from "axios";

export default function Friends() {
  const [session, loading] = useSession();
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState();
  const [token, setToken] = useState("");

  const [currentTab, setCurrentTab] = useState("find");
  const [friendsRequests, setFriendsRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const router = useRouter();

  useEffect(async () => {
    if (!loading && !session?.accessToken) {
      router.push("/");
    } else {
      await getSession().then((res) => {
        if (res !== null) {
          setUsername(() => res.user.name);
          setToken(() => res.accessToken);
          setUserId(() => res.id);
        } else {
          router.push("/");
        }
      });
    }
  }, [loading, session]);

  const checkIfActive = (tabName, elementToCheck) => {
    if (elementToCheck === "BTN") {
      if (tabName === currentTab) {
        return styles.activeButton;
      }
      return styles.tabButton;
    } else {
      if (tabName === currentTab) {
        return styles.activeTab;
      }
      return styles.tab;
    }
  };

  const handlePending = () => {
    setCurrentTab(() => "pending");
    axios
      .get("http://localhost:8081/api/invites/my/incoming", {
        auth: {
          username: token,
          password: "x",
        },
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "*",
        },
      })
      .then((res) => setFriendsRequests(() => [...res.data.invites]));
  };

  const handleSent = () => {
    setCurrentTab(() => "sent");
    axios
      .get("http://localhost:8081/api/invites/my/sent", {
        auth: {
          username: token,
          password: "x",
        },
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "*",
        },
      })
      .then((res) => setFriendsRequests(() => [...res.data.invites]));
  };

  return (
    <div className={allStyles.container}>
      <h1>Manage friends</h1>
      <div className={styles.tabContainer}>
        <div className={styles.tabButtons}>
          <button
            className={checkIfActive("find", "BTN")}
            onClick={() => {
              setCurrentTab(() => "find");
            }}
          >
            Find
          </button>
          <button
            className={checkIfActive("your", "BTN")}
            onClick={() => {
              setCurrentTab(() => "your");
            }}
          >
            Your friends
          </button>
          <button
            className={checkIfActive("pending", "BTN")}
            onClick={handlePending}
          >
            Pending invites
          </button>
          <button className={checkIfActive("sent", "BTN")} onClick={handleSent}>
            Sent invites
          </button>
        </div>
        <div className={styles.tabs}>
          <div className={checkIfActive("find", "TAB")} id={"find"}>
            <input type="text" placeholder="Find by username" />
            <button>Search</button>
          </div>
          <div className={checkIfActive("your", "TAB")} id={"your"}></div>
          <div className={checkIfActive("pending", "TAB")} id={"pending"}>
            {friendsRequests.map((fr) => {
              return <FriendRequest isPending={true} key={fr.id} {...fr} />;
            })}
          </div>
          <div className={checkIfActive("sent", "TAB")} id={"sent"}>
            {friendsRequests.map((fr) => {
              <FriendRequest isPending={false} key={fr.id} {...fr} />;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
