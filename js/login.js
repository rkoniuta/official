$("#password").on("keyup", (e) => {
  if (e.keyCode === 13) {
    login(document.getElementById("login-button"))
  }
})

if (SOURCE === "dev") {
  $("#devkey")[0].value = (localStorage.getItem("__paywake-dev-key") || "")
  $("#devkey")[0].style.display = "block"
}
