const logout = () => {
  ROUTINES.logout()
}

let MONTH_RETURN = 10
let TODAY_RETURN = 10
let RETURN_TOGGLE = 1
let YESTERDAY_FLAG = 0
const DEFAULT_EARNINGS_DATA = {
  today: 0.1,
  lastMonth: 0.1,
  earnings: []
}

const slider = (obj) => {
  let historic = MONTH_RETURN
  if (RETURN_TOGGLE) {
    historic = TODAY_RETURN
  }
  const deposit = Math.round(obj.value)
  const returns = (Math.floor(deposit * ((historic / 100) + 1) * 100) / 100)
  document.getElementById("deposit-amount").innerHTML = deposit.toString()
  document.getElementById("return-amount").innerHTML = Math.floor(returns).toString()
  document.getElementById("return-amount-cents").innerHTML = ("." + Math.round((returns - Math.floor(returns)) * 100).toString().padEnd(2, "0"))
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
  const deposit = Math.round(document.getElementsByClassName("slider")[0].value)
  const returns =  (Math.floor(deposit * ((ESTIMATED_RETURN / 100) + 1) * 100) / 100)
  const dollarString = (Math.floor(returns).toString() + ("." + Math.round((returns - Math.floor(returns)) * 100).toString().padEnd(2, "0")))
  const text = ("This $" + dollarString + " average return is based on the last 30 days of Paywake user data.")
  alert(text)
}

const set1DayReturns = () => {
  RETURN_TOGGLE = 1
  $("#1d-button").addClass("active")
  $("#30d-button").removeClass("active")
  if (YESTERDAY_FLAG) {
    document.getElementById("1d-30d-text").innerHTML = "Yesterday,"
  }
  else {
    document.getElementById("1d-30d-text").innerHTML = "Today,"
  }
  slider(document.getElementById("estimate-slider"))
}

const set30DayReturns = () => {
  RETURN_TOGGLE = 0
  $("#30d-button").addClass("active")
  $("#1d-button").removeClass("active")
  document.getElementById("1d-30d-text").innerHTML = "In the last 30 days,"
  slider(document.getElementById("estimate-slider"))
}

const setEarnings = (data = DEFAULT_EARNINGS_DATA) => {
  localStorage.setItem(LOCAL_STORAGE_TAG + "earnings", JSON.stringify(data))
  MONTH_RETURN = (data.lastMonth * 100)
  TODAY_RETURN = ((data.today || data.yesterday) * 100)
  if (!data.today) {
    YESTERDAY_FLAG = 1
  }
  else {
    YESTERDAY_FLAG = 0
  }
  if (RETURN_TOGGLE === 1) {
    set1DayReturns()
  }
  else {
    set30DayReturns()
  }
}

const setWakeups = (data = []) => {
  localStorage.setItem(LOCAL_STORAGE_TAG + "wakeups", JSON.stringify(data))
  let container = document.getElementById("wakeup-container")
  let noWakeups = document.getElementById("no-wakeups")
  document.getElementById("wakeup-count").innerHTML = ("(" + data.length.toString() + ")")
  $(".wakeup").remove()
  if (data.length > 0) {
    noWakeups.style.display = "none"
  }
  else {
    noWakeups.style.display = "block"
  }
  for (const wakeup of data) {
    const deposit = (wakeup.deposit / 100).toString()
    const hour = Math.floor(wakeup.time / 60).toString()
    const minute = (wakeup.time % 60).toString()
    const date = moment(EPOCH).tz(TIME_ZONE).add(wakeup.day, "days").format("MMMM Do")
    const fromNow = moment(EPOCH).tz(TIME_ZONE).add(wakeup.day, "days").hour(parseInt(hour)).minute(parseInt(minute)).fromNow()

    let parent = document.createElement("div")
    parent.className = "wakeup"
    let depositContainer = document.createElement("div")
    depositContainer.className = "deposit-container"
    let depositBox = document.createElement("div")
    depositBox.className = "deposit"
    let h1 = document.createElement("h1")
    let dollarSign = document.createElement("span")
    dollarSign.className = "dollar-sign"
    dollarSign.innerHTML = "$"
    let depositAmount = document.createElement("span")
    depositAmount.innerHTML = deposit
    let info = document.createElement("div")
    info.className = "info"
    let h3 = document.createElement("h3")
    let hourSpan = document.createElement("span")
    hourSpan.innerHTML = hour
    let colon = document.createElement("span")
    colon.className = "colon"
    colon.innerHTML = ":"
    let minuteSpan = document.createElement("span")
    minuteSpan.innerHTML = minute
    let am = document.createElement("span")
    am.className = "am"
    am.innerHTML = "am"
    let p = document.createElement("p")
    p.innerHTML = (date + " &#8212; " + fromNow)

    h1.appendChild(dollarSign)
    h1.appendChild(depositAmount)
    depositBox.appendChild(h1)
    depositContainer.appendChild(depositBox)
    parent.appendChild(depositContainer)
    h3.appendChild(hourSpan)
    h3.appendChild(colon)
    h3.appendChild(minuteSpan)
    h3.appendChild(am)
    info.appendChild(h3)
    info.appendChild(p)
    parent.appendChild(info)
    container.appendChild(parent)
  }
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

const fetchWakeups = () => {
  $.ajax({
    url: (API + "/wakeups"),
    type: "GET",
    xhrFields: {
      withCredentials: true
    },
    beforeSend: (xhr) => {
      xhr.setRequestHeader("Authorization", ID_TOKEN)
    },
    success: (data) => {
      setWakeups(data.wakeups)
    }
  })
}
