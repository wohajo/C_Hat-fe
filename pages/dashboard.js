import { useSession, signOut, getSession } from "next-auth/client";
import allStyles from "../styles/All.module.scss";
import { useRouter } from "next/router";
import { useEffect } from "react";
import ChatWindow from "../components/ChatWindow";

export default function Dashobard({ data }) {
  const [session, loading] = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session?.accessToken) {
      router.push("/");
    }

    if (session) {
      return <p>{session.accessToken}</p>;
    }
  }, [loading, session]);

  return (
    <div className={allStyles.container}>
      <h1>Welcome, {data.title}</h1>
      <button onClick={() => signOut()}>Log Out</button>
      <ChatWindow />
    </div>
  );
}

export async function getServerSideProps() {
  const res = await fetch(`https://jsonplaceholder.typicode.com/todos/1`);
  const data = await res.json();

  return { props: { data } };
}
