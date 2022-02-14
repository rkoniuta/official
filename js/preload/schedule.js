let SELECTED_DAYS = [false, false, false, false, false, false]
let EXISTING_WAKEUPS = SELECTED_DAYS
let WAKEUPS_FETCHED = false
const WAKEUPS = []
let NUM_SELECTED_DAYS = 0
const LOCAL_TIME_ZONE = moment.tz.guess()

const DEFAULT_WAKEUP_TIME = 480
const MIN_WAKEUP_TIME = 300
const MAX_WAKEUP_TIME = 600

let DAY_2X = (parseInt(localStorage.getItem(LOCAL_STORAGE_TAG + "2x-day")) || 0)

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
  if (IS_2X && day === DAY_2X) {
    wakeup.is2x = true
  }
  else {
    wakeup.is2x = false
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
      const TODAY = moment().tz(TIME_ZONE).diff(moment.tz(EPOCH, TIME_ZONE).hour(2).minute(0).second(0), "days")
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
    if (IS_2X && SELECTED_DAYS[TOGGLE_2X_INDEX] === true && NUM_SELECTED_DAYS > 0) {
      $("#schedule-button")[0].innerHTML = "Schedule <span class='twoX'>2X</span> Wakeup"
    }
    else {
      $("#schedule-button")[0].innerHTML = "Schedule Wakeup"
    }
    $("#wakeup-times-subtitle")[0].innerHTML = "Select Wakeup Time"
    $("#wakeup-plural")[0].innerHTML = "your wakeup"
  }
  else {
    $("#deposit-slider").removeClass("limited")
    $("#deposit-notice").removeClass("visible")
    $("#deposit-slider")[0].value = (parseInt(localStorage.getItem(LOCAL_STORAGE_TAG + "deposit")) || 10)
    slider($("#deposit-slider")[0])
    if (IS_2X && SELECTED_DAYS[TOGGLE_2X_INDEX] === true) {
      if (NUM_SELECTED_DAYS === 2) {
        $("#schedule-button")[0].innerHTML = ("Schedule 1 Wakeup + <span class='twoX'>2X</span> Wakeup")
      }
      else {
        $("#schedule-button")[0].innerHTML = ("Schedule " + (NUM_SELECTED_DAYS - 1).toString() + " Wakeups + <span class='twoX'>2X</span> Wakeup")
      }
    }
    else {
      $("#schedule-button")[0].innerHTML = ("Schedule " + NUM_SELECTED_DAYS.toString() + " Wakeups")
    }
    $("#wakeup-times-subtitle")[0].innerHTML = "Select Wakeup Times"
    $("#wakeup-plural")[0].innerHTML = "one of your wakeups"
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

let TOGGLE_2X_INDEX = (-1)
const initDays = () => {
  const container = document.getElementById("day-container")
  const TODAY = moment().tz(TIME_ZONE).diff(moment.tz(EPOCH, TIME_ZONE).hour(2).minute(0).second(0), "days")
  for (let i = 0; i < 6; i++) {
    let m = moment().add(i + 1, "days").subtract(2, "hours")
    let day = m.format("D").toString().trim()
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
    if (IS_2X && (TODAY + 1 + i) === DAY_2X) {
      div.className = "day twox"
      TOGGLE_2X_INDEX = (i)
    }
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

const cacheValue = (input) => {
  input.setAttribute("cache", input.value)
  input.placeholder = input.value
  input.value = ""
}
const uncacheValue = (input) => {
  if (!input.value.length) {
    input.value = input.getAttribute("cache")
  }
  input.removeAttribute("cache")
  if (input.className === "minute-input") {
    input.placeholder = "00"
  }
  else if (input.className === "hour-input") {
    input.placeholder = "8"
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
  let totalAmount = 0
  let c = 0
  for (const wakeup of data) {
    totalAmount += wakeup.deposit;
    const ofWeek = moment.tz(EPOCH, LOCAL_TIME_ZONE).add(wakeup.day, "days").format("ddd").toLowerCase().trim()
    localStorage.setItem(LOCAL_STORAGE_TAG + "wakeup-" + ofWeek, wakeup.time.toString())
    const deposit = (wakeup.deposit / 100).toString()
    const hour = Math.floor(wakeup.time / 60).toString()
    const minute = (wakeup.time % 60).toString()
    const date = moment.tz(EPOCH, LOCAL_TIME_ZONE).add(wakeup.day, "days").format("MMMM Do")
    const fromNow = moment.tz(EPOCH, LOCAL_TIME_ZONE).add(wakeup.day, "days").hour(parseInt(hour)).minute(parseInt(minute)).fromNow()
    const is2x = wakeup.is2x

    let parent = document.createElement("div")
    parent.id = ("wakeup-" + c.toString())
    parent.className = "wakeup"
    if (is2x) {
      parent.className = "wakeup twox"
    }
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
    hourInput.onfocus = () => {
      cacheValue(hourInput)
    }
    hourInput.onblur = () => {
      uncacheValue(hourInput)
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
    minuteInput.onfocus = () => {
      cacheValue(minuteInput)
    }
    minuteInput.onblur = () => {
      uncacheValue(minuteInput)
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
    if (is2x) {
      let wakeup2xNote = document.createElement("p")
      wakeup2xNote.innerHTML = TWOX_WAKEUP_DESC
      depositBox.appendChild(wakeup2xNote)
    }
    const node = parent.cloneNode(true)
    cancel.appendChild(button)
    parent.appendChild(cancel)
    container.appendChild(parent)

    if (wakeup.is2x) {
      depositBox.onclick = () => {
        display2XWakeup(node)
      }
    }
    c++;
  }

  $("#total-amount")[0].innerHTML = ("<span>$</span>" + balanceToString(totalAmount))
}

const balanceToString = (balance = BALANCE) => {
  return Math.floor(balance / 100).toString() + "." + (balance % 100).toString().padStart(2, "0")
}

const setExistingWakeups = (data = []) => {
  data = data.sort((a, b) => {
    return (a.day - b.day)
  })
  localStorage.setItem(LOCAL_STORAGE_TAG + "wakeups", JSON.stringify(data))
  const TODAY = moment().tz(TIME_ZONE).diff(moment.tz(EPOCH, TIME_ZONE).hour(2).minute(0).second(0), "days")
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
let DEFAULT_CARD_ON_FILE = {
  card: {
    valid: false,
  },
}
let CARD_ON_FILE = DEFAULT_CARD_ON_FILE
const setCard = (data = DEFAULT_CARD_ON_FILE) => {
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
    $("#__modal-dismiss").addClass("loading")
    $("#schedule-button").addClass("loading")
    let c = 0
    const success = () => {
      if (NUM_SELECTED_DAYS === 1) {
        localStorage.setItem(LOCAL_STORAGE_TAG + "wakeup-plural", "single")
      }
      else {
        localStorage.setItem(LOCAL_STORAGE_TAG + "wakeup-plural", "plural")
      }
      leavePage("./scheduled")
    }
    const error = () => {
      $("#__modal-dismiss").removeClass("loading")
      $("#schedule-button").removeClass("loading")
      if (c > 0) {
        MODAL.displayHTML("<p><b>Card declined.</b> Only " + c.toString() + "/" + WAKEUPS.length.toString() + " wakeups were scheduled successfully. Please check your card balance or try a different card.")
      }
      else {
        MODAL.displayHTML("<p><b>Card declined.</b> Please check your card balance or try a different card.")
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
          const sendData = {
            token: paymentToken.toString(),
            time: time,
            deposit: wakeup.deposit,
            day: wakeup.day,
            saveCard: SAVE_PAYMENT_INFO,
            customerID: customerID,
            totalScheduled: NUM_SELECTED_DAYS,
          }
          if (wakeup.is2x) {
            sendData.is2x = true
          }
          $.ajax({
            url: (API + "/schedule"),
            type: "PUT",
            xhrFields: {
              withCredentials: true
            },
            beforeSend: (xhr) => {
              xhr.setRequestHeader("Authorization", ID_TOKEN)
            },
            data: sendData,
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
          $("#__modal-dismiss").removeClass("loading")
          $("#schedule-button").removeClass("loading")
        }
      })
    }
    recurse()
  }
}

const confirmSchedule = () => {
  if (NUM_SELECTED_DAYS > 0) {
    submitToken((token) => {
      if (token) {
        try {
          let elements = []
          let title = document.createElement("h3")
          title.innerHTML = "Confirm Schedule"
          elements.push(title)
          const confirmContainer = document.createElement("div")
          confirmContainer.id = "confirm-container"
          for (let wakeup of $(".wakeup-container > .wakeup")) {
            const clone = wakeup.cloneNode(true)
            clone.querySelector(".cancel").remove()
            for (let input of clone.querySelectorAll("input")) {
              input.setAttribute("readonly", true)
            }
            confirmContainer.appendChild(clone)
          }
          elements.push(confirmContainer)
          elements.push($("#total-bar")[0].cloneNode(true))
          const disclaimer = $("#disclaimer")[0].cloneNode(true)
          disclaimer.style.marginBottom = ("24px")
          disclaimer.style.color = ("rgba(0,0,0,0.4)")
          disclaimer.querySelector("a").remove()
          elements.push(disclaimer)
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
            schedule()
          }
          MODAL.display(elements)
        }
        catch (e) {
          console.log(e)
        }
      }
    })
  }
}

const STRIPE_ELEMENTS = STRIPE.elements({
  fonts: [{
    cssSrc: "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400&display=swap"
  }]
})

const PAYMENT_INFO = STRIPE_ELEMENTS.create('card', {
  style: {
    base: {
      fontSize: "16px",
      fontWeight: "400",
      fontFamily: "'Open Sans', sans-serif",
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
    callback({
      id: true,
      card: {
        id: true,
      },
    })
  }
  else {
    STRIPE.createToken(PAYMENT_INFO).then((result) => {
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
    SAVE_PAYMENT_INFO = false
  }
  else {
    $("#save-payment-info-checkbox").addClass("checked")
    SAVE_PAYMENT_INFO = true
  }
}

const calcDay2X = () => {
  const TODAY = moment().tz(TIME_ZONE).diff(moment.tz(EPOCH, TIME_ZONE).hour(2).minute(0).second(0), "days")
  DAY_2X = (TODAY + 1)
  localStorage.setItem(LOCAL_STORAGE_TAG + "2x-day", DAY_2X)
}

if (IS_2X && localStorage.getItem(LOCAL_STORAGE_TAG + "2x-day") === null) {
  calcDay2X()
}

const display2XWakeup = (node) => {
  let elements = []
  let center = document.createElement("div")
  center.className = "center"
  let img = document.createElement("img")
  img.src = "assets/images/lightning.png"
  img.style.marginBottom = "32px"
  center.appendChild(img)
  let title = document.createElement("h3")
  title.innerHTML = "This is a <span class='twoX'>2X</span> Wakeup"
  title.style.marginBottom = "20px"
  let text = document.createElement("p")
  text.innerHTML = "With this wakeup, you'll be paid double if you wake up on time. <a class='gradient __twox-mode' href='./faq?search=2X%20wakeup'>Learn more</a>"
  elements.push(center)
  elements.push(title)
  elements.push(node)
  elements.push(text)
  MODAL.display(elements)
}

fetchWakeups()
fetchCard()
