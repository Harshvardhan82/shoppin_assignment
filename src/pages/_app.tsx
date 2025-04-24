import { Provider } from "react-redux"; // adjust import as per your structure
import "@/src/styles/globals.css";
import { store } from "../LocalProvider/store";
import { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
}
