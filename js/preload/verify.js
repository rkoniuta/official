let STREAM = false

const VIDEO_CONSTRAINTS = {
  video: {
    width: {
      min: 720,
      ideal: 1080,
      max: 2560,
    },
    height: {
      min: 720,
      ideal: 1920,
      max: 2560
    },
    facingMode: "environment"
  }
}

const malformedCamera = () => {
  //TODO: Implement
  alert("Malformed Camera.")
}

const initVideo = async () => {
  const videoElement = document.getElementById("stream")
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
    }
  }
}
