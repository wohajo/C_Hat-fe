import axios from 'axios'

export default function userHandler(req, res) {
  var postData = {
    email: "test@test.com",
    password: "password"
  };

  let axiosConfig = {
    headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        "Access-Control-Allow-Origin": "*",
    }
  };

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
  
  // TODO catch errors

  switch (method) {
    case 'POST':
      axios
      .post('http://localhost:8081/api/users/register', req.body, axiosConfig)
      .catch((err) => {
        console.log("--error in sending--")
        res.status(err.status)
        res.end()
      })
      .then((res) => {
        console.log("--OK--")
        res.status(200)
        res.end()
      })
      break
    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
      res.end()
  }
}