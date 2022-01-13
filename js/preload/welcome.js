const SCREENS = 5
let SCREEN = 0

const setScreen = (n) => {
  SCREEN = n
  for (let i = 0; i < SCREEN; i++) {
    $("#screen-" + i.toString()).addClass("unloaded top")
  }
  $("#screen-" + SCREEN.toString()).removeClass("unloaded top bottom")
  for (let i = SCREEN + 1; i < SCREENS; i++) {
    $("#screen-" + i.toString()).addClass("unloaded bottom")
  }
  localStorage.setItem(LOCAL_STORAGE_TAG + "tutorial-screen", SCREEN.toString())
  if (SCREEN === 0) {
    $("#skip")[0].innerHTML = ("Skip")
  }
  else {
    $("#skip")[0].innerHTML = ("Go Back")
  }
  if (SCREEN === 4) {
    $("#continue")[0].innerHTML = ("Finish Tutorial")
    $("#continue").addClass("gradient")
  }
  else {
    $("#continue")[0].innerHTML = ("Continue")
    $("#continue").removeClass("gradient")
  }
  setTimeout(() => {
    try {
      $("#screen-" + SCREEN.toString() + "-input")[0].focus()
    } catch (e) {}
  })
}

const exitTutorial = () => {
  leavePage("schedule")
  localStorage.setItem(LOCAL_STORAGE_TAG + "tutorial-mode", "false")
}

const nextScreen = () => {
  if (SCREEN === (SCREENS - 1)) {
    exitTutorial()
  }
  if (SCREEN < (SCREENS - 1)) {
    setScreen(SCREEN + 1)
  }
}

const previousScreen = () => {
  if (SCREEN > 0) {
    setScreen(SCREEN - 1)
  }
}

const skipClick = () => {
  if (SCREEN === 0) {
    exitTutorial()
  }
  else {
    previousScreen()
  }
}

let MONTH_RETURN = 10
let TODAY_RETURN = 10
let RETURN_TOGGLE = 0
let YESTERDAY_FLAG = 0
const DEFAULT_EARNINGS_DATA = {
  today: 0.1,
  lastMonth: 0.1,
  earnings: []
}

const slider = (obj) => {
  let historic = MONTH_RETURN
  const deposit = Math.round(obj.value)
  const returns = (Math.floor(deposit * ((historic / 100) + 1) * 100) / 100)
  document.getElementById("deposit-amount").innerHTML = deposit.toString()
  document.getElementById("return-amount").innerHTML = (Math.floor(returns) || 0).toString()
  document.getElementById("return-amount-cents").innerHTML = ("." + (Math.round((returns - Math.floor(returns)) * 100) || 0).toString().padStart(2, "0"))
  localStorage.setItem(LOCAL_STORAGE_TAG + "deposit", deposit.toString())
}

const sliderInit = (obj) => {
  const steps = 60
  const finalPosition = (Math.floor(Math.random() * (SLIDER_INIT_MAX - SLIDER_INIT_MIN)) + SLIDER_INIT_MIN)
  const duration = ((SLIDER_DURATION_MS / SLIDER_INIT_MAX) * finalPosition)
  let counter = 0
  obj.value = 5
  slider(obj)
  const interval = setInterval(() => {
    if (counter < steps) {
      obj.value = (5 + ((finalPosition - 5) * Math.pow((counter / steps), (1 / 3))))
      slider(obj)
      counter++
    }
    else {
      obj.value = finalPosition
      slider(obj)
      clearInterval(interval)
    }
  }, (duration / steps))
}

const estimateAlert = () => {
  let historic = MONTH_RETURN
  const deposit = Math.round(document.getElementsByClassName("slider")[0].value)
  const returns =  (Math.floor(deposit * ((historic / 100) + 1) * 100) / 100)
  const dollarString = (Math.floor(returns).toString() + ("." + Math.round((returns - Math.floor(returns)) * 100).toString().padStart(2, "0")))
  const text = ("This $" + dollarString + " average return is based on the last 30 days of Paywake user data and includes both the extra payment and refunded deposit amounts.")
  MODAL.hide()
  MODAL.displayHTML("<p>" + text + "</p>")
}

const setEarnings = (data = DEFAULT_EARNINGS_DATA) => {
  localStorage.setItem(LOCAL_STORAGE_TAG + "earnings", JSON.stringify(data))
  MONTH_RETURN = (data.lastMonth * 100)
}

const fetchEarnings = () => {
  $.ajax({
    url: (API + "/earnings"),
    type: "GET",
    success: (data) => {
      setEarnings(data)
    }
  })
}
