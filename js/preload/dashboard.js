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
  let returns = (((Math.floor(deposit * ((historic / 100) + 1) * 100) / 100)) - 0.01)
  if (IS_2X) {
    returns = (((Math.floor(deposit * (((historic / 100) * 2) + 1) * 100) / 100)) - 0.01);
  }
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
  let add = "the last 30 days of Paywake user data"
  if (RETURN_TOGGLE === 1) {
    if (YESTERDAY_FLAG) {
      add = "yesterday's Paywake user data"
    }
    else {
      add = "today's Paywake user data"
    }
  }
  const text = ("This $" + dollarString + " average return is based on " + add + " and includes both the extra payment and refunded deposit amounts.")
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
  $("#chart-backdrop").removeClass("active")
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
  $("#chart-backdrop").addClass("active")
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
  title.style.marginBottom = "24px"
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

const missedClick = (node, wakeup) => {
  const m = moment.tz(EPOCH, TIME_ZONE).add(wakeup.day, "days").add(Math.floor(wakeup.time / 60), "hours").add(wakeup.time % 60, "minutes").tz(LOCAL_TIME_ZONE)
  let elements = []
  let center = document.createElement("div")
  center.className = "center"
  let img = document.createElement("img")
  img.src = "assets/images/failed.png"
  center.appendChild(img)
  let title = document.createElement("h3")
  title.className = "center"
  title.innerHTML = "Verification Missed"
  title.style.marginBottom = "24px"
  let text = document.createElement("p")
  text.innerHTML = ("You missed the photo verification window for this wakeup (<b>" + m.format("h:mm a") + "</b> to <b>" + m.add(3, "minutes").format("h:mm a") + "</b>) and were charged $" + Math.floor(wakeup.deposit / 100).toString() + ".00 USD.")
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
    let deposit = (wakeup.deposit / 100).toString()
    const m = moment.tz(EPOCH, TIME_ZONE).add(wakeup.day, "days").add(Math.floor(wakeup.time / 60), "hours").add(wakeup.time % 60, "minutes").tz(LOCAL_TIME_ZONE)
    const hour = m.format("h")
    const minute = m.format("mm")
    const date = m.format("MMMM Do")
    const ampm = m.format("a").toLowerCase()
    const fromNow = m.fromNow()
    const missed = ((m.add(3, "minutes").diff(moment()) < 0) && !wakeup.verified)
    const is2x = wakeup.is2x
    if (is2x) {
      deposit /= 2
    }

    let parent = document.createElement("div")
    parent.id = ("wakeup-" + wakeup.id)
    parent.className = "wakeup"
    if (is2x) {
      parent.className = "wakeup twox"
    }
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
    else if (missed) {
      p.innerHTML = (date + " &#8212; <b class='missed'>Missed</b>")
      button.src = "assets/images/failed.png"
      button.className = "missed"
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
    if (is2x) {
      let wakeup2xNote = document.createElement("p")
      wakeup2xNote.innerHTML = TWOX_WAKEUP_DESC
      depositBox.appendChild(wakeup2xNote)
    }
    const node = parent.cloneNode(true)
    cancel.appendChild(button)
    parent.appendChild(cancel)
    container.appendChild(parent)

    if (wakeup.is2x && !wakeup.verified && !missed) {
      depositBox.onclick = () => {
        display2XWakeup(node)
      }
    }

    if (wakeup.verified) {
      button.onclick = () => {
        verifiedClick(node)
      }
      p.querySelector("b").onclick = button.onclick
      depositBox.onclick = button.onclick
    }
    else if (missed) {
      button.onclick = () => {
        missedClick(node, wakeup)
      }
      p.querySelector("b").onclick = button.onclick
      depositBox.onclick = button.onclick
    }
    else {
      button.onclick = () => {
        cancelWakeup(JSON.parse(JSON.stringify(wakeup)), node)
      }
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
      let setFlag = false
      if (!(JSON.parse(localStorage.getItem(LOCAL_STORAGE_TAG + "wakeups")) || []).length) {
        setFlag = true
      }
      setWakeups(data.wakeups)
      if (setFlag) {
        __worker2x()
      }
      displayVerified()
      if (localStorage.getItem(LOCAL_STORAGE_TAG + "stale") !== null) {
        displayIfFailure()
      }
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

const displayIfFailure = () => {
  const url = new URL(window.location.href)
  if (url.searchParams.get(NOTIFICATION_STRING_2X)) {
    const wakeupID = decodeURIComponent(url.searchParams.get("id"))
    url.searchParams.delete(NOTIFICATION_STRING_2X)
    url.searchParams.delete("id")
    window.history.replaceState(null, null, url.toString())
    MODAL.hide = () => {
      if (MODAL.visible) {
        MODAL.visible = false
        const backdrop = document.getElementById("__modal-backdrop")
        const container = document.getElementById("__modal-container")
        $(backdrop).removeClass("visible")
        $(container).removeClass("visible")
        setTimeout(() => {
          backdrop.className = ""
          setTimeout(() => {
            display2XMode()
          }, 50)
        }, 650)
        try {
          $("#__modal-canvas")[0].remove()
        } catch (e) {}
      }
    }
    document.getElementById("wakeup-" + wakeupID).querySelector("img").click()
  }
}

let HAS_DISPLAYED_2X_MODE = false
const display2XMode = () => {
  if (!HAS_DISPLAYED_2X_MODE) {
    MODAL.hide = () => {
      if (MODAL.visible) {
        MODAL.visible = false
        const backdrop = document.getElementById("__modal-backdrop")
        const container = document.getElementById("__modal-container")
        $(backdrop).removeClass("visible")
        $(container).removeClass("visible")
        setTimeout(() => {
          backdrop.className = ""
        }, 650)
        try {
          $("#__modal-canvas")[0].remove()
        } catch (e) {}
      }
    }
    HAS_DISPLAYED_2X_MODE = true
    let elements = []
    let center = document.createElement("div")
    center.className = "center"
    let img = document.createElement("img")
    img.src = "assets/images/lightning.png"
    img.style.width = "96px"
    img.style.height = "96px"
    img.style.marginBottom = "32px"
    center.appendChild(img)
    let title = document.createElement("h3")
    title.innerHTML = "You've got <span class='twoX'>2X</span> for the day"
    let text = document.createElement("p")
    text.innerHTML = "Woke up late? We know the feeling.<br><br>That's why we're giving you <b><span class='twoX'>2X</span></b> rewards for the day. This means you'll be paid double when you wake up tomorrow. <a class='gradient __twox-mode' href='./faq?search=2X%20wakeup'>Learn more</a><br><br>"
    elements.push(center)
    elements.push(title)
    elements.push(text)
    let group = document.createElement("div")
    group.className = "button-group"
    let goback = document.createElement("button")
    goback.innerHTML = "Dismiss"
    goback.className = "transparent"
    let confirm = document.createElement("button")
    confirm.innerHTML = "Schedule a <span class='twoX'>2X</span> Wakeup"
    confirm.id = "__modal-dismiss"
    group.appendChild(goback)
    group.appendChild(confirm)
    elements.push(group)
    goback.onclick = () => {
      MODAL.hide()
    }
    confirm.onclick = () => {
      leavePage("./schedule")
    }
    MODAL.display(elements)
  }
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

let MADE_CHART = false
let CHART = null
const genEarningsChart = (data) => {
  if (data.earnings.length) {
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
        if (IS_2X) {
          gradient.addColorStop(0, ("rgba(199,255,0," + opacity.toString() + ")"))
          gradient.addColorStop(0.5, ("rgba(0,255,0," + opacity.toString() + ")"))
          gradient.addColorStop(1, ("rgba(0,179,255," + opacity.toString() + ")"))
        }
        else {
          gradient.addColorStop(0, ("rgba(255,204,0," + opacity.toString() + ")"))
          gradient.addColorStop(0.5, ("rgba(255,0,0," + opacity.toString() + ")"))
          gradient.addColorStop(1, ("rgba(102,0,255," + opacity.toString() + ")"))
        }
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
    let maxValue = Math.round(Math.max(...(data.earnings || []).map((e) => (e.earnings * 100))) + 3)
    //$("#chart-last-day").text(moment().subtract(30,"day").format(labelFormat))
    $("#chart-last-day").text("")
    $("#chart-top-percent").text(maxValue.toString() + "%")
    if (IS_2X) {
      $("#chart-top-percent").text((((maxValue - 3) * 2) + 2).toString() + "%")
    }
    const chartData = (data.earnings || []).sort((a,b) => {
      return a.day - b.day
    }).map((e) => (e.earnings * 100))
    chartData.unshift(chartData[0])
    chartData.push(chartData[chartData.length - 1])
    let backg = (context) => { return genGradient(context, 0, 0.66) };
    if (window.innerWidth < 561) {
      backg = "white"
    }
    const cbs = {
      label: (context) => {
        CHART_RETURN = context.raw
        CHARTING = true
        let bigTitle = ("On <span class='chart-dark'>" + moment(context.label.trim().toLowerCase(), "MM / DD").format("MMMM Do") + ",</span>")
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
    if (!MADE_CHART) {
      CHART = new Chart(document.getElementById("__earnings-chart"), {
        type: "line",
        data: {
          labels: labels,
          datasets: [{
            pointRadius: 0,
            backgroundColor: backg,
            borderWidth: 8,
            borderColor: (context) => { return genGradient(context, 1) },
            fill: true,
            tension: 0.34,
            curvature: 1,
            data: chartData,
          }]
        },
        options: {
          onResize: () => {
            if (CHART) {
              if (window.innerWidth < 561) {
                CHART.data.datasets[0].backgroundColor = "white"
              }
              else {
                CHART.data.datasets[0].backgroundColor = (context) => { return genGradient(context, 0, 0.66) }
              }
              CHART.update()
            }
          },
          elements: {
            line: {
              borderJoinStyle: "round"
            }
          },
          hover: {
            mode: "average",
            intersect: true
          },
          maintainAspectRatio: false,
          responsive: true,
          animation: true,
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
              callbacks: cbs,
            },
          }
        }
      })
      MADE_CHART = true
    }
    else {
      CHART.data.labels = labels
      CHART.data.datasets[0].data = chartData
      CHART.options.plugins.tooltip.callbacks = cbs
      CHART.update()
    }
  }
}

fetchEarnings()
fetchWakeups()
