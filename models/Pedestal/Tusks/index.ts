import { useEffect } from "react";
import { IMeshComponentProps } from "@types";
import { createMaterialFromTextures } from "@utils";
import { defineTusksMaterial } from "./materials";

const Tusks: React.FC<IMeshComponentProps> = ({ mesh, name }): null => {

  useEffect(() => {
    if (!mesh) return;
    mesh.name = name;
    mesh.material = createMaterialFromTextures(defineTusksMaterial());
    console.log(mesh.userData.interactParent);
    debugger;
    mesh.userData.hoverCursor = 'pointer';
    mesh.userData.events = {
      click: mesh.userData.interactParent
    }
  }, [mesh]);

  return null;
}

export default Tusks;