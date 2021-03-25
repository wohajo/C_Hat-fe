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

  switch (method) {

    // fetch('http://localhost:8081/api/users/register', {
    //   method: 'POST',
    //   headers: {
    //     'Accept': 'application/json',
    //     'Content-Type': 'application/json'
    //   },
    //   body: req.query,
    // })

    case 'POST':
      axios
      .post('http://localhost:8081/api/users/register', postData, axiosConfig)
      break
    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
      res.end()
  }
}