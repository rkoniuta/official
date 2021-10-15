if (localStorage.getItem(LOCAL_STORAGE_TAG + "deposit") === null) {
  sliderInit(document.getElementById("estimate-slider"))
}
else {
  document.getElementById("estimate-slider").value = (parseInt(localStorage.getItem(LOCAL_STORAGE_TAG + "deposit")) || 50)
  slider(document.getElementById("estimate-slider"))
}

if (IS_IOS) {
  $(".if-ios").removeClass("if-ios")
}

setEarnings(JSON.parse(localStorage.getItem(LOCAL_STORAGE_TAG + "earnings")) || DEFAULT_EARNINGS_DATA)
setWakeups(JSON.parse(localStorage.getItem(LOCAL_STORAGE_TAG + "wakeups")) || [])
fetchEarnings()
fetchWakeups()
