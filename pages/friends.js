import { useSession, getSession } from "next-auth/client";
import allStyles from "../styles/All.module.scss";
import styles from "../styles/Friends.module.scss";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Friends() {
  const [session, loading] = useSession();
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState();
  const [currentTab, setCurrentTab] = useState("find");
  const router = useRouter();

  useEffect(async () => {
    if (!loading && !session?.accessToken) {
      router.push("/");
    } else {
      await getSession().then((res) => {
        if (res !== null) {
          setUsername(res.user.name);
          setUserId(res.id);
        } else {
          router.push("/");
        }
      })
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
  }

  return (
    <div className={allStyles.container}>
      <h1>Manage friends</h1>
      <div className={styles.tabContainer}>
        <div className={styles.tabButtons}>
          <button className={checkIfActive("find", "BTN")} onClick={() => {setCurrentTab(() => "find")}}>Find</button>
          <button className={checkIfActive("your", "BTN")} onClick={() => {setCurrentTab(() => "your")}}>Your friends</button>
          <button className={checkIfActive("pending", "BTN")} onClick={() => {setCurrentTab(() => "pending")}}>Pending invites</button>
          <button className={checkIfActive("sent", "BTN")} onClick={() => {setCurrentTab(() => "sent")}}>Sent invites</button>
        </div>
        <div className={styles.tabs}>
          <div className={checkIfActive("find", "TAB")} id={"find"}>

          </div>
          <div className={checkIfActive("your", "TAB")} id={"your"}>
          </div>
          <div className={checkIfActive("pending", "TAB")} id={"pending"}>
          
          </div>
          <div className={checkIfActive("sent", "TAB")} id={"sent"}>
            
          </div>
        </div>
      </div>
    </div>
  );
}
