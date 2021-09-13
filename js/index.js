console.log("\u00A9 " + YEAR.toString() + " Paywake Corporation")

document.getElementById("phone").addEventListener("keypress", (evt) => {
  if (evt.which < 48 || evt.which > 57) {
    evt.preventDefault()
  }
})

const countdown = setInterval(() => {
  updateCountdown(document.getElementById("countdown"))
}, 1000);

sliderInit(document.getElementsByClassName("slider")[0])
updateCountdown(document.getElementById("countdown"))
