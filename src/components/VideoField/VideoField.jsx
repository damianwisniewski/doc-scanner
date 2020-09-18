import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@material-ui/core';

import './VideoField.css';

export default function VideoField({ onVideoStarted, recognizer }) {
  const [isScanStarted, setScanStarted] = useState(false);
  const video = useRef(null);
  const canvas = useRef(null);

  const stopScan = async () => {
    await recognizer?.clears?.releaseCamera?.();
    setScanStarted(false)
  }

  useEffect(() => {
    if (isScanStarted) {
      onVideoStarted && onVideoStarted({ element: video.current, feedbackElem: canvas.current });
    }
  }, [ isScanStarted ]);

  return !isScanStarted
    ? <Button onClick={() => setScanStarted(true)} variant="contained">Start scan</Button>
    : (
      <>
        <div className="camera-wrapper">
          <video ref={video} className="camera-feed" playsInline autoPlay></video>
          <canvas ref={canvas} className="camera-feedback"></canvas>
        </div>
        <Button onClick={stopScan} variant="contained">Reset</Button>
      </>
    )
}