import Head from 'next/head'
import styles from '../styles/Home.module.scss'
import axios from 'axios'

export default function Home() {

  const handleLogin = async event => {
    var postData = JSON.stringify({
      username: event.target.username.value,
      password: event.target.password.value
    })
  
    let axiosConfig = {
      headers: {
          'Content-Type': 'application/json;charset=UTF-8',
      }
    };
  
    event.preventDefault()
    axios.post('http://localhost:8081/api/auth/login', postData, axiosConfig)
    .then((res) => {
      console.log(res.status)
      console.log(res.data)
    })
    .catch((err) => {
      console.log(err.response.data.status)
      console.log(err.response.data.message)
      alert(err.response.data.message)
    })
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>C_Hat</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
        <h1>Welcome to C_Hat</h1>
        <form onSubmit={handleLogin} className={styles.credentialsBox}>
          <input type="text" id="username" name="username" placeholder="Username" required/>
          <input type="password" id="password" name="password" placeholder="Password" required/>
          <button type="submit" className={styles.credentialsBoxButton}>Log in</button>
        </form>
        <a href="/register" id={styles.goToRegisterButton}>Need an account? Register here!</a>
    </div>
  )
}