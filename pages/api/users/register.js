import axios from "axios";

export default async function userHandler(req, res) {
  const HOST_API = "http://localhost:8081/api/";
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
      await axios
        .post(`${HOST_API}users/register`, req.body, axiosConfig)
        .then((serverResponse) => {
          res.status(200).json(serverResponse.data);
          res.end();
        })
        .catch((err) => {
          if (err.code === "ECONNREFUSED") {
            res.status(503).json({ message: "No connection to the server" });
          } else {
            res.status(err.response.status).json(err.response.data);
          }
          res.end();
        });
      break;
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
      res.end();
  }
}
