$("input").on("keyup", (e) => {
  let n = parseInt(e.target.id.replace(/\D/g,''))
  if ((e.keyCode === 13) && (n !== 2)) {
    if (n === 4) {
      verify()
    }
    else {
      nextScreen()
    }
  }
})

SCREEN = (-1)

if (localStorage.getItem(LOCAL_STORAGE_TAG + "screen")) {
  setScreen(parseInt(localStorage.getItem(LOCAL_STORAGE_TAG + "screen")))
}
else {
  setScreen(0)
}
