let STREAM = false

const VIDEO_CONSTRAINTS = {
  video: {
    width: {
      min: 0,
      ideal: 1080,
      max: 4000,
    },
    height: {
      min: 0,
      ideal: 1920,
      max: 4000
    },
    facingMode: "environment"
  }
}

const malformedCamera = () => {
  //TODO: Implement
  alert("malformed camera")
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
      //FIXME: remove
      alert(e.message)
      malformedCamera()
    }
    if (STREAM) {
      videoElement.srcObject = STREAM
      videoElement.play()
    }
  }
}
