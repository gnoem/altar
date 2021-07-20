import React from "react";
import { Homepage } from "@layouts";
import { Scene } from "@components";

const Altar: React.FC = (): JSX.Element => {
  return (
    <Homepage>
      <Scene objects={['oracle', 'tusks', 'moon']} />
    </Homepage>
  )
}

export default Altar;