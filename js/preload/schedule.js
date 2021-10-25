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
}

const slider = (obj) => {
  const deposit = Math.round(obj.value)
  document.getElementById("deposit-amount").value = deposit.toString()
  document.getElementById("deposit-amount").style.width = ((deposit.toString().length * 40) + "px")
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

const depositInput = (obj) => {
  const element = document.getElementById("deposit-slider")
  element.value = Math.min(Math.max((parseInt(obj.value) || 5), 5), 99)
  slider(element)
}

const adjustDepositInput = (obj) => {
  obj.style.width = ((Math.max(obj.value.toString().length, 1) * 40) + "px")
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
