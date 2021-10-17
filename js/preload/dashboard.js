const logout = () => {
  ROUTINES.logout()
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
  if (RETURN_TOGGLE) {
    historic = TODAY_RETURN
  }
  const deposit = Math.round(obj.value)
  const returns = (Math.floor(deposit * ((historic / 100) + 1) * 100) / 100)
  document.getElementById("deposit-amount").innerHTML = deposit.toString()
  document.getElementById("return-amount").innerHTML = Math.floor(returns).toString()
  document.getElementById("return-amount-cents").innerHTML = ("." + Math.round((returns - Math.floor(returns)) * 100).toString().padStart(2, "0"))
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
  const deposit = Math.round(document.getElementsByClassName("slider")[0].value)
  const returns =  (Math.floor(deposit * ((ESTIMATED_RETURN / 100) + 1) * 100) / 100)
  const dollarString = (Math.floor(returns).toString() + ("." + Math.round((returns - Math.floor(returns)) * 100).toString().padStart(2, "0")))
  let add = "the last 30 days of Paywake user data."
  if (RETURN_TOGGLE === 1) {
    if (YESTERDAY_FLAG) {
      add = "yesterday's Paywake user data."
    }
    else {
      add = "today's Paywake user data."
    }
  }
  const text = ("This $" + dollarString + " average return is based on " + add)
  MODAL.hide()
  MODAL.displayHTML("<p>" + text + "</p>")
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

const cancelWakeup = (wakeup, node) => {
  const balance = parseInt(localStorage.getItem(LOCAL_STORAGE_TAG + "balance"))
  let elements = []
  let title = document.createElement("h3")
  title.innerHTML = "Confirm Cancellation"
  elements.push(title)
  elements.push(node)
  let text = document.createElement("p")
  let fee = Math.min(Math.max(Math.floor(wakeup.deposit * 0.015), 15), balance)
  let dollars = Math.floor(fee / 100)
  let cents = Math.floor(fee % 100)
  if (fee > 0) {
    text.innerHTML = ("Are you sure you want to cancel this wakeup? A cancellation fee of $" + dollars.toString() + "." + cents.toString().padStart(2, "0") + " will be deducted from your Paywake balance.")
  }
  else {
    text.innerHTML = "Are you sure you want to cancel this wakeup?"
  }
  elements.push(text)
  let group = document.createElement("div")
  group.className = "button-group"
  let goback = document.createElement("button")
  goback.innerHTML = "Go Back"
  goback.className = "transparent"
  let confirm = document.createElement("button")
  confirm.innerHTML = "Confirm"
  confirm.id = "__modal-dismiss"
  group.appendChild(goback)
  group.appendChild(confirm)
  elements.push(group)
  goback.onclick = () => {
    MODAL.hide()
  }
  confirm.onclick = () => {
    confirm.className = "loading"
    $.ajax({
      url: (API + "/cancel"),
      type: "PUT",
      data: {
        id: wakeup.id
      },
      xhrFields: {
        withCredentials: true
      },
      beforeSend: (xhr) => {
        xhr.setRequestHeader("Authorization", ID_TOKEN)
      },
      success: (data) => {
        setTimeout(() => {
          window.location.reload()
        }, 1)
      },
      error: (data) => {
        confirm.className = ""
        MODAL.hide()
        setTimeout(() => {
          MODAL.displayHTML("<p>Error - cancellation failed</p>")
        }, 1000)
      }
    })
  }
  MODAL.display(elements)
}

const scheduleClick = () => {
  window.location.href = document.getElementById("schedule-link").href
}

const verifiedClick = (node) => {
  const time = moment().hour(11).add(moment().get("hour") - moment.tz(moment.now(), "America/Los_Angeles").get("hour"), "hours").format("h a")
  let elements = []
  let center = document.createElement("div")
  center.className = "center"
  let img = document.createElement("img")
  img.src = "assets/images/verified.png"
  center.appendChild(img)
  let title = document.createElement("h3")
  title.className = "center"
  title.innerHTML = "Verification Successful"
  let text = document.createElement("p")
  text.innerHTML = ("You successfully verified this wakeup and will be paid at " + time + " today.")
  let b = node.querySelector("b")
  b.onclick = () => {}
  b.style.cursor = "default"
  elements.push(center)
  elements.push(title)
  elements.push(node)
  elements.push(text)
  MODAL.display(elements)
}

const setWakeups = (data = []) => {
  data = data.sort((a, b) => {
    return (a.day - b.day)
  })
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
    minuteSpan.innerHTML = minute.padStart(2, "0")
    let am = document.createElement("span")
    am.className = "am"
    am.innerHTML = "am"
    let p = document.createElement("p")
    let cancel = document.createElement("div")
    cancel.className = "cancel"
    let button = document.createElement("img")
    if (wakeup.verified) {
      p.innerHTML = (date + " &#8212; <b>Verified</b>")
      button.src = "assets/images/verified.png"
      button.className = "verified"
    }
    else {
      p.innerHTML = (date + " &#8212; " + fromNow)
      button.src = "assets/images/cancel.png"
    }

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
    const node = parent.cloneNode(true)
    cancel.appendChild(button)
    parent.appendChild(cancel)
    container.appendChild(parent)

    if (!wakeup.verified) {
      button.onclick = () => {
        cancelWakeup(JSON.parse(JSON.stringify(wakeup)), node)
      }
    }
    else {
      button.onclick = () => {
        verifiedClick(node)
      }
      p.querySelector("b").onclick = button.onclick
    }
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
