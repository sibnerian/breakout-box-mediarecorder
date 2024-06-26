function createMirroringStreamTransformer(delayMs) {
  let offscreenCanvas;
  return new TransformStream({
    transform: async (videoFrame, controller) => {
      const bitmap = await createImageBitmap(videoFrame);
      const timestamp = videoFrame.timestamp;
      videoFrame.close();
      if (
        !offscreenCanvas ||
        offscreenCanvas.width !== bitmap.width ||
        offscreenCanvas.height !== bitmap.height
      ) {
        offscreenCanvas = new OffscreenCanvas(
          bitmap.width,
          bitmap.height,
        );
      }
      const ctx = offscreenCanvas.getContext('2d');
      // This incantation flips the canvas around its center axis.
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(bitmap, bitmap.width * -1, 0);
      ctx.restore();

      const newFrame = new VideoFrame(offscreenCanvas, {
        timestamp,
      });

      setTimeout(() => {
        controller.enqueue(newFrame);
      }, delayMs);
    },
  });
}

function getMirroredTransformReadable(inputVideoReadableStream, delayMs) {
  return inputVideoReadableStream.pipeThrough(createMirroringStreamTransformer(delayMs));
}

let webmWriter = null;
let frameReader = null;

async function startRecording(frameStream, delayMs) {
  let frameCounter = 0;

  const mirroredReadable = getMirroredTransformReadable(frameStream, delayMs);

  self.postMessage({
    type: 'ack',
    mirroredReadable,
  }, [mirroredReadable]);
}

async function stopRecording() {
  self.postMessage({
    type: 'done',
  });
}

self.addEventListener('message', function(e) {
  switch (e.data.type) {
    case 'start':
      startRecording(e.data.frameStream, e.data.delayMs);
      break;
    case 'stop':
      stopRecording();
      break;
  }
});
