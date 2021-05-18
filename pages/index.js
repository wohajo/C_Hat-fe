import Head from "next/head";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/client";
import { useRouter } from "next/router";
import styles from "../styles/Home.module.scss";
import allStyles from "../styles/All.module.scss";
import { Form, Button } from "react-bootstrap";

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
      <h1>Welcome to C_Hat</h1>{" "}
      <span className={styles.error}>{loginError}</span>
      <Form onSubmit={(e) => handleLogin(e)} className={styles.credentialsBox}>
        <Form.Group controlId="formBasicUsername">
          <Form.Control
            onChange={(e) => setUsername(e.target.value)}
            type="text"
            placeholder="Username"
            required
          />
        </Form.Group>

        <Form.Group controlId="formBasicPassword">
          <Form.Control
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            required
          />
        </Form.Group>
        <Button variant="dark" type="submit">
          Submit
        </Button>
      </Form>
      <Button
        variant="link"
        type="submit"
        onClick={() => router.push("/register")}
      >
        Need an account? Register here!
      </Button>
    </div>
  );
}
