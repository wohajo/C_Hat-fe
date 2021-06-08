import { useSession, getSession } from "next-auth/client";
import allStyles from "../styles/All.module.scss";
import styles from "../styles/Friends.module.scss";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import FriendRequest from "../components/FriendRequest";
import Friend from "../components/Friend";
import axios from "axios";
import { Toast } from "react-bootstrap";
import { InputGroup, Button, FormControl, Form } from "react-bootstrap";
import {
  axiosAuthConfig,
  truncate,
  HOST_API,
} from "../components/service/utlis";

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

  const [showToast, setShowToast] = useState(false);
  const [toastTitle, setToastTitle] = useState("");
  const [toastMessasge, setToastMessasge] = useState("");
  const [toastSmall, setToastSmall] = useState("");

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
      .catch((err) => {
        genericError(err);
      });
  };

  const handleMyFriends = () => {
    setFriends(() => []);
    setCurrentTab(() => "your");
    axios
      .get(`${HOST_API}friends/my`, axiosAuthConfig(token))
      .then((res) => setFriends(() => [...res.data.friends]))
      .catch((err) => {
        genericError(err);
      });
  };

  const SearchFriends = (searchOption, searchString) => {
    if (searchString.length === 0) return;
    axios
      .get(
        `${HOST_API}users/find/${searchOption}/${searchString}`,
        axiosAuthConfig(token)
      )
      .then((res) => setFriends(() => [...res.data.users]))
      .catch((err) => genericError(err));
  };

  const handleFind = () => {
    setCurrentTab(() => "find");
    setFriends(() => []);
    setSearchNameString(() => "");
    setSearchUsernameString(() => "");
  };

  return (
    <>
      <div className={allStyles.container}>
        <Button
          variant="outline-dark"
          onClick={() => router.push("/dashboard")}
        >
          Powrót
        </Button>{" "}
        <h1>Zarządzaj znajomymi</h1>
        <div className={styles.tabContainer}>
          <div className={styles.tabButtons}>
            <button
              className={checkIfActive("find", "BTN")}
              onClick={handleFind}
            >
              Znajdź
            </button>
            <button
              className={checkIfActive("your", "BTN")}
              onClick={handleMyFriends}
            >
              Twoi znajomi
            </button>
            <button
              className={checkIfActive("pending", "BTN")}
              onClick={() => handleInvites("pending")}
            >
              Oczekujące zaproszenia
            </button>
            <button
              className={checkIfActive("sent", "BTN")}
              onClick={() => handleInvites("sent")}
            >
              Wysłane zaproszenia
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
                    placeholder="Po imieniu i nazwisku"
                    value={searchNameString}
                    onChange={(e) => setSearchNameString(() => e.target.value)}
                  />
                  <InputGroup.Append>
                    <Button variant="dark" id="send-button" type="submit">
                      Wyszukaj
                    </Button>
                  </InputGroup.Append>
                </InputGroup>
              </Form>
              <p>lub</p>
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  SearchFriends("username", searchUsernameString);
                }}
                inline
              >
                <InputGroup className="mb-3">
                  <FormControl
                    placeholder="Po nazwie użytkownika"
                    value={searchUsernameString}
                    onChange={(e) =>
                      setSearchUsernameString(() => e.target.value)
                    }
                  />
                  <InputGroup.Append>
                    <Button variant="dark" id="send-button" type="submit">
                      Wyszukaj
                    </Button>
                  </InputGroup.Append>
                </InputGroup>
              </Form>
              {friends.map((fr) => {
                return (
                  <Friend
                    genericError={genericError}
                    showToastWith={showToastWith}
                    isFound={true}
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
            <div className={checkIfActive("your", "TAB")} id={"your"}>
              {friends.map((fr) => {
                return (
                  <Friend
                    genericError={genericError}
                    showToastWith={showToastWith}
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
                    genericError={genericError}
                    showToastWith={showToastWith}
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
                    genericError={genericError}
                    showToastWith={showToastWith}
                  />
                );
              })}
            </div>
          </div>
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
