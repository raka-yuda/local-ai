// theme.ts or theme.js
import { extendTheme } from "@chakra-ui/react";
import localFont from "next/font/local";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// Extend Chakra's theme with your fonts
const theme = extendTheme({
  fonts: {
    heading: `'Geist Sans', sans-serif`, // Apply for headings
    body: `'Geist Sans', sans-serif`,    // Apply for body text
    mono: `'Geist Mono', monospace`,     // Apply for monospace, like code
  },
  styles: {
    global: {
      "@font-face": [
        {
          fontFamily: "Geist Sans",
          src: `url(./fonts/GeistVF.woff) format('woff')`,
          fontWeight: "100 900",
          fontStyle: "normal",
        },
        {
          fontFamily: "Geist Mono",
          src: `url(/fonts/GeistMonoVF.woff) format('woff')`,
          fontWeight: "100 900",
          fontStyle: "normal",
        },
      ],
    },
  },
});

export default theme;
