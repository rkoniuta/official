parseSearch()
setFAQS()

$(window).on("load", () => {
  renderFAQS()
})

$(document).ajaxComplete(() => {
  setFAQS()
})
