const SELECTED_DAYS = [false, false, false, false, false, false]
let NUM_SELECTED_DAYS = 0

const toggleDay = (obj) => {
  const index = parseInt(obj.id.split("-")[2])
  SELECTED_DAYS[index] = (!SELECTED_DAYS[index])
  if (SELECTED_DAYS[index]) {
    $(obj).addClass("selected")
  }
  else {
    $(obj).removeClass("selected")
  }
  let c = 0
  for (const day of SELECTED_DAYS) {
    if (day) {
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
  }
  else {
    $("#deposit-slider").removeClass("limited")
    $("#deposit-notice").removeClass("visible")
    $("#deposit-slider")[0].value = (parseInt(localStorage.getItem(LOCAL_STORAGE_TAG + "deposit")) || 10)
    slider($("#deposit-slider")[0])
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

/* STRIPE TESTING */
const elements = stripe.elements()
const card = elements.create('card', {
  style: {
    base: {
      fontSize: "15px",
      fontFamily: "'Urbanist', sans-serif",
      color: "rgba(0,0,0,0.4)",
      width: "300px",
    },
  }
})
const submitToken = () => {
  stripe.createToken(card).then((result) => {
   if (result.error) {
     console.log("There was an error.")
   } else {
     console.log("Token: ", result.token)
   }
 })
}
