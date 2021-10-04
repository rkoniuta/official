const stripe = Stripe("pk_test_51JUdOkLpUT5ZEdXBfLc7zrtfyF0ZExQDolGH78FwUuRIC3O2qPalOclEL8mCNISHrXhGuxNA7mX17ARbY28hsvMT00QUcJY6MC")

const logout = () => {
  ROUTINES.logout()
}

const slider = (obj) => {
  const deposit = Math.round(obj.value)
  const returns = (Math.floor(deposit * ((ESTIMATED_RETURN / 100) + 1) * 100) / 100)
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
  const text = ("This $" + dollarString + " average return is based the last 30 days of Paywake user data.")
  alert(text)
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
