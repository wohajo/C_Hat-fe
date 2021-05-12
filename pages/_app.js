import "../styles/globals.scss";
import { Provider } from "next-auth/client";
import { CookiesProvider } from 'react-cookie';

function MyApp({ Component, pageProps }) {
  return (
    <Provider session={pageProps.session}>
      <CookiesProvider>
        <Component {...pageProps} />
      </CookiesProvider>
    </Provider>
  );
}

export default MyApp;
