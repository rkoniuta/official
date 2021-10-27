fetchWakeups()
fetchChallenge()
setInstruction()
const INIT_VIDEO_INTERVAL = setInterval(() => {
  if (document.getElementById("__modal")) {
    initVideo()
    clearInterval(INIT_VIDEO_INTERVAL)
  }
}, 5)
