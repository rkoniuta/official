let STREAM = false

const VIDEO_CONSTRAINTS = {
  audio: false,
  video: {
    facingMode: "environment"
  }
}

const malformedCamera = () => {
  //TODO: Implement
  alert("Malformed Camera.")
}

const initVideo = async () => {
  const FRAME_RATE = 29
  const videoElement = document.getElementById("video")
  const streamElement = document.getElementById("stream")
  let interval = null
  if (!("mediaDevices" in navigator && "getUserMedia" in navigator.mediaDevices)) {
    malformedCamera()
  }
  else {
    try {
      STREAM = await navigator.mediaDevices.getUserMedia(VIDEO_CONSTRAINTS)
    }
    catch (e) {
      malformedCamera()
    }
    if (STREAM) {
      videoElement.srcObject = STREAM
      videoElement.play()
      interval = setInterval(() => {
        videoElement.play()
        const canvas = document.createElement("canvas")
        canvas.width = videoElement.videoWidth
        canvas.height = videoElement.videoHeight
        canvas.getContext("2d").drawImage(videoElement, 0, 0)
        streamElement.src = canvas.toDataURL("image/webp")
      }, Math.floor(1000 / FRAME_RATE))
    }
  }
}
