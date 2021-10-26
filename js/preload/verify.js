const FRAME_RATE = 14 //1/2 ~30FPS
const CAPTURE_DIMENSION = 300
const DARKNESS_THRESHOLD = 56 //out of 255

let STREAM = false
let TOO_DARK = true
const VIDEO_CONSTRAINTS = {
  audio: false,
  video: {
    facingMode: "environment"
  }
}

const malformedCamera = () => {
  MODAL.hide()
  MODAL.displayHTML("<p>We weren't able to access your device's camera. Please reattempt verification on a <b>different device</b>.")
}

const initVideo = async () => {
  const videoElement = document.getElementById("stream")
  let interval = null
  if (!("mediaDevices" in navigator && "getUserMedia" in navigator.mediaDevices)) {
    malformedCamera()
  }
  else {
    MODAL.displayHTML("<p>To verify you're awake, please <b>allow access to your camera</b>.</p>")
    try {
      STREAM = await navigator.mediaDevices.getUserMedia(VIDEO_CONSTRAINTS)
    }
    catch (e) {
      malformedCamera()
    }
    if (STREAM) {
      MODAL.hide()
      videoElement.srcObject = STREAM
      videoElement.play()
      videoElement.controls = false
      setTimeout(() => {
        setInterval(() => {
          videoElement.play()
          checkForDarkness()
        }, Math.floor(1000 / FRAME_RATE))
      }, 1000)
    }
  }
}

const checkForDarkness = () => {
  const videoElement = document.getElementById("stream")
  const canvas = document.createElement("canvas")
  canvas.width = CAPTURE_DIMENSION
  canvas.height = CAPTURE_DIMENSION
  canvas.getContext("2d").drawImage(videoElement, ((CAPTURE_DIMENSION - videoElement.videoWidth) / 2), ((CAPTURE_DIMENSION - videoElement.videoHeight) / 2))
  let imageData = canvas.getContext("2d").getImageData(0, 0, CAPTURE_DIMENSION, CAPTURE_DIMENSION).data
  let sum = 0
  for (let i = 0; i < imageData.length; i += 4) {
    sum += (imageData[i] + imageData[i + 1] + imageData[i + 2])
  }
  let average = sum / (imageData.length * (3 / 4))
  if (average > DARKNESS_THRESHOLD) {
    TOO_DARK = false
    $("#photo-too-dark").removeClass("visible")
  }
  else {
    TOO_DARK = true
    $("#photo-too-dark").addClass("visible")
  }
}

const getBase64Capture = () => {
  const videoElement = document.getElementById("stream")
  const canvas = document.createElement("canvas")
  canvas.width = CAPTURE_DIMENSION
  canvas.height = CAPTURE_DIMENSION
  canvas.getContext("2d").drawImage(videoElement, ((CAPTURE_DIMENSION - videoElement.videoWidth) / 2), ((CAPTURE_DIMENSION - videoElement.videoHeight) / 2))
  return canvas.toDataURL().replace("data:image/png;base64,","").trim()
}

const capture = () => {
  //TODO: Implement
  //FIXME: remove
  MODAL.displayHTML("<p>Size: " + getBase64Capture().length + ".</p>")
}
