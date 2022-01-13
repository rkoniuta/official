localStorage.setItem(LOCAL_STORAGE_TAG + "tutorial-mode", "true")

$("input").on("keyup", (e) => {
  let n = parseInt(e.target.id.replace(/\D/g,''))
  if (e.keyCode === 13) {
    nextScreen()
  }
})

SCREEN = (-1)

if (localStorage.getItem(LOCAL_STORAGE_TAG + "screen")) {
  setScreen(parseInt(localStorage.getItem(LOCAL_STORAGE_TAG + "screen")))
}
else {
  setScreen(0)
}

if (localStorage.getItem(LOCAL_STORAGE_TAG + "deposit") === null) {
  sliderInit(document.getElementById("estimate-slider"))
}
else {
  document.getElementById("estimate-slider").value = (parseInt(localStorage.getItem(LOCAL_STORAGE_TAG + "deposit")) || 50)
  slider(document.getElementById("estimate-slider"))
}

setEarnings(JSON.parse(localStorage.getItem(LOCAL_STORAGE_TAG + "earnings")) || DEFAULT_EARNINGS_DATA)
fetchEarnings()
