import Head from 'next/head'
import styles from '../styles/Home.module.scss'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>C_Hat</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
        <h1>Welcome to C_Hat</h1>
        <div className={styles.credentialsBox}>
          <div className={styles.login}>
            <input type="text" placeholder="Username"/>
            </div>
          <div className={styles.password}>
            <input type="password" placeholder="Password"/>
            </div>
        </div>
        <a href="/register" id={styles.registerButton}>Need an account? Register here!</a>
    </div>
  )
}
