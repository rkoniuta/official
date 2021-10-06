$("#password").on("keyup", (e) => {
  if (e.keyCode === 13) {
    login(document.getElementById("login-button"))
  }
})
