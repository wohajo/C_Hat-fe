import Head from 'next/head'
import styles from '../styles/Home.module.scss'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>C_Hat - Register</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
        <h1>Register to C_Hat</h1>
        <div className={styles.credentialsBox}>
            <input type="text" placeholder="First name"/>
            <input type="text" placeholder="Last name"/>
            <input type="text" placeholder="Username"/>
            <input type="text" placeholder="Email"/>
            <input type="text" placeholder="Confirm email"/>
            <input type="text" placeholder="Password"/>
            <input type="text" placeholder="Confirm password"/>
        </div>
    </div>
  )
}
