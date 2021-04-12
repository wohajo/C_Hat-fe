import axios from "axios";

export default function userHandler(req, res) {
  let axiosConfig = {
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      "Access-Control-Allow-Origin": "*",
    },
  };

  const {
    query: { firstName, lastName, username, password, email },
    method,
  } = req;

  switch (method) {
    case "POST":
      axios
        .post("http://localhost:8081/api/users/register", req.body, axiosConfig)
        .then((serverResponse) => {
          res.status(200).json(serverResponse.data);
          res.end();
        })
        .catch((err) => {
          res.status(err.response.data.status).json(err.response.data);
          res.end();
        });
      break;
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
      res.end();
  }
}
