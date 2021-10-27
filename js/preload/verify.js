const FRAME_RATE = 14 //1/2 ~30FPS
const CAPTURE_DIMENSION = 300
const DARKNESS_THRESHOLD = 56 //out of 255
const BACKUP_CHALLENGE = "a shower head"
const MAX_CHALLENGE_SWITCHES = 3 //max refreshes

let CHALLENGE = ""
let CHALLENGES = []
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
  setInstruction()
  setInterval(() => {
    if (!MODAL.visible) {
      window.location.reload()
    }
  }, (1000 / FRAME_RATE))
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
          checkForDarkness()
        }, Math.floor(1000 / FRAME_RATE))
      }, 1000)
    }
  }
}

const setInstruction = (item = "") => {
  const element = document.getElementById("instructions")
  if (item.length) {
    element.innerHTML = ("Take a photo of " + item.split(" ")[0]  + " <b>" + item.substring(item.split(" ")[0].length).trim() + "</b>")
  }
  else {
    element.innerHTML = ""
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
  if (STREAM && !TOO_DARK) {
    const photo = getBase64Capture()
    const videoElement = document.getElementById("stream").pause()
    $("#capture-button").addClass("loading")
    $.ajax({
      url: (API + "/photo"),
      type: "PUT",
      xhrFields: {
        withCredentials: true
      },
      beforeSend: (xhr) => {
        xhr.setRequestHeader("Authorization", ID_TOKEN)
      },
      data: {
        image: photo,
        challenge: CHALLENGE
      },
      success: (data) => {
        let devAdd = ""
        if (JSON.parse(localStorage.getItem("__paywake-dev"))) {
          devAdd = "?source=dev"
          if (JSON.parse((new URLSearchParams(window.location.href)).get("hidebanner"))) {
            devAdd = "?source=dev&hidebanner=true"
          }
        }
        window.location.href = ("./verified" + devAdd)
      },
      error: (data) => {
        const videoElement = document.getElementById("stream").play()
        $("#capture-button").removeClass("loading")
        MODAL.displayHTML("<p>We weren't able to find " + CHALLENGE.split(" ")[0]  + " <b>" + CHALLENGE.substring(CHALLENGE.split(" ")[0].length).trim() + "</b> in your photo. Please try again.</p>")
      }
    })
  }
}

let CHALLENGE_SWITCHES = MAX_CHALLENGE_SWITCHES
const switchChallenge = () => {
  if (CHALLENGE_SWITCHES > 0) {
    CHALLENGE = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)]
    setInstruction(CHALLENGE)
    CHALLENGE_SWITCHES--;
  }
  else {
    return false;
  }
}

const fetchChallenge = () => {
  $.ajax({
    url: (API + "/challenges"),
    type: "PUT",
    xhrFields: {
      withCredentials: true
    },
    beforeSend: (xhr) => {
      xhr.setRequestHeader("Authorization", ID_TOKEN)
    },
    success: (data) => {
      CHALLENGES = data.challenges
      CHALLENGE = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)]
      setInstruction(CHALLENGE)
    },
    error: (data) => {
      CHALLENGE = BACKUP_CHALLENGE
      setInstruction(CHALLENGE)
    }
  })
}
