import { NextPage } from 'next';
import { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { detectFace, loadFaceDetectionModels } from '../utils/FaceDetection';
import * as faceapi from 'face-api.js';
import styles from './login.module.css';

const LoginPage: NextPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
  const webcamRef = useRef<Webcam>(null);
  const [faceLocation, setFaceLocation] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [capturedImage, setCapturedImage] = useState('');

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleLogin = () => {
    // Perform login logic here
  };

  const checkFaceDetection = async () => {
    const videoElement = webcamRef.current?.video as HTMLVideoElement;

    if (videoElement?.videoWidth && videoElement?.videoHeight) {
      const faceDetection = await detectFace(videoElement);
      setIsFaceDetected(!!faceDetection);
      setVideoDimensions({ width: videoElement.videoWidth, height: videoElement.videoHeight });

      const canvas = faceapi.createCanvasFromMedia(videoElement);
      const displaySize = { width: videoElement.videoWidth, height: videoElement.videoHeight };
      faceapi.matchDimensions(canvas, displaySize);

      if (faceDetection) {
        const resizedDetections = faceapi.resizeResults(faceDetection, displaySize);
        const detectionBox = faceDetection.box;
        const detectionScore = faceDetection.score;
        const { x, y, width, height } = detectionBox;
        setFaceLocation({ x, y, width, height });
        faceapi.draw.drawDetections(canvas, resizedDetections); // Draw face detection without custom options
      }

      const canvasContainer = document.getElementById('canvas-container');
      if (canvasContainer) {
        canvasContainer.innerHTML = '';
        canvasContainer.appendChild(canvas);
      }
    }
  };

  const captureImage = () => {
    const videoElement = webcamRef.current?.video as HTMLVideoElement;
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const context = canvas.getContext('2d');
    context?.drawImage(videoElement, 0, 0, videoElement.videoWidth, videoElement.videoHeight);

    if (isFaceDetected) {
      const { x, y, width, height } = faceLocation;
      const faceCanvas = document.createElement('canvas');
      faceCanvas.width = width;
      faceCanvas.height = height;
      const faceContext = faceCanvas.getContext('2d');
      faceContext?.drawImage(canvas, x, y, width, height, 0, 0, width, height);
      setCapturedImage(faceCanvas.toDataURL());
    } else {
      setCapturedImage(canvas.toDataURL());
    }
  };

  useEffect(() => {
    loadFaceDetectionModels();
  }, []);

  useEffect(() => {
    if (webcamRef.current) {
      const interval = setInterval(checkFaceDetection, 100);
      return () => clearInterval(interval);
    }
  }, [webcamRef]);

  return (
    <div className={styles.container}>
      <h1>Login</h1>
      <div className={styles.formGroup}>
        <label className={styles.label}>Username:</label>
        <input type="text" value={username} onChange={handleUsernameChange} className={styles.input} />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Password:</label>
        <input type="password" value={password} onChange={handlePasswordChange} className={styles.input} />
      </div>
      <div className={styles.webcamContainer}>
        <Webcam audio={false} ref={webcamRef} />
        <div id="canvas-container" className={styles.overlayRectangle} />
      </div>
      <button onClick={handleLogin} className={styles.button}>
        Login
      </button>
      <button className={styles.captureButton} onClick={captureImage}>
        Capture
      </button>
      {capturedImage && (
        <div className={styles.capturedImageContainer}>
          <img className={styles.capturedImage} src={capturedImage} alt="Captured" />
        </div>
      )}
      <div className={styles.faceInfo}>
        {isFaceDetected ? (
          <>
            <p>Face Location:</p>
            <p>x: {faceLocation.x}</p>
            <p>y: {faceLocation.y}</p>
            <p>width: {faceLocation.width}</p>
            <p>height: {faceLocation.height}</p>
          </>
        ) : (
          <p>No face detected</p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
