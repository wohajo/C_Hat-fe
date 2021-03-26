import axios from 'axios'

export default function authHandler(req, res) {

  let axiosConfig = {
    headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        "Access-Control-Allow-Origin": "*",
    }
  };

  const {
    query: {     
    username,
    password
    },
    method,
  } = req
  
  // TODO catch errors

  switch (method) {
    case 'POST':
      axios
      .post('http://localhost:8081/api/auth/login', req.body, axiosConfig)
      .then((res) => {
        console.log("--OK in api--")
        res.status(200)
        res.end()
      })
      .catch((err) => {
        console.log("--error in api--")
        res.status(err.response.data.status)
        res.end()
      })
      break
    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
      res.end()
  }
}