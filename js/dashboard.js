sliderInit(document.getElementById("estimate-slider"))

if (IS_IOS) {
  $(".if-ios").removeClass("if-ios")
}

setEarnings(JSON.parse(localStorage.getItem(LOCAL_STORAGE_TAG + "earnings")) || DEFAULT_EARNINGS_DATA)
fetchEarnings()
