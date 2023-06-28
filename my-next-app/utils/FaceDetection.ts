import * as faceapi from 'face-api.js';

export async function loadFaceDetectionModels() {
  const MODEL_URL = '/models';
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
  ]);
}

export async function detectFace(videoElement: HTMLVideoElement): Promise<faceapi.FaceDetection | undefined> {
  await faceapi.nets.tinyFaceDetector.load('/models');
  const faceDetectorOptions = new faceapi.TinyFaceDetectorOptions({
    inputSize: 416,
    scoreThreshold: 0.5,
  });

  const detections = await faceapi.detectSingleFace(videoElement, faceDetectorOptions);
  return detections;
}
