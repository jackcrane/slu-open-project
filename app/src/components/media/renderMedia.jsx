import React from "react";
import styles from "./renderMedia.module.css";
import { StlViewer } from "react-stl-viewer";
import classNames from "classnames";

export const RenderMedia = ({ mediaUrl, fileType, big = false }) => {
  if (fileType === "png") {
    return (
      <img
        src={mediaUrl}
        className={classNames(styles.image, big ? styles.big : "")}
        alt="media"
      />
    );
  }

  if (fileType === "stl") {
    return (
      <StlViewer
        className={classNames(styles.image, big ? styles.big : "")}
        orbitControls
        shadows
        url={mediaUrl}
        modelProps={{
          color: "rgb(83, 195, 238)",
        }}
        cameraProps={{
          initialPosition: {
            distance: 1,
          },
        }}
      />
    );
  }

  return (
    <div className={classNames(styles.unsupported, big ? styles.big : "")}>
      {fileType}
      <i>Rendering is not supported for this file type</i>
    </div>
  );
};