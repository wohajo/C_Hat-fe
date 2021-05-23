import "../styles/globals.scss";
import "bootstrap/dist/css/bootstrap.css";
import { Provider } from "next-auth/client";
import { socket, SocketContext } from "../components/service/socket";

function MyApp({ Component, pageProps }) {
  return (
    <SocketContext.Provider value={socket}>
      <Provider session={pageProps.session}>
        <Component {...pageProps} />
      </Provider>
    </SocketContext.Provider>
  );
}

export default MyApp;
