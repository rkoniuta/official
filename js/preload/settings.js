const LOCAL_TIME_ZONE = moment.tz.guess()
let HISTORY = []
let FLAT_HISTORY = []

const logout = () => {
  let elements = []
  let title = document.createElement("h3")
  title.innerHTML = "Confirm Log Out"
  elements.push(title)
  let text = document.createElement("p")
  text.innerHTML = ("Are you sure you want to log out of Paywake on this device?")
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
    ROUTINES.logout()
  }
  MODAL.display(elements)
}

const fetchHistory = () => {
  $.ajax({
    url: (API + "/history"),
    type: "GET",
    xhrFields: {
      withCredentials: true
    },
    beforeSend: (xhr) => {
      xhr.setRequestHeader("Authorization", ID_TOKEN)
    },
    success: (data) => {
      setHistory(data.history || [])
    }
  })
}

const addAward = (src, _title, _text) => {
  const award = document.createElement("img")
  award.src = src
  award.id = "award-icon"
  award.onclick = () => {
    let elements = []
    let center = document.createElement("div")
    center.className = "center"
    let img = document.createElement("img")
    img.src = src
    center.appendChild(img)
    let title = document.createElement("h3")
    title.className = "center"
    title.innerHTML = _title
    title.style.marginBottom = "24px"
    let text = document.createElement("p")
    text.innerHTML = _text
    let rewards = document.createElement("p")
    rewards.style.opacity = "1"
    let a = document.createElement("a")
    a.innerHTML = "Rewards coming soon."
    a.className = "gradient"
    rewards.id = "rewards-soon"
    rewards.appendChild(a)
    elements.push(center)
    elements.push(title)
    elements.push(text)
    elements.push(rewards)
    MODAL.display(elements)
  }
  $("#awards")[0].appendChild(award)
}

const setHistory = (data) => {
  localStorage.setItem(LOCAL_STORAGE_TAG + "history", JSON.stringify(data))
  HISTORY = data
  FLAT_HISTORY = JSON.parse(JSON.stringify(data))
  $("#awards")[0].innerHTML = ("")
  for (let item of HISTORY) {
    if (item.data.event === "BIRTH") {
      $("#user-number")[0].innerHTML = numberWithCommas(parseInt(item.data.data.userNumber))
      $("#account-birthday")[0].innerHTML = moment(item.time).format("MMMM DDDo, YYYY")
      let hasAwards = false
      if (moment(item.time).isBefore("2022-02-16")) {
        addAward("assets/images/award-5.png", "Launch Day User", "You participated in <b>Paywake's launch day</b>. Thanks for being there since day 1!")
        hasAwards = true
      }
      if (item.data.data.userNumber < (DIAMOND_USER_THRESHOLD + 1)) {
        addAward("assets/images/award-4.png", "Paywake Diamond User", "You were one of the <b>first 500 users</b> to join Paywake. From all of us on the team, thanks for helping make Paywake what it is today.")
        hasAwards = true
      }
      if (item.data.data.userNumber < (FOUNDING_USER_THRESHOLD + 1)) {
        addAward("assets/images/award-3.png", "Paywake Founding User", "You were one of the <b>first 10,000 users</b> to join Paywake. Congratulations!")
        hasAwards = true
      }
      if (!hasAwards) {
        $("#awards-stat")[0].remove()
      }
      break;
    }
  }
  let totalScheduled = 0
  for (let item of HISTORY) {
    if (item.data.event === "SCHEDULE") {
      totalScheduled++
    }
  }
  $("#wakeup-count")[0].innerHTML = numberWithCommas(totalScheduled)
  let totalEarned = 0
  for (let item of HISTORY) {
    if (item.data.event === "PAID") {
      totalEarned += parseInt(item.data.data.amount)
    }
  }
  $("#account-earned")[0].innerHTML = numberWithCommas(Math.floor(totalEarned / 100))
  $("#account-earned-cents")[0].innerHTML = ("." + (totalEarned - (Math.floor(totalEarned / 100) * 100)).toString().padStart(2, "0"))
  $("#account-id")[0].innerHTML = (USER.username.toString().trim())
  genWakeups()
}

const setName = () => {
  if (!localStorage.getItem(LOCAL_STORAGE_TAG + "name")) {
    localStorage.setItem(LOCAL_STORAGE_TAG + "name", USER.signInUserSession.idToken.payload.name)
  }
  $("#account-name")[0].value = localStorage.getItem(LOCAL_STORAGE_TAG + "name").trim()
}

const updateName = (obj) => {
  const name = obj.value.substring(0,65)
  if (name.length) {
    if (name !== localStorage.getItem(LOCAL_STORAGE_TAG + "name")) {
      ROUTINES.name(name)
    }
  }
}

const genWakeups = () => {
  const container = document.getElementById("wakeup-container")
  container.innerHTML = ""
  $("#transfer-container")[0].innerHTML = ""
  const wakeups = []
  const wakeupIDs = []
  const verifies = []
  const payments = []
  const transfers = []
  HISTORY.sort((a,b) => {
    return (moment(b.time).diff(moment(a.time)))
  })
  for (let item of HISTORY) {
    if (item.data.event === "SCHEDULE") {
      if (!wakeupIDs.includes(item.data.data.id)) {
        item.data.data.events = []
        wakeups.push(item.data.data)
        wakeupIDs.push(item.data.data.id)
      }
    }
    else if (item.data.event === "VERIFY") {
      verifies.push(item.data.data.id)
    }
    else if (item.data.event === "PAID") {
      payments.push(item.data.data)
    }
    else if (item.data.event === "TRANSFER") {
      if (item.data.data.success) {
        transfers.push(item)
      }
    }
  }
  for (let id of verifies) {
    try {
      wakeups[wakeupIDs.indexOf(id)].verified = true
    } catch (e) {}
  }
  for (let payment of payments) {
    try {
      wakeups[wakeupIDs.indexOf(payment.id)].paid = payment.amount
    } catch (e) {}
  }
  for (let item of HISTORY) {
    if (item.data.event === "SCHEDULE" || item.data.event === "CANCEL" || item.data.event === "VERIFY" || item.data.event === "PAID" || item.data.event === "CHARGED") {
      try {
        const id = item.data.data.id
        if (!wakeups[wakeupIDs.indexOf(id)].events) {
          wakeups[wakeupIDs.indexOf(id)].events = []
        }
        wakeups[wakeupIDs.indexOf(id)].events.push(item)
      } catch (e) {}
    }
  }
  wakeups.sort((a,b) => {
    return (b.day - a.day)
  })
  transfers.sort((a,b) => {
    return (moment(b.time).diff(moment(a.time)))
  })
  for (const wakeup of wakeups) {
    wakeup.events.sort((a,b) => {
      return (moment(b.time).diff(moment(a.time)))
    })
    for (let ev of wakeup.events) {
      if (ev.data.event === "SCHEDULE") {
        wakeup.canceled = false;
        break;
      }
      if (ev.data.event === "CANCEL") {
        wakeup.canceled = true;
        wakeup.cancelFee = ev.data.data.fee;
        break;
      }
    }

    const deposit = (wakeup.deposit / 100).toString()
    const m = moment.tz(EPOCH, TIME_ZONE).add(wakeup.day, "days").add(Math.floor(wakeup.time / 60), "hours").add(wakeup.time % 60, "minutes").tz(LOCAL_TIME_ZONE)
    const hour = m.format("h")
    const minute = m.format("mm")
    const date = m.format("MMMM Do")
    const ampm = m.format("a").toLowerCase()
    const fromNow = m.fromNow()
    const missed = ((m.add(3, "minutes").add(10, "seconds").diff(moment()) < 0) && !wakeup.verified)

    let parent = document.createElement("div")
    parent.id = ("wakeup-" + wakeup.id)
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
    else if (wakeup.canceled) {
      p.innerHTML = (date + " &#8212; <b class='canceled'>Canceled</b>")
      button.src = "assets/images/failed.png"
      button.className = "canceled"
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
    const node = parent.cloneNode(true)
    cancel.appendChild(button)
    parent.appendChild(cancel)
    container.appendChild(parent)

    if (wakeup.verified) {
      button.onclick = () => {
        verifiedClick(node, wakeup)
      }
      p.querySelector("b").onclick = button.onclick
      depositBox.onclick = button.onclick
    }
    else if (wakeup.canceled) {
      button.onclick = () => {
        canceledClick(node, wakeup)
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
        cancelWakeup(wakeup, node)
      }
    }

    let eventsContainer = document.createElement("div")
    eventsContainer.className = "events-container"
    let divider = document.createElement("div")
    divider.className = "wakeup-divider"
    for (let ev of wakeup.events) {
      let p = document.createElement("p")
      p.className = "wakeup-event"
      let pText = ("<b>" + moment(ev.time).format("MM/DD/YYYY") + " @ " + moment(ev.time).format("h:mma") + "</b> &mdash; ")
      if (ev.data.event === "SCHEDULE") {
        pText += "Scheduled"
      }
      else if (ev.data.event === "CANCEL") {
        pText += ("Canceled, balance -$" + balanceToString(ev.data.data.fee))
      }
      else if (ev.data.event === "VERIFY") {
        pText += "Verified"
      }
      else if (ev.data.event === "PAID") {
        pText += ("Paid, balance +$" + balanceToString(ev.data.data.amount))
      }
      else if (ev.data.event === "CHARGED") {
        pText += ("Missed, card charged $" + balanceToString(ev.data.data.amount))
      }
      p.innerHTML = pText
      eventsContainer.appendChild(p)
    }

    container.appendChild(eventsContainer)
    container.appendChild(divider)
  }
  if (!wakeups.length) {
    let p = document.createElement("p")
    p.innerHTML = "Nothing to see here. <a class='gradient' href='./schedule'>Schedule yours</a>"
    container.appendChild(p)
  }
  else {
    $("#wakeup-container")[0].childNodes[$("#wakeup-container")[0].childNodes.length - 1].remove()
  }
  for (let transfer of transfers) {
    if (!transfer.data.data.type) {
      transfer.data.data.type = ("BANK")
    }
    let p = document.createElement("p")
    p.className = "transfer-event"
    let pText = ("<b>" + moment(transfer.time).format("MM/DD/YYYY") + " @ " + moment(transfer.time).format("h:mma") + "</b> &mdash; ")
    if (transfer.data.data.type === "BANK") {
      pText += (
        "$" +
        balanceToString(parseInt(transfer.data.data.amount)) +
        " transferred to " +
        transfer.data.data.bankName +
        " " +
        (
          transfer.data.data.accountType
          .replace("personalChecking","Personal Checking")
          .replace("personalSavings","Personal Savings")
          .replace("businessChecking","Business Checking")
          .replace("businessSavings","Business Savings")
        ) +
        " " +
        transfer.data.data.last4.toString() +
        "&nbsp; <span class='transfer-id'>" +
        transfer.data.data.id +
        "</span>" +
        " <span class='transfer-status " +
        (transfer.data.data.status || "pending") +
        "'>" +
        (transfer.data.data.status || "pending").replace("failed", "Failed, Balance Refunded").replace("sent", "Complete") +
        "</span>"
      )
    }
    else {
      pText += ("$" + balanceToString(parseInt(transfer.data.data.amount) - 25) + " to transferred Venmo account <span class='transfer-id'>" + transfer.data.data.id + "</span>")
    }
    p.innerHTML = pText
    const pSpan = p.querySelector("span")
    pSpan.onclick = () => {
      selectID(pSpan)
    }
    $("#transfer-container")[0].appendChild(p)
    if ((transfer.data.data.status || "pending") === "pending" && transfer.data.data.success) {
      fetchTransferStatus(transfer)
    }
  }
  if (!transfers.length) {
    let p = document.createElement("p")
    p.id = "transfer-empty"
    p.innerHTML = "Nothing to see here. <a class='gradient' href='./transfer'>Make a transfer</a>"
    $("#transfer-container")[0].appendChild(p)
  }
}

const verifiedClick = (node, wakeup) => {
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
  text.innerHTML = ("You successfully verified this wakeup and your deposit was refunded (you were not charged).")
  if (wakeup.paid) {
    text.innerHTML = ("You successfully verified this wakeup, your deposit was refunded, and you were paid $" + (Math.floor(wakeup.paid / 100).toString() + "." + (wakeup.paid - (Math.floor(wakeup.paid / 100) * 100)).toString().padStart(2, "0")) + " to your Paywake balance.")
  }
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

const canceledClick = (node, wakeup) => {
  let elements = []
  let center = document.createElement("div")
  center.className = "center"
  let img = document.createElement("img")
  img.src = "assets/images/failed.png"
  img.style.opacity = (0.4)
  center.appendChild(img)
  let title = document.createElement("h3")
  title.className = "center"
  title.innerHTML = "Wakeup Canceled"
  title.style.marginBottom = "24px"
  let text = document.createElement("p")
  text.innerHTML = ("You canceled this wakeup and a fee of $" + (Math.floor(wakeup.cancelFee / 100).toString() + "." + (wakeup.cancelFee - (Math.floor(wakeup.cancelFee / 100) * 100)).toString().padStart(2, "0")) + " was deducted from your Paywake balance.")
  let b = node.querySelector("b")
  b.onclick = () => {}
  b.style.cursor = "default"
  elements.push(center)
  elements.push(title)
  elements.push(node)
  elements.push(text)
  MODAL.display(elements)
}

const balanceToString = (balance = BALANCE) => {
  return Math.floor(balance / 100).toString() + "." + (balance % 100).toString().padStart(2, "0")
}

const selectID = (obj) => {
  const newSelection = obj
  const selection = window.getSelection()
  const range = document.createRange()
  range.setStartBefore(newSelection)
  range.setEndAfter(newSelection)
  selection.removeAllRanges()
  selection.addRange(range)
  document.execCommand("copy")
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

const numberWithCommas = (n) => {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

const setTransferStatus = (transfer, data) => {
  const ORIGINAL_STATUS = transfer.data.data.status
  for (let index in FLAT_HISTORY) {
    if (FLAT_HISTORY[index].data.data.event === "TRANSFER") {
      if (FLAT_HISTORY[index].data.data.id === transfer.data.data.id) {
        FLAT_HISTORY[index].data.data.status = data.status
      }
    }
  }
  setHistory(FLAT_HISTORY)
  if (data.status === "failed") {
    fetchBalance()
  }
  if (data.status !== ORIGINAL_STATUS) {
    fetchHistory()
  }
}

let FETCHED_TRANSFER_STATUSES = []
const fetchTransferStatus = (transfer) => {
  if (!FETCHED_TRANSFER_STATUSES.includes(transfer.data.data.id)) {
    FETCHED_TRANSFER_STATUSES.push(transfer.data.data.id)
    $.ajax({
      url: (API + "/transferStatus"),
      type: "PUT",
      xhrFields: {
        withCredentials: true
      },
      beforeSend: (xhr) => {
        xhr.setRequestHeader("Authorization", ID_TOKEN)
      },
      data: {
        data: JSON.stringify(transfer.data),
        id: transfer.id,
        time: transfer.time,
      },
      success: (data) => {
        setTimeout(() => {
          setTransferStatus(transfer, data)
        }, 300)
      }
    })
  }
}
