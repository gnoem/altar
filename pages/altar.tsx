import React from "react";
import { Homepage } from "@layouts";
import { Scene } from "@components";

const Altar: React.FC = (): JSX.Element => {
  return (
    <Homepage>
      <Scene objects={['oracle', 'pedestal', 'moon'/* , 'bowl' */]} />
    </Homepage>
  )
}

export default Altar;