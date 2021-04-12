import Head from "next/head";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/client";
import { useRouter } from "next/router";
import styles from "../styles/Home.module.scss";
import allStyles from "../styles/All.module.scss";

export default function Home() {
  const [getUsername, setUsername] = useState("");
  const [getPassword, setPassword] = useState("");
  const [hasLoginStarted, setHasLoginStarted] = useState(false);
  const [loginError, setLoginError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (router.query.error) {
      setLoginError(router.query.error);
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setHasLoginStarted(true);
    console.log("logging in")
    await signIn("credentials", {
      username: getUsername,
      password: getPassword,
      callbackUrl: `${window.location.origin}/dashboard`,
    });
  };

  return (
    <div className={allStyles.container}>
      <Head>
        <title>C_Hat</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1>Welcome to C_Hat</h1>
      <form onSubmit={(e) => handleLogin(e)} className={styles.credentialsBox}>
        <span className={styles.error}>{loginError}</span>
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
        <button
          type="submit"
          disabled={hasLoginStarted}
          className={styles.credentialsBoxButton}
        >
          Log in
        </button>
      </form>
      <a href="/register" id={styles.goToRegisterButton}>
        Need an account? Register here!
      </a>
    </div>
  );
}
