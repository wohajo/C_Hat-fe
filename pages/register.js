import Head from "next/head";
import styles from "../styles/Home.module.scss";
import allStyles from "../styles/All.module.scss";
import axios from "axios";
import { useState } from "react";
import { Toast } from "react-bootstrap";
import { truncate } from "../components/service/utlis";
import { InputGroup, FormControl, Form, Button } from "react-bootstrap";

export default function Register() {
  const [showToast, setShowToast] = useState(false);
  const [toastTitle, setToastTitle] = useState("");
  const [toastMessasge, setToastMessasge] = useState("");
  const [toastSmall, setToastSmall] = useState("");

  const genericError = (err) => {
    if (err.response === undefined || err.response.status === 503) {
      showToastWith("Connection error", "", "No connection to the server");
      return;
    }
    if (err.response.status === 401)
      showToastWith(
        "Error",
        "something went wrong",
        "Session expired, log in again."
      );
    else if (err.response.status === 500)
      showToastWith("Error", "something went wrong", "Error on our side");
    else if (err.response.status === 403 || err.response.status === 409) {
      if (err.response.data.errors.firstName)
        showToastWith(
          "Error",
          "",
          "First name must be at least 2 characters long"
        );
      else if (err.response.data.errors.lastName)
        showToastWith(
          "Error",
          "",
          "Last name must be at least 2 characters long"
        );
      else if (err.response.data.errors.password)
        showToastWith(
          "Error",
          "",
          "Password must be at least 8 characters long"
        );
      else if (err.response.data.errors.username)
        showToastWith(
          "Error",
          "",
          "Username must be at least 4 characters long"
        );
      else if (err.response.data.errors.email)
        showToastWith("Error", "", "Incorrect email");
    } else if (err.response.status === 400)
      showToastWith("Error", "something went wrong", err.response.data.message);
    else showToastWith("Error", "something went wrong", "We will look into it");
  };

  const showToastWith = (header, smallText, message) => {
    setToastTitle(() => header);
    setToastSmall(() => smallText);
    setToastMessasge(() => message);
    setShowToast(() => true);
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    if (event.target.password.value !== event.target.repeatPassword.value) {
      showToastWith("Error", "", "Passwords must match");
      return;
    }

    if (event.target.email.value !== event.target.repeatEmail.value) {
      showToastWith("Error", "", "Emails must match");
      return;
    }

    let postData = JSON.stringify({
      firstName: event.target.firstName.value,
      lastName: event.target.lastName.value,
      username: event.target.username.value,
      password: event.target.password.value,
      email: event.target.email.value,
    });

    let axiosConfig = {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "Access-Control-Allow-Origin": "*",
      },
    };

    axios
      .post("api/users/register", postData, axiosConfig)
      .then((res) => {
        showToastWith("Success", "", "Registered sucessfully!");
      })
      .catch((err) => {
        genericError(err);
      });
  };

  return (
    <>
      <div className={allStyles.container}>
        <Head>
          <title>C_Hat - Register</title>
        </Head>
        <h1>Register to C_Hat</h1>
        <Form onSubmit={handleRegister} className={styles.credentialsBox} e>
          <Form.Group>
            <Form.Control
              type="text"
              id="firstName"
              name="firstName"
              placeholder="First name"
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Control
              type="text"
              id="lastName"
              name="lastName"
              placeholder="Last name"
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Control
              type="text"
              id="username"
              name="username"
              placeholder="Username"
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Control
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Control
              type="password"
              id="repeatPassword"
              name="repeatPassword"
              placeholder="Repeat password"
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Control
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Control
              type="email"
              id="repeatEmail"
              name="repeatEmail"
              placeholder="Repeat email"
              required
            />
          </Form.Group>
          <Button variant="dark" type="submit">
            Submit
          </Button>
        </Form>
      </div>
      <Toast
        style={{
          position: "absolute",
          top: 4,
          left: "33%",
        }}
        show={showToast}
        delay={6000}
        autohide
        onClose={() => setShowToast(false)}
      >
        <Toast.Header closeButton={false}>
          <strong className="mr-auto">{toastTitle}</strong>
          <small style={{ marginLeft: "5px" }}>{toastSmall}</small>
        </Toast.Header>
        <Toast.Body>{toastMessasge}</Toast.Body>
      </Toast>
    </>
  );
}
