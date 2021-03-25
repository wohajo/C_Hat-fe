import axios from 'axios'

export default function userHandler(req, res) {
  const {
    query: {     
    firstName,
    lastName,
    username,
    password,
    email 
    },
    method,
  } = req

  switch (method) {
    case 'POST':
      fetch('http://localhost:8081/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: firstName,
          lastName: lastName,
          username: username,
          password: password,
          email: email
        })
      })
      break
    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
      res.end()
  }
}