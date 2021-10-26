let STREAM = false

const VIDEO_CONSTRAINTS = {
  audio: false,
  video: {
    facingMode: "environment"
  }
}

const malformedCamera = () => {
  //TODO: Implement
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
      setInterval(() => {
        videoElement.play()
      }, Math.floor(1000 / 29))
    }
  }
}
