$("input").on("keyup", (e) => {
  if (e.keyCode === 13) {
    nextScreen()
  }
})

SCREEN = (-1)
nextScreen()
