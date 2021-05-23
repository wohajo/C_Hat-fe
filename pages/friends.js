import { useSession, getSession } from "next-auth/client";
import allStyles from "../styles/All.module.scss";
import styles from "../styles/Friends.module.scss";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import FriendRequest from "../components/FriendRequest";
import Friend from "../components/Friend";
import axios from "axios";
import { InputGroup, Button, FormControl, Form } from "react-bootstrap";
import { axiosAuthConfig } from "../components/service/utlis";

export default function Friends() {
  const [session, loading] = useSession();
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState();
  const [token, setToken] = useState("");

  const [currentTab, setCurrentTab] = useState("find");
  const [friendsRequests, setFriendsRequests] = useState([]);
  const [friends, setFriends] = useState([]);

  const [searchUsernameString, setSearchUsernameString] = useState("");
  const [searchNameString, setSearchNameString] = useState("");

  const router = useRouter();
  const HOST_API = "http://localhost:8081/api/";

  // TODO toast error/ok handling

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

  const handleInvites = (option) => {
    setFriendsRequests(() => []);
    setCurrentTab(() => option);
    axios
      .get(`${HOST_API}invites/my/${option}`, axiosAuthConfig(token))
      .then((res) => setFriendsRequests(() => [...res.data.invites]))
      .catch((err) => console.log(err));
  };

  const handleMyFriends = () => {
    setFriends(() => []);
    setCurrentTab(() => "your");
    axios
      .get(`${HOST_API}friends/my`, axiosAuthConfig(token))
      .then((res) => setFriends(() => [...res.data.friends]))
      .catch((err) => console.log(err));
  };

  const SearchFriends = (searchOption, searchString) => {
    if (searchString.length === 0) return;
    axios
      .get(
        `${HOST_API}users/find/${searchOption}/${searchString}`,
        axiosAuthConfig(token)
      )
      .then((res) => setFriends(() => [...res.data.users]))
      .catch((err) => console.log(err));
  };

  const handleFind = () => {
    setCurrentTab(() => "find");
    setFriends(() => []);
    setSearchNameString(() => "");
    setSearchUsernameString(() => "");
  };

  return (
    <div className={allStyles.container}>
      <Button variant="link" onClick={() => router.push("/dashboard")}>
        go back
      </Button>{" "}
      <h1>Manage friends</h1>
      <div className={styles.tabContainer}>
        <div className={styles.tabButtons}>
          <button className={checkIfActive("find", "BTN")} onClick={handleFind}>
            Find
          </button>
          <button
            className={checkIfActive("your", "BTN")}
            onClick={handleMyFriends}
          >
            Your friends
          </button>
          <button
            className={checkIfActive("pending", "BTN")}
            onClick={() => handleInvites("pending")}
          >
            Pending invites
          </button>
          <button
            className={checkIfActive("sent", "BTN")}
            onClick={() => handleInvites("sent")}
          >
            Sent invites
          </button>
        </div>
        <div className={styles.tabs}>
          <div className={checkIfActive("find", "TAB")} id={"find"}>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                SearchFriends("name", searchNameString);
              }}
              inline
            >
              <InputGroup className="mb-3">
                <FormControl
                  placeholder="Find by name"
                  value={searchNameString}
                  onChange={(e) => setSearchNameString(() => e.target.value)}
                />
                <InputGroup.Append>
                  <Button variant="dark" id="send-button" type="submit">
                    Search
                  </Button>
                </InputGroup.Append>
              </InputGroup>
            </Form>
            <p>or</p>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                SearchFriends("username", searchUsernameString);
              }}
              inline
            >
              <InputGroup className="mb-3">
                <FormControl
                  placeholder="Find by username"
                  value={searchUsernameString}
                  onChange={(e) =>
                    setSearchUsernameString(() => e.target.value)
                  }
                />
                <InputGroup.Append>
                  <Button variant="dark" id="send-button" type="submit">
                    Search
                  </Button>
                </InputGroup.Append>
              </InputGroup>
            </Form>
            {friends.map((fr) => {
              return (
                <Friend
                  isFound={true}
                  key={fr.id}
                  {...fr}
                  userId={userId}
                  token={token}
                />
              );
            })}
          </div>
          <div className={checkIfActive("your", "TAB")} id={"your"}>
            {friends.map((fr) => {
              return (
                <Friend
                  isFound={false}
                  key={fr.id}
                  {...fr}
                  friends={friends}
                  setFriends={setFriends}
                  userId={userId}
                  token={token}
                />
              );
            })}
          </div>
          <div className={checkIfActive("pending", "TAB")} id={"pending"}>
            {friendsRequests.map((fr) => {
              return (
                <FriendRequest
                  isPending={true}
                  setFriendsRequests={setFriendsRequests}
                  friendsRequests={friendsRequests}
                  key={fr.id}
                  {...fr}
                  token={token}
                />
              );
            })}
          </div>
          <div className={checkIfActive("sent", "TAB")} id={"sent"}>
            {friendsRequests.map((fr) => {
              return (
                <FriendRequest
                  isPending={false}
                  setFriendsRequests={setFriendsRequests}
                  friendsRequests={friendsRequests}
                  key={fr.id}
                  {...fr}
                  token={token}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
