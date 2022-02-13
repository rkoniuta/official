const slider = (obj) => {
  const deposit = Math.round(obj.value)
  const returns = (Math.floor(deposit * ((ESTIMATED_RETURN / 100) + 1) * 100) / 100)
  document.getElementById("deposit-amount").innerHTML = deposit.toString()
  document.getElementById("return-amount").innerHTML = Math.floor(returns).toString()
  document.getElementById("return-amount-cents").innerHTML = ("." + Math.round((returns - Math.floor(returns)) * 100).toString().padEnd(2, "0"))
}

const sliderInit = (obj) => {
  obj.value = (Math.floor(Math.random() * (SLIDER_INIT_MAX - SLIDER_INIT_MIN)) + SLIDER_INIT_MIN)
  slider(obj)
}

const estimateAlert = () => {
  const deposit = Math.round(document.getElementsByClassName("slider")[0].value)
  const returns =  (Math.floor(deposit * ((ESTIMATED_RETURN / 100) + 1) * 100) / 100)
  const dollarString = (Math.floor(returns).toString() + ("." + Math.round((returns - Math.floor(returns)) * 100).toString().padEnd(2, "0")))
  const text = ("This $" + dollarString + " return figure is based on our beta tests and subject to change.")
  alert(text)
}

const getStartedClick = () => {
  document.getElementById("name").focus()
}

const scheduleClick = () => {
  if (USER === null) {
    leavePage("./create")
  }
  else {
    leavePage("./schedule")
  }
}

const throttle = (ms, callback) => {
  let lastCall = 0
  return () => {
    const now = new Date().getTime()
    const diff = (now - lastCall)
    if (diff >= ms) {
      lastCall = now
      callback.apply(this)
    }
  }
}

const SCREEN_PARA = 2.5
const HAND_PARA = 2
$(window).scroll(throttle(10, () => {
  const scroll = $(window).scrollTop()
  try {
    $(".phone-block").css("transform", ("translateY(-" + (scroll / HAND_PARA).toString() + "px)"))
    $("#screenshot").css("transform", ("translateY(-" + ((scroll / HAND_PARA) + (scroll / SCREEN_PARA)).toString() + "px)"))
  }
  catch (e) {}
}))
