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
        .then((res) => {
          console.log("--OK in sending--");
          res.status(200);
          res.end();
        })
        .catch((err) => {
          console.log("--error in sending--");
          res.status(err.response.data.status);
          res.end();
        });
      break;
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
      res.end();
  }
}
