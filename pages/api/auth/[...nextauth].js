import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import axios from "axios";

const providers = [
  Providers.Credentials({
    name: "Credentials",
    authorize: async (credentials) => {
      var postData = JSON.stringify({
        username: credentials.username,
        password: credentials.password,
      });

      let axiosConfig = {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
        },
      };

      try {
        const user = await axios.post(
          "http://localhost:8081/api/auth/login",
          postData,
          axiosConfig
        );

        if (user) {
          return { status: "success", data: user.data };
        }
      } catch (error) {
        throw new Error(error.response.data.message);
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
    error: "/",
  },
};

export default (req, res) => NextAuth(req, res, options);
