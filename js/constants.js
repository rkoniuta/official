const YEAR = (new Date()).getFullYear()
const SOURCE = (new URLSearchParams(window.location.search)).get("source")

const REDIRECT = "https://launch.paywake.net"
const QR_REDIRECT = "https://launch.paywake.net/?source=qr"
const ESTIMATED_RETURN = 10
const SLIDER_INIT_MIN = 30
const SLIDER_INIT_MAX = 80
const LAUNCH_DATE = new Date("Oct 27, 2021 5:00:00").getTime()
const COUNTDOWN_PAD = 1
