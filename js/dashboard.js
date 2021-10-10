sliderInit(document.getElementById("estimate-slider"))

if (IS_IOS) {
  $(".if-ios").removeClass("if-ios")
}

setBalance(localStorage.getItem("__paywake-balance") || 0)
