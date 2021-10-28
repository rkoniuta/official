$("input").on("keyup", (e) => {
  let n = parseInt(e.target.id.replace(/\D/g,''))
  if (e.keyCode === 13) {
    $(".screen:not(.unloaded)")[0].querySelector("button").click()
  }
})

SCREEN = (-1)

if (localStorage.getItem(LOCAL_STORAGE_TAG + "forgot-screen")) {
  setScreen(parseInt(localStorage.getItem(LOCAL_STORAGE_TAG + "forgot-screen")))
}
else {
  setScreen(0)
}
