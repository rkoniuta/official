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
  const videoElement = document.getElementById("stream")
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
      videoElement.controls = false
      setInterval(() => {
        videoElement.play()
      }, Math.floor(1000 / 29))
    }
  }
}
