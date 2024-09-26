import "@/styles/globals.css";
import { ChakraProvider } from '@chakra-ui/react';
import Navbar from '../components/Navbar';
// pages/_app.tsx or _app.jsx
import "@/styles/globals.css"; // Import your global styles
import localFont from "next/font/local";
import theme from "@/styles/theme";

const geistSans = localFont({
  src: "../styles/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "../styles/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider className={`${geistSans.variable} ${geistMono.variable}`}>
      {/* <Navbar /> */}
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;
