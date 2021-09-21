$("input").on("keyup", (e) => {
  let n = parseInt(e.target.id.replace(/\D/g,''))
  if ((e.keyCode === 13) && (n !== 2)) {
    nextScreen()
  }
})

SCREEN = (-1)
nextScreen()
