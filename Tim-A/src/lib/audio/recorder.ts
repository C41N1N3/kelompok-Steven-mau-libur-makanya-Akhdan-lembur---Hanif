export async function createAudioRecorder() {
  if (
    !navigator.mediaDevices?.getUserMedia ||
    typeof MediaRecorder === "undefined"
  ) {
    throw new Error("Recording is not supported in this browser.");
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const chunks: BlobPart[] = [];
  const recorder = new MediaRecorder(stream);

  recorder.ondataavailable = (event) => {
    chunks.push(event.data);
  };

  return {
    recorder,
    stop: () =>
      new Promise<Blob>((resolve) => {
        recorder.onstop = () => {
          resolve(new Blob(chunks, { type: recorder.mimeType }));
        };
        recorder.stop();
        stream.getTracks().forEach((track) => track.stop());
      }),
  };
}
