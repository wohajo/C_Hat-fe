import Head from "next/head";
import { useState } from "react";
import { signIn } from "next-auth/client";
import styles from "../styles/Home.module.scss";

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    signIn("credentials", {
      username,
      password,
      callbackUrl: `${window.location.origin}/welcome`,
    });
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>C_Hat</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1>Welcome to C_Hat</h1>
      <form onSubmit={(e) => handleLogin(e)} className={styles.credentialsBox}>
        <input
          type="text"
          id="username"
          name="username"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          id="password"
          name="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className={styles.credentialsBoxButton}>
          Log in
        </button>
      </form>
      <a href="/register" id={styles.goToRegisterButton}>
        Need an account? Register here!
      </a>
    </div>
  );
}
