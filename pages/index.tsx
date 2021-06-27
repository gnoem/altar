import React from "react";
import { useRouter } from "next/router";

import { Homepage } from "@layouts";
import { Home as styles } from "@styles";

const Home: React.FC = (): JSX.Element => {
  const router = useRouter();
  return (
    <Homepage>
      <div className={styles.enter} onClick={() => router.push('/altar')}>
        <h1>ASTRAEUS</h1>
        <h2>INTERACTIVE VIRTUAL ALTAR</h2>
      </div>
    </Homepage>
  )
}

export default Home;