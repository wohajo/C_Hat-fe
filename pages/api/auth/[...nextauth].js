import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import axios from "axios";

const providers = [
  Providers.Credentials({
    name: "Credentials",
    authorize: async (credentials) => {
      let axiosConfig = {
        auth: {
          username: credentials.username,
          password: credentials.password,
        },
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
        },
      };

      try {
        const HOST_API = "http://localhost:8081/api/";
        const user = await axios.post(`${HOST_API}auth/login`, {}, axiosConfig);
        if (user) {
          return { status: "success", data: user.data };
        }
      } catch (error) {
        console.log(error);
        throw new Error(error.response.data);
      }
    },
  }),
];

const callbacks = {
  async jwt(token, user) {
    if (user) {
      token.accessToken = user.data.token;
      token.user = user.data.username;
      token.id = user.data.id;
    }

    return token;
  },

  async session(session, token) {
    session.accessToken = token.accessToken;
    session.user.name = token.user;
    session.id = token.id;
    return session;
  },
};

const options = {
  providers,
  callbacks,
  pages: {
    signIn: "/",
    error: "/",
  },
};

export default (req, res) => NextAuth(req, res, options);
