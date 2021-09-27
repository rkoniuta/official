const YEAR = (new Date()).getFullYear()

const ESTIMATED_RETURN = 10
const SLIDER_INIT_MIN = 30
const SLIDER_INIT_MAX = 80

const REDIRECTS = {
  home: "./",
  onAuth: "./dashboard",
  noAuth: "./login"
}

if (JSON.parse(localStorage.getItem("__paywake-dev"))) {
  const add = ("?" + (new URL(window.location.href)).searchParams.toString())
  for (let key in REDIRECTS) {
    REDIRECTS[key] = (REDIRECTS[key] + add)
  }
}

const cleanPhone = (string) => {
  return string.toString().trim().toLowerCase().replace(/[^0-9]+/g, "")
}

const cleanName = (string) => {
  return string.toString().trim().replace(/[^a-zA-Z\.\- ]+/g, "")
}
