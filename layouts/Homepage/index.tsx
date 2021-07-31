import React, { useEffect } from "react";
import Head from "next/head";
import styles from "./Homepage.module.css";

const Homepage: React.FC = ({ children }): JSX.Element => {
  useEffect(() => {
    const disablePinchZoom = (event: TouchEvent): void => {
      event.preventDefault();
    }
    window.addEventListener('touchstart', disablePinchZoom, { passive: false });
    return () => window.removeEventListener('touchstart', disablePinchZoom);
  }, []);
  return (
    <div className={styles.container}>
      <Header />
      {children}
    </div>
  )
}

const Header = (): JSX.Element => {
  return (
    <Head>
      <title>GNAGUA W16V</title>
      <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='100'>🐊</text></svg>" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    </Head>
  )
}

export default Homepage;