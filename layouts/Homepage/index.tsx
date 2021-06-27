import React from "react";
import styles from "./Homepage.module.css";
import { Backdrop } from "@components";

const Homepage: React.FC = ({ children }): JSX.Element => {
  return (
    <div className={styles.container}>
      <Backdrop />
      {children}
    </div>
  )
}

export default Homepage;