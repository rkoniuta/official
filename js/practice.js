if (localStorage.getItem(LOCAL_STORAGE_TAG + "tutorial-mode").toString() === "true") {
  $("#back-button")[0].innerHTML = ("<button>Go Back</button>")
  $("#back-button")[0].href = ("./tutorial")
}

setInstruction()
const INIT_VIDEO_INTERVAL = setInterval(() => {
  if (document.getElementById("__modal")) {
    initVideo()
    clearInterval(INIT_VIDEO_INTERVAL)
  }
}, 5)
genPracticeMode()
