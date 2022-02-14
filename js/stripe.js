let STRIPE = null;

(() => {
  const LIVE_KEY = "pk_live_51JUdOkLpUT5ZEdXBwemtdnAbiHF7oMdQTeLQlWaR9joaYYU9bhGOvfYJhPwc20TA27X2siOEhwTzWGbkYTA6B0Yh00jPLRltI7"
  const __SOURCE = (new URLSearchParams(window.location.search)).get("source")
  if (__SOURCE === "dev") {
    STRIPE = Stripe((localStorage.getItem("__paywake-dev-key") || LIVE_KEY))
  }
  else {
    STRIPE = Stripe(LIVE_KEY)
  }
})()
