toggleDay(document.getElementById("day-select-0"))
toggleDay(document.getElementById("day-select-1"))

if (parseInt((new URLSearchParams(window.location.href)).get("deposit"))) {
  document.getElementById("deposit-slider").value = Math.min(Math.max(parseInt((new URLSearchParams(window.location.href)).get("deposit")), 5), 99)
  slider(document.getElementById("deposit-slider"))
}
else if (localStorage.getItem(LOCAL_STORAGE_TAG + "deposit") !== null) {
  document.getElementById("deposit-slider").value = (parseInt(localStorage.getItem(LOCAL_STORAGE_TAG + "deposit")) || 50)
  slider(document.getElementById("deposit-slider"))
}
else {
  sliderInit(document.getElementById("deposit-slider"))
}

/* STRIPE TESTING */
card.mount('#card-element')
