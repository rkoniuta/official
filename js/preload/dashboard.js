const LOCAL_TIME_ZONE = moment.tz.guess()
let MONTH_RETURN = 10
let CHART_RETURN = 10
let TODAY_RETURN = 10
let RETURN_TOGGLE = 0
let YESTERDAY_FLAG = 0
let CHARTING = false
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
  else if (CHARTING) {
    historic = CHART_RETURN
  }
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
  if (RETURN_TOGGLE) {
    historic = TODAY_RETURN
  }
  else if (CHARTING) {
    historic = CHART_RETURN
  }
  const deposit = Math.round(document.getElementsByClassName("slider")[0].value)
  const returns =  (Math.floor(deposit * ((historic / 100) + 1) * 100) / 100)
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
  $("#earnings-chart").addClass("hidden")
  $("#chart-top-bounds").addClass("hidden")
  $("#chart-bottom-bounds").addClass("hidden")
}

const set30DayReturns = () => {
  RETURN_TOGGLE = 0
  CHARTING = false
  $("#30d-button").addClass("active")
  $("#1d-button").removeClass("active")
  document.getElementById("1d-30d-text").innerHTML = "In the last 30 days,"
  slider(document.getElementById("estimate-slider"))
  $("#earnings-chart").removeClass("hidden")
  $("#chart-top-bounds").removeClass("hidden")
  $("#chart-bottom-bounds").removeClass("hidden")
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
  $("#earnings-chart").addClass("hidden")
  genEarningsChart(data)
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
  let time = moment().hour(12).add(moment().get("hour") - moment.tz(moment.now(), "America/Los_Angeles").get("hour"), "hours").format("h a")
  if (time === "12 pm") {
    time = "noon"
  }
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
  text.innerHTML = ("You successfully verified this wakeup and will be paid at <b>" + time + "</b> (12 pm PST) today.")
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
    const m = moment.tz(EPOCH, TIME_ZONE).add(wakeup.day, "days").add(Math.floor(wakeup.time / 60), "hours").add(wakeup.time % 60, "minutes").tz(LOCAL_TIME_ZONE)
    const hour = m.format("h")
    const minute = m.format("mm")
    const date = m.format("MMMM Do")
    const ampm = m.format("a").toLowerCase()
    const fromNow = m.fromNow()

    let parent = document.createElement("div")
    parent.id = ("wakeup-" + wakeup.id)
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
    am.innerHTML = ampm
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
      displayVerified()
    }
  })
}

const displayVerified = () => {
  const url = new URLSearchParams(window.location.search)
  if (url.get("verified")) {
    const wakeupID = decodeURIComponent(url.get("verified"))
    let devAdd = ""
    if (JSON.parse(localStorage.getItem("__paywake-dev"))) {
      devAdd = "?source=dev"
      if (JSON.parse((new URLSearchParams(window.location.href)).get("hidebanner"))) {
        devAdd = "?source=dev&hidebanner=true"
      }
    }
    window.history.replaceState(null, null, window.location.pathname + devAdd)
    document.getElementById("wakeup-" + wakeupID).querySelector("img").click()
  }
}

let MADE_CHART = false
let CHART = null
const genEarningsChart = (data) => {
  const getBlackGradient = (ctx, chartArea, opacity1 = 0, opacity2 = 1) => {
    const chartWidth = (chartArea.right - chartArea.left)
    const chartHeight = (chartArea.bottom - chartArea.top)
    let gradient = false;
    if (!gradient || width !== chartWidth || height !== chartHeight) {
      width = chartWidth;
      height = chartHeight;
      gradient = ctx.createLinearGradient(width/2, 0, width/2, height)
      gradient.addColorStop(0.6, ("rgba(255,255,255," + opacity2.toString() + ")"))
      gradient.addColorStop(1, ("rgba(255,255,255," + opacity1.toString() + ")"))
    }
    return gradient
  }
  const getGradient = (ctx, chartArea, opacity = 1) => {
    const chartWidth = (chartArea.right - chartArea.left)
    const chartHeight = (chartArea.bottom - chartArea.top)
    let gradient = false;
    if (!gradient || width !== chartWidth || height !== chartHeight) {
      width = chartWidth;
      height = chartHeight;
      gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, ("rgba(255,204,0," + opacity.toString() + ")"))
      gradient.addColorStop(0.5, ("rgba(255,0,0," + opacity.toString() + ")"))
      gradient.addColorStop(1, ("rgba(102,0,255," + opacity.toString() + ")"))
    }
    return gradient
  }
  const genGradient = (context, opacity1, opacity2) => {
    const chart = context.chart;
    const {ctx, chartArea} = chart;
    if (!chartArea) {
      return;
    }
    if (opacity2 || opacity2 === 0) {
      return getBlackGradient(ctx, chartArea, opacity1, opacity2);
    }
    return getGradient(ctx, chartArea, opacity1);
  }
  let iStart = 1;
  if (data.earnings.length === 30) {
    iStart = 2
  }
  const labelFormat = "MM / DD"
  const labels = []
  if (data.earnings.length === 30) {
    labels.push("Yesterday")
    labels.push("Yesterday")
  }
  else {
    labels.push("Today")
    labels.push("Today")
  }
  for (let i = iStart; i < 31; i++) {
    labels.push(moment().subtract(i,"day").format(labelFormat))
  }
  labels.push(moment().subtract(30,"day").format(labelFormat))
  labels.reverse()
  const maxValue = Math.round(Math.max(...(data.earnings || []).map((e) => (e.earnings * 100))) + 4)
  $("#chart-last-day").text(moment().subtract(30,"day").format(labelFormat))
  $("#chart-top-percent").text(maxValue.toString() + "%")
  const chartData = (data.earnings || []).sort((a,b) => {
    return a.day - b.day
  }).map((e) => (e.earnings * 100))
  chartData.unshift(chartData[0])
  chartData.push(chartData[chartData.length - 1])
  if (!MADE_CHART) {
    CHART = new Chart(document.getElementById("__earnings-chart"), {
      type: "line",
      data: {
        labels: labels,
        datasets: [{
          pointRadius: 0,
          backgroundColor: (context) => { return genGradient(context, 0, 0.7) },
          borderWidth: 8,
          borderColor: (context) => { return genGradient(context, 1) },
          fill: true,
          tension: 0.34,
          curvature: 1,
          data: chartData,
        }]
      },
      options: {
        elements: {
          line: {
            borderJoinStyle: "round"
          }
        },
        hover: {
          mode: 'nearest',
          intersect: true
        },
        maintainAspectRatio: false,
        responsive: true,
        animation: false,
        layout: {
          padding: 0
        },
        scales: {
          x: {
            display: false,
            grid: {
              color: "rgba(0,0,0,0)"
            }
          },
          y: {
            display: false,
            grid: {
              color: "rgba(0,0,0,0)"
            },
            min: 0,
            max: maxValue,
          },
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            intersect: false,
            position: "nearest",
            titleColor: "rgba(255,255,255,0.6)",
            titleFont: {
              family: "'Urbanist', san-serif",
              weight: "bold",
              size: 12,
              lineHeight: 1,
            },
            bodyFont: {
              family: "'Urbanist', san-serif",
              weight: "400",
              size: 17,
              lineHeight: 0.75,
            },
            xAlign: "center",
            yAlign: "center",
            padding: {
              left: 8,
              right: 8,
              bottom: 8,
              top: 8,
            },
            borderWidth: 6,
            borderColor: (context) => { return genGradient(context, 1) },
            caretSize: 0,
            displayColors: false,
            cornerRadius: 8,
            titleAlign: "center",
            bodyAlign: "center",
            backgroundColor: "rgba(255,255,255,1)",
            callbacks: {
              label: (context) => {
                CHART_RETURN = context.raw
                CHARTING = true
                let bigTitle = ("On " + moment(context.label.trim().toLowerCase(), "MM / DD").format("MMMM Do") + ",")
                if (context.label === labels[labels.length - 1]) {
                  if (data.earnings.length === 30) {
                    bigTitle = "Yesterday,"
                  }
                  else {
                    bigTitle = "Today,"
                  }
                }
                document.getElementById("1d-30d-text").innerHTML = bigTitle
                slider(document.getElementById("estimate-slider"))
                //return (Math.round(context.raw * 10) / 10).toString() + "%"
                return ""
              },
              title: (context) => {
                return ""
              }
            }
          },
        }
      }
    })
    MADE_CHART = true
  }
  else {
    CHART.data.labels = labels
    CHART.data.datasets[0].data = chartData
    CHART.update()
  }
}
