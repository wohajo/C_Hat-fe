import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import axios from "axios";

const providers = [
  Providers.Credentials({
    name: "Credentials",
    authorize: async (credentials) => {
      console.log("------ starting post request -------");

      var postData = JSON.stringify({
        username: credentials.username,
        password: credentials.password,
      });

      let axiosConfig = {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
        },
      };

      // THIS VERSION VALIDATES PROPERLY, BUT I CAN'T GET ERROR MESSAGE IN CASE OF ERROR

      // const user = await axios
      //   .post("http://localhost:8081/api/auth/login", postData, axiosConfig)

      // if (user) {
      //   console.log("finished post request");
      //   return { status: "success", data: user.data };
      // } else {
      //   console.log("finished post request");
      //   throw new Error("err");
      // }

      // THIS VERSION VALIDATES PROPERLY, BUT ALWAYS RETURNS ERROR

      try {
        const user = await axios
        .post("http://localhost:8081/api/auth/login", postData, axiosConfig)
        
        if (user.token) {
          console.log("finished post request with sucess");
          return { status: "success", data: {"token": "Asddsadadsds"} };
        }
      } catch (error) {
        console.log("finished post request with error");
        throw new Error("err");
      }
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
