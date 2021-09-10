console.log("\u00A9 " + YEAR.toString() + " Paywake Corporation")
if ((new URLSearchParams(window.location.search)).get("source")) {
  window.location.replace(QR_REDIRECT)
}
else {
  window.location.replace(REDIRECT)
}
