import React, { useState, useEffect } from "react";
import Routes from "./routes";
import "react-toastify/dist/ReactToastify.css";
// import OneSignal from "react-onesignal";

import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import { ptBR } from "@material-ui/core/locale";

import lightBackground from "../src/assets/wa-background.png";
import darkBackground from "../src/assets/wa-background-dark.png";

import {
  getPrimaryColor,
  getPrimaryDark,
} from "./config";

const App = () => {
  const [locale, setLocale] = useState();

  // useEffect(() => {
  //   OneSignal.init({
  //     appId: "db6af30c-8eb4-45f0-af7e-33c5358ccfc9",
  //   });
  // }, []);

  const theme = createTheme(
    {
      scrollbarStyles: {
        '&::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '&::-webkit-scrollbar-thumb': {
          boxShadow: 'inset 0 0 6px rgba(0, 0, 0, 0.3)',
          backgroundColor: "#606060",
        },
      },
      padding: "2px",
      palette: {
        primary: { main: "#9200bf" },
        secondary: { main: "#737373" },
        third: { main: "#8709ae" },
        fourth: { main: "#fffedf" }
      },
      barraSuperior: {
        primary: { main: "#737373" },
        secondary: { main: "#ffffff" },
      },
      barraLateral: {
        primary: { main: "#8709ae" },
      },
      icons: {
        primary: { main: "#9200bf" }
      },
      textColorMenu: {
        primary: { main: "#ffffff" },
        secondary: { main: "#9200bf" }
      },
      contadorConversas: {
        primary: { main: "#f05d67" }
      },
      contadorAguardando: {
        primary: { main: "#f05d67" }
      },
    },
    locale
  );

  // const lightTheme = createTheme(
  //   {
  //     overrides: {
  //       MuiCssBaseline: {
  //         "@global": {
  //           body: {
  //             scrollbarColor: "#c1c1c1 #f1f1f1",
  //             "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
  //               backgroundColor: "#f1f1f1",
  //             },
  //             "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb":
  //             {
  //               borderRadius: 8,
  //               backgroundColor: "#c1c1c1",
  //               minHeight: 24,
  //               border: "3px solid #f1f1f1",
  //             },
  //             "&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus":
  //             {
  //               backgroundColor: "#959595",
  //             },
  //             "&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active":
  //             {
  //               backgroundColor: "#959595",
  //             },
  //             "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover":
  //             {
  //               backgroundColor: "#959595",
  //             },
  //             "&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner":
  //             {
  //               backgroundColor: "#f1f1f1",
  //             },
  //           },
  //         },
  //       },
  //     },
  //     palette: {
  //       primary: { main: getPrimaryColor(), contrastText: "#fff" },
  //       secondary: { main: "#757575" },
  //       headerBtn: { main: "#eeeeee" },
  //       headerBackground: { main: getPrimaryColor() },
  //     },
  //     backgroundImage: `url(${lightBackground})`,
  //   },
  //   locale
  // );

  // const darkTheme = createTheme(
  //   {
  //     overrides: {
  //       MuiCssBaseline: {
  //         "@global": {
  //           body: {
  //             backgroundColor: "#1c212e",
  //             scrollbarColor: "#6b6b6b #2b2b2b",
  //             "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
  //               backgroundColor: "#2b2b2b",
  //             },
  //             "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb":
  //             {
  //               borderRadius: 8,
  //               backgroundColor: "#6b6b6b",
  //               minHeight: 24,
  //               border: "3px solid #2b2b2b",
  //             },
  //             "&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus":
  //             {
  //               backgroundColor: "#959595",
  //             },
  //             "&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active":
  //             {
  //               backgroundColor: "#959595",
  //             },
  //             "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover":
  //             {
  //               backgroundColor: "#959595",
  //             },
  //             "&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner":
  //             {
  //               backgroundColor: "#2b2b2b",
  //             },
  //           },
  //         },
  //       },
  //     },
  //     palette: {
  //       type: "dark",
  //       primary: { main: getPrimaryDark() },
  //       secondary: { main: "#fff" },
  //       background: {
  //         default: "#2c3145",
  //         paper: "#2c3145",
  //       },
  //       text: {
  //         primary: "#eee",
  //         secondary: "#eee",
  //       },
  //       headerBackground: { main: "#2c3145" },
  //     },
  //     backgroundImage: `url(${darkBackground})`,
  //   },
  //   locale
  // );

  // const isBrowserDefaultDark = () =>
  //   window.matchMedia("(prefers-color-scheme: dark)").matches;

  // const getDefaultTheme = () => {
  //   const localStorageTheme = localStorage.getItem("theme");
  //   const browserDefault = isBrowserDefaultDark() ? "dark" : "light";
  //   return localStorageTheme || browserDefault;
  // };
  // const [theme, setTheme] = useState(getDefaultTheme());

  // const themeToggle = () => {
  //   const isCurrentDark = theme === "dark";
  //   setTheme(isCurrentDark ? "light" : "dark");
  //   localStorage.setItem("theme", isCurrentDark ? "light" : "dark");
  //   // theme === "light" ? setTheme("dark") : setTheme("light");
  // };

  useEffect(() => {
    const i18nlocale = localStorage.getItem("i18nextLng");
    const browserLocale =
      i18nlocale.substring(0, 2) + i18nlocale.substring(3, 5);

    if (browserLocale === "ptBR") {
      setLocale(ptBR);
    }
  }, []);

  return (
    // <ThemeProvider theme={theme === "light" ? lightTheme : darkTheme}>
    <ThemeProvider theme={theme}>
      <Routes
      // themeToggle={themeToggle}
      // themeDefault={theme}
      />
    </ThemeProvider>
  );
};

export default App;
