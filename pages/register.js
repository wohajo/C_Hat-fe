import Head from 'next/head'
import styles from '../styles/Home.module.scss'
import axios from 'axios'

export default function Register() {

  const handleRegister = () => {
    fetch('/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: target.firstName.value,
        lastName: target.lastName.value,
        username: target.username.value,
        password: target.password.value,
        email: target.email.value
      })
    })
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>C_Hat - Register</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
        <h1>Register to C_Hat</h1>
        <form onSubmit={handleRegister} className={styles.credentialsBox}>
            <input type="text" id="firstName" name="firstName" placeholder="First name" required/>
            <input type="text" id="lastName" name="lastName" placeholder="Last name" required/>
            <input type="text" id="username" name="username" placeholder="Username" required/>
            <input type="text" id="email" name="email" placeholder="Email" required/>
            <input type="text" placeholder="Confirm email" required/>
            <input type="password" id="password" name="password" placeholder="Password" required/>
            <input type="password" placeholder="Confirm password" required/>
            <button className={styles.credentialsBoxButton} type="submit">Register</button>
        </form>
    </div>
  )
}
