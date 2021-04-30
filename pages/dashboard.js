import { useSession, signOut, getSession } from "next-auth/client";
import allStyles from "../styles/All.module.scss";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ChatWindow from "../components/ChatWindow";

export default function Dashobard() {
  const [session, loading] = useSession();
  const [username, setUsername] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session?.accessToken) {
      router.push("/");
    }
  }, [loading, session]);

  useEffect(async () => {
    await getSession().then((res) => {
      if (res !== null) {
        setUsername(res.user.name);
      } else {
        router.push("/");
      }
    });
  }, []);

  return (
    <div className={allStyles.container}>
      <h1>Welcome, {username}</h1>
      <ChatWindow username={username} />
    </div>
  );
}
