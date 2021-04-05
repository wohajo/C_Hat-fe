import Head from "next/head";
import styles from "../styles/Home.module.scss";
import axios from "axios";

export default function Register() {
  const handleRegister = async (event) => {
    var postData = JSON.stringify({
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

    event.preventDefault();
    axios
      .post("http://localhost:8081/api/users/register", postData, axiosConfig)
      .then((res) => {
        console.log(res.status);
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err.response.data.status);
        console.log(err.response.data.message);
        alert(err.response.data.message);
      });
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>C_Hat - Register</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1>Register to C_Hat</h1>
      <form onSubmit={handleRegister} className={styles.credentialsBox}>
        <input
          type="text"
          id="firstName"
          name="firstName"
          placeholder="First name"
          required
        />
        <input
          type="text"
          id="lastName"
          name="lastName"
          placeholder="Last name"
          required
        />
        <input
          type="text"
          id="username"
          name="username"
          placeholder="Username"
          required
        />
        <input
          type="text"
          id="email"
          name="email"
          placeholder="Email"
          required
        />
        <input type="text" placeholder="Confirm email" required />
        <input
          type="password"
          id="password"
          name="password"
          placeholder="Password"
          required
        />
        <input type="password" placeholder="Confirm password" required />
        <button className={styles.credentialsBoxButton} type="submit">
          Register
        </button>
      </form>
    </div>
  );
}
