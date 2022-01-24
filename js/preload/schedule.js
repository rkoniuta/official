let SELECTED_DAYS = [false, false, false, false, false, false]
let EXISTING_WAKEUPS = SELECTED_DAYS
let WAKEUPS_FETCHED = false
const WAKEUPS = []
let NUM_SELECTED_DAYS = 0
const LOCAL_TIME_ZONE = moment.tz.guess()

const DEFAULT_WAKEUP_TIME = 480
const MIN_WAKEUP_TIME = 300
const MAX_WAKEUP_TIME = 600

const displayTimeNotice = () => {
  const p = document.createElement("p")
  p.innerHTML = "You can only use Paywake to wake up between <b>5 am</b> and <b>10 am</b>."
  MODAL.display([p])
}

const setWakeupHour = (wakeup, obj) => {
  const hour = Math.floor(wakeup.time / 60)
  const minute = (wakeup.time % 60)
  const updatedHour = Math.min(Math.max(obj.value, 5), 10)
  wakeup.time = Math.min(Math.max((updatedHour * 60) + minute, MIN_WAKEUP_TIME), MAX_WAKEUP_TIME)
  if (obj.value < Math.floor(MIN_WAKEUP_TIME / 60) || obj.value > Math.floor(MAX_WAKEUP_TIME / 60)) {
    displayTimeNotice()
  }
  genWakeups()
}

const setWakeupMinute = (wakeup, obj) => {
  const hour = Math.floor(wakeup.time / 60)
  const minute = (wakeup.time % 60)
  const updatedMinute = Math.min(Math.max(obj.value, 0), 59)
  wakeup.time = Math.min(Math.max((hour * 60) + updatedMinute, MIN_WAKEUP_TIME), MAX_WAKEUP_TIME)
  if (hour === Math.floor(MAX_WAKEUP_TIME / 60) && obj.value > 0) {
    displayTimeNotice()
  }
  genWakeups()
}

const addWakeup = (index) => {
  const TODAY = moment().subtract(2, "hours").tz(TIME_ZONE).diff(moment.tz(EPOCH, TIME_ZONE).hour(0).minute(0).second(0), "days")
  const m = moment().add(index + 1, "days").subtract(2, "hours")
  const ofWeek = m.format("ddd").toLowerCase().trim()
  const day = (TODAY + index + 1)
  const deposit = (parseInt(document.getElementById("deposit-slider").value) * 100)
  const wakeup = {
    day, deposit, index,
    time: (parseInt(localStorage.getItem(LOCAL_STORAGE_TAG + "wakeup-" + ofWeek)) || DEFAULT_WAKEUP_TIME)
  }
  WAKEUPS.push(wakeup)
  genWakeups()
}

const removeWakeup = (index) => {
  for (let i = 0; i < WAKEUPS.length; i++) {
    if (WAKEUPS[i].index === index) {
      WAKEUPS.splice(i, 1)
    }
  }
  genWakeups()
}

const toggleDay = (obj) => {
  const index = parseInt(obj.id.split("-")[2])
  if (EXISTING_WAKEUPS[index]) {
    if (WAKEUPS_FETCHED) {
      const TODAY = moment().tz(TIME_ZONE).diff(moment.tz(EPOCH, TIME_ZONE).hour(0).minute(0).second(0), "days")
      const formattedDay = moment.tz(EPOCH, TIME_ZONE).add(TODAY + 1 + index, "days").format("MMMM Do")
      MODAL.displayHTML("<p>You already have a wakeup scheduled on " + formattedDay + ".</p>")
    }
    return;
  }
  SELECTED_DAYS[index] = (!SELECTED_DAYS[index])
  if (SELECTED_DAYS[index]) {
    $(obj).addClass("selected")
    addWakeup(index)
  }
  else {
    $(obj).removeClass("selected")
    removeWakeup(index)
  }
  let c = 0
  for (let i = 0; i < SELECTED_DAYS.length; i++) {
    if (SELECTED_DAYS[i] && !EXISTING_WAKEUPS[i]) {
      c++
    }
  }
  document.getElementById("mornings-amt").innerHTML = ("(" + c.toString() + ")")
  NUM_SELECTED_DAYS = c
  if (NUM_SELECTED_DAYS < 2) {
    $("#deposit-slider").addClass("limited")
    $("#deposit-notice").addClass("visible")
    $("#deposit-slider")[0].value = Math.min($("#deposit-slider")[0].value, 10)
    slider($("#deposit-slider")[0])
    if (IS_2X) {
      if (NUM_SELECTED_DAYS < 1) {
        $("#schedule-button")[0].innerHTML = "Schedule <span class='twoX'>2X</span> Wakeup (0)"
      }
      else {
        $("#schedule-button")[0].innerHTML = "Schedule <span class='twoX'>2X</span> Wakeup (1)"
      }
    }
    else {
      $("#schedule-button")[0].innerHTML = "Schedule Wakeup"
    }
    $("#wakeup-times-subtitle")[0].innerHTML = "Select Wakeup Time"
  }
  else {
    $("#deposit-slider").removeClass("limited")
    $("#deposit-notice").removeClass("visible")
    $("#deposit-slider")[0].value = (parseInt(localStorage.getItem(LOCAL_STORAGE_TAG + "deposit")) || 10)
    slider($("#deposit-slider")[0])
    if (IS_2X) {
      $("#schedule-button")[0].innerHTML = ("Schedule <span class='twoX'>2X</span> Wakeups (" + NUM_SELECTED_DAYS.toString() + ")")
    }
    else {
    $("#schedule-button")[0].innerHTML = ("Schedule " + NUM_SELECTED_DAYS.toString() + " Wakeups")
    }
    $("#wakeup-times-subtitle")[0].innerHTML = "Select Wakeup Times"
  }
  if (NUM_SELECTED_DAYS < 1) {
    $("#schedule-button")[0].disabled = true
  }
  else {
    $("#schedule-button")[0].disabled = false
  }
}

const slider = (obj, userInputted = false) => {
  let deposit = Math.round(obj.value)
  if (NUM_SELECTED_DAYS < 2) {
    if (deposit > 10) {
      userInputted = false
    }
    deposit = Math.min(deposit, 10)
    obj.value = deposit
  }
  document.getElementById("deposit-amount").value = deposit.toString()
  adjustDepositInput(document.getElementById("deposit-amount"))
  if (userInputted) {
    localStorage.setItem(LOCAL_STORAGE_TAG + "deposit", deposit.toString())
  }
  for (let wakeup of WAKEUPS) {
    wakeup.deposit = (deposit * 100)
  }
  genWakeups()
  if (NUM_SELECTED_DAYS < 1) {
    $("#schedule-button")[0].disabled = true
  }
  else {
    $("#schedule-button")[0].disabled = false
  }
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

const depositInput = (obj) => {
  const element = document.getElementById("deposit-slider")
  element.value = Math.min(Math.max((parseInt(obj.value) || 5), 5), 99)
  slider(element, true)
}

const adjustDepositInput = (obj) => {
  obj.style.width = ((Math.max(obj.value.toString().length, 1) * 40) + "px")
}

const adjustHourInput = (obj) => {
  if (obj.value.toString().length === 2) {
    obj.style.width = "36px"
  }
  else {
    obj.style.width = "24px"
  }
}

const initDays = () => {
  const container = document.getElementById("day-container")
  const TODAY = moment().tz(TIME_ZONE).diff(moment.tz(EPOCH, TIME_ZONE).hour(0).minute(0).second(0), "days")
  for (let i = 0; i < 6; i++) {
    let m = moment().add(i + 1, "days").subtract(2, "hours")
    let day = m.format("DD").toString().trim()
    let month = m.format("MMM").toUpperCase().trim()
    let ofWeek = m.format("ddd").trim()
    if (i === 0) {
      ofWeek = "Tmrw"
    }
    let ofWeekAdd = ""
    try {
      ofWeekAdd = __EMOJIS[month][day]
    } catch (e) {
      ofWeekAdd = ""
    }
    if (ofWeekAdd === undefined) {
      ofWeekAdd = ""
    }
    ofWeek = (ofWeekAdd + ofWeek)
    let div = document.createElement("div")
    div.className = "day"
    div.onclick = () => {
      toggleDay(div)
    }
    div.id = ("day-select-" + i.toString())
    div.name = (TODAY + i + 1).toString()
    let p1 = document.createElement("p")
    p1.innerHTML = month
    div.appendChild(p1)
    let h3 = document.createElement("h3")
    h3.innerHTML = day
    div.appendChild(h3)
    let p2 = document.createElement("p")
    p2.innerHTML = ofWeek
    div.appendChild(p2)
    container.appendChild(div)
  }
}

const genWakeups = () => {
  const data = WAKEUPS.sort((a, b) => {
    return (a.day - b.day)
  })
  let container = document.getElementById("wakeup-container")
  let noWakeups = document.getElementById("no-wakeups")
  $(".wakeup").remove()
  if (data.length > 0) {
    noWakeups.style.display = "none"
  }
  else {
    noWakeups.style.display = "block"
  }
  for (const wakeup of data) {
    const ofWeek = moment.tz(EPOCH, LOCAL_TIME_ZONE).add(wakeup.day, "days").format("ddd").toLowerCase().trim()
    localStorage.setItem(LOCAL_STORAGE_TAG + "wakeup-" + ofWeek, wakeup.time.toString())
    const deposit = (wakeup.deposit / 100).toString()
    const hour = Math.floor(wakeup.time / 60).toString()
    const minute = (wakeup.time % 60).toString()
    const date = moment.tz(EPOCH, LOCAL_TIME_ZONE).add(wakeup.day, "days").format("MMMM Do")
    const fromNow = moment.tz(EPOCH, LOCAL_TIME_ZONE).add(wakeup.day, "days").hour(parseInt(hour)).minute(parseInt(minute)).fromNow()

    let parent = document.createElement("div")
    parent.className = "wakeup"
    let depositContainer = document.createElement("div")
    depositContainer.className = "deposit-container"
    if (IS_2X) {
      depositContainer.className = "deposit-container __twox-mode"
    }
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
    let hourInput = document.createElement("input")
    hourInput.className = "hour-input"
    hourInput.maxLength = 2
    hourInput.inputmode = "numeric"
    hourInput.pattern = "[0-9]*"
    hourInput.placeholder = Math.floor(DEFAULT_WAKEUP_TIME / 60).toString()
    hourInput.value = hour
    hourInput.onblur = () => {
      setWakeupHour(wakeup, hourInput)
    }
    const adjustment = () => {
      adjustHourInput(hourInput)
    }
    hourInput.onkeyup = adjustment
    hourInput.onkeydown = adjustment
    hourInput.onpaste = adjustment
    adjustment()
    let colon = document.createElement("span")
    colon.className = "colon"
    colon.innerHTML = ":"
    let minuteInput = document.createElement("input")
    minuteInput.className = "minute-input"
    minuteInput.maxLength = 2
    minuteInput.inputmode = "numeric"
    minuteInput.pattern = "[0-9]*"
    minuteInput.placeholder = Math.floor(DEFAULT_WAKEUP_TIME % 60).toString().padStart(2, "0")
    minuteInput.value = minute.padStart(2, "0")
    minuteInput.onblur = () => {
      setWakeupMinute(wakeup, minuteInput)
    }
    let am = document.createElement("span")
    am.className = "am"
    am.innerHTML = "am"
    let p = document.createElement("p")
    p.innerHTML = (date + " &#8212; " + fromNow)
    let cancel = document.createElement("div")
    cancel.className = "cancel"
    let button = document.createElement("img")
    button.src = "assets/images/cancel.png"
    button.onclick = () => {
      toggleDay(document.getElementById("day-select-" + wakeup.index.toString()))
    }

    h1.appendChild(dollarSign)
    h1.appendChild(depositAmount)
    depositBox.appendChild(h1)
    depositContainer.appendChild(depositBox)
    parent.appendChild(depositContainer)
    h3.appendChild(hourInput)
    h3.appendChild(colon)
    h3.appendChild(minuteInput)
    h3.appendChild(am)
    info.appendChild(h3)
    info.appendChild(p)
    parent.appendChild(info)
    cancel.appendChild(button)
    parent.appendChild(cancel)
    container.appendChild(parent)
  }
}

const setExistingWakeups = (data = []) => {
  data = data.sort((a, b) => {
    return (a.day - b.day)
  })
  localStorage.setItem(LOCAL_STORAGE_TAG + "wakeups", JSON.stringify(data))
  const TODAY = moment().tz(TIME_ZONE).diff(moment.tz(EPOCH, TIME_ZONE).hour(0).minute(0).second(0), "days")
  EXISTING_WAKEUPS = [false, false, false, false, false, false]
  for (let wakeup of data) {
    let index = ((wakeup.day - TODAY) - 1)
    if (index < 6 && index > (-1)) {
      EXISTING_WAKEUPS[index] = true
      for (let i = 0; i < WAKEUPS.length; i++) {
        if (WAKEUPS[i].day === wakeup.day) {
          WAKEUPS.splice(i, 1)
        }
      }
    }
  }
  for (let i = 0; i < EXISTING_WAKEUPS.length; i++) {
    if (EXISTING_WAKEUPS[i]) {
      SELECTED_DAYS[i] = false
      $("#day-select-" + i.toString()).addClass("disabled")
      $("#day-select-" + i.toString()).removeClass("selected")
    }
    else {
      $("#day-select-" + i.toString()).removeClass("disabled")
    }
  }
  genWakeups()
  for (let i = 0; i < 6; i++) {
    if (NUM_SELECTED_DAYS > 1) {
      break;
    }
    if (!SELECTED_DAYS[i]) {
      toggleDay(document.getElementById("day-select-" + i.toString()))
    }
  }
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
      setExistingWakeups(data.wakeups)
      WAKEUPS_FETCHED = true
    }
  })
}

const fetchCard = () => {
  $.ajax({
    url: (API + "/card"),
    type: "GET",
    xhrFields: {
      withCredentials: true
    },
    beforeSend: (xhr) => {
      xhr.setRequestHeader("Authorization", ID_TOKEN)
    },
    success: (data) => {
      setCard(data)
    }
  })
}

let USING_CARD_ON_FILE = false;
let CARD_ON_FILE = { valid: false }
const setCard = (data = { valid: false }) => {
  localStorage.setItem(LOCAL_STORAGE_TAG + "card", JSON.stringify(data))
  CARD_ON_FILE = data.card
  if (CARD_ON_FILE.valid) {
    $("#last-four")[0].innerHTML = CARD_ON_FILE.last4.toString()
    $("#card-brand")[0].innerHTML = CARD_ON_FILE.cardType.toString()
    $(".__payment-alt").removeClass("hidden")
    $(".__payment").addClass("hidden")
    if (SAVE_PAYMENT_INFO) {
      toggleSavePaymentInfo()
    }
    USING_CARD_ON_FILE = true;
  }
  else if (USING_CARD_ON_FILE) {
    noCard()
  }
}

const noCard = () => {
  $(".__payment").removeClass("hidden")
  $(".__payment-alt").addClass("hidden")
  if (!SAVE_PAYMENT_INFO) {
    toggleSavePaymentInfo()
  }
  USING_CARD_ON_FILE = false;
}

const schedule = () => {
  if (NUM_SELECTED_DAYS > 0) {
    $("#schedule-button").addClass("loading")
    let c = 0
    const success = () => {
      $("#home-button")[0].click()
    }
    const error = () => {
      $("#schedule-button").removeClass("loading")
      if (c > 0) {
        MODAL.displayHTML("<p>Server Error - only " + c.toString() + "/" + WAKEUPS.length.toString() + " wakeups were scheduled successfully.")
      }
      else {
        MODAL.displayHTML("<p>Server Error - your wakeup(s) could not be scheduled.")
      }
    }
    let customerID = ""
    if (USING_CARD_ON_FILE) {
      customerID = CARD_ON_FILE.customerID
    }
    const recurse = () => {
      submitToken((token) => {
        if (token) {
          const paymentToken = token.id
          const cardToken = token.card.id
          const wakeup = WAKEUPS[c]
          const m = moment.tz(EPOCH, LOCAL_TIME_ZONE).add(wakeup.day, "days").add(Math.floor(wakeup.time / 60), "hours").add(wakeup.time % 60, "minutes").tz(TIME_ZONE)
          const hour = parseInt(m.get("hour"))
          const minute = parseInt(m.get("minute"))
          const time = ((hour * 60) + minute)
          $.ajax({
            url: (API + "/schedule"),
            type: "PUT",
            xhrFields: {
              withCredentials: true
            },
            beforeSend: (xhr) => {
              xhr.setRequestHeader("Authorization", ID_TOKEN)
            },
            data: {
              token: paymentToken.toString(),
              time: time,
              deposit: wakeup.deposit,
              day: wakeup.day,
              saveCard: SAVE_PAYMENT_INFO,
              customerID: customerID,
            },
            success: (data) => {
              SAVE_PAYMENT_INFO = false;
              c++;
              if (c === WAKEUPS.length) {
                success()
              }
              else {
                recurse()
              }
            },
            error: (e) => {
              error()
            }
          })
        }
        else {
          $("#schedule-button").removeClass("loading")
        }
      })
    }
    recurse()
  }
}

const STRIPE_ELEMENTS = stripe.elements({
  fonts: [{
    cssSrc: "https://fonts.googleapis.com/css2?family=Urbanist:wght@500&display=swap"
  }]
})

const PAYMENT_INFO = STRIPE_ELEMENTS.create('card', {
  style: {
    base: {
      fontSize: "16px",
      fontWeight: "500",
      fontFamily: "'Urbanist', sans-serif",
      color: "black",
      width: "300px",
      background: "transparent",
      backgroundColor: "transparent",
      "::placeholder": {
        color: "rgba(0,0,0,0.4)",
      }
    }
  }
})

const submitToken = (callback) => {
  if (USING_CARD_ON_FILE) {
    callback({ id: true, card: { id: true } })
  }
  else {
    stripe.createToken(PAYMENT_INFO).then((result) => {
      if (result.error) {
        callback(false)
      } else {
        callback(result.token)
      }
    })
  }
}

let SAVE_PAYMENT_INFO = true
const toggleSavePaymentInfo = () => {
  if (SAVE_PAYMENT_INFO) {
    $("#save-payment-info-checkbox").removeClass("checked")
    $("#save-payment-info-checkbox")[0].innerHTML = ""
    SAVE_PAYMENT_INFO = false
  }
  else {
    $("#save-payment-info-checkbox").addClass("checked")
    $("#save-payment-info-checkbox")[0].innerHTML = "&check;"
    SAVE_PAYMENT_INFO = true
  }
}
