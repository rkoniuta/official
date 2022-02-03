initDays()

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

FEEDBACK.mount($(".content")[0])

setExistingWakeups(JSON.parse(localStorage.getItem(LOCAL_STORAGE_TAG + "wakeups")) || [])
setCard(JSON.parse(localStorage.getItem(LOCAL_STORAGE_TAG + "card")) || DEFAULT_CARD_ON_FILE)

PAYMENT_INFO.mount("#payment-information")
