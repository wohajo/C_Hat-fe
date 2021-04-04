import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import axios from "axios";

const providers = [
  Providers.Credentials({
    name: "Credentials",
    authorize: async (credentials) => {
      console.log("starting post request");

      var postData = JSON.stringify({
        username: credentials.username,
        password: credentials.password
      })
    
      let axiosConfig = {
        headers: {
            'Content-Type': 'application/json;charset=UTF-8',
        }
      };
      
      axios.post('http://localhost:8081/api/auth/login', postData, axiosConfig)
      .then((res) => {
        console.log(res.status)
        console.log(res.data)
        return { status: "success", data: res.data };
      })
      .catch((err) => {
        console.log(err.response.data.status)
        console.log(err.response.data.message)
        throw new Error(err.response.data.message);
      })
      
      // if (credentials.password === "test") {
      //   console.log("finished post request");
      //   return { status: "success", data: {"token": "Asddsadadsds"} };
      // } else {
      //   console.log("finished post request");
      //   throw new Error(errorMessage + "&email=" + credentials.username);
      // }
    },
  }),
];

const callbacks = {
  async jwt(token, user) {
    if (user) {
      token.accessToken = user.data.token;
    }

    return token;
  },

  async session(session, token) {
    session.accessToken = token.accessToken;
    return session;
  },
};

const options = {
  providers,
  callbacks,
  pages: {
    signIn: "/",
    error: "/register", // Changing the error redirect page to our custom login page
  },
};

export default (req, res) => NextAuth(req, res, options);
