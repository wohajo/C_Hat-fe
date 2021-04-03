import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import axios from "axios";

const providers = [
  Providers.Credentials({
    name: "Credentials",
    authorize: async (credentials) => {
      console.log("provider");
      try {
        const user = await axios.post(
          "localhost:8081/api/auth/login",
          {
            user: {
              username: credentials.username,
              password: credentials.password,
            },
          },
          {
            headers: {
              accept: "*/*",
              "Content-Type": "application/json",
            },
          }
        );

        console.log("provider");

        if (user) {
          return { status: "success", data: user };
        }
      } catch (e) {
        const errorMessage = e.response.data.message;
        // Redirecting to the login page with error messsage in the URL
        throw new Error(errorMessage + "&email=" + credentials.username);
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
    error: "/register", // Changing the error redirect page to our custom login page
  },
};

export default (req, res) => NextAuth(req, res, options);
