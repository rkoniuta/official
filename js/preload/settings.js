let HISTORY = []

const logout = () => {
  ROUTINES.logout()
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
    elements.push(center)
    elements.push(title)
    elements.push(text)
    MODAL.display(elements)
  }
  $("#user-number")[0].appendChild(award)
}

const setHistory = (data) => {
  localStorage.setItem(LOCAL_STORAGE_TAG + "history", JSON.stringify(data))
  HISTORY = data
  for (let item of HISTORY) {
    if (item.data.event === "BIRTH") {
      $("#user-number")[0].innerHTML = item.data.data.userNumber.toString()
      $("#account-birthday")[0].innerHTML = moment(item.time).format("MMMM DDDo, YYYY")
      if (item.data.data.userNumber < (DIAMOND_USER_THRESHOLD + 1)) {
        addAward("assets/images/award-4.png", "Paywake Diamond User", "You were one of the <b>first 100 users</b> to join Paywake. From all of us on the development team, thanks for helping make Paywake what it is today.")
      }
      if (item.data.data.userNumber < (PIONEER_USER_THRESHOLD + 1)) {
        addAward("assets/images/award-3.png", "Paywake Pioneer User", "You were one of the <b>first 1,000 users</b> to join Paywake. Congratulations!")
      }
      if (item.data.data.userNumber < (FOUNDING_USER_THRESHOLD + 1)) {
        addAward("assets/images/award.png", "Paywake Founding User", "You were one of the <b>first 10,000 users</b> to join Paywake.")
      }
    }
  }
  let totalScheduled = 0
  for (let item of HISTORY) {
    if (item.data.event === "SCHEDULE") {
      totalScheduled++
    }
  }
  if (totalScheduled === 1) {
    $("#wakeup-count")[0].innerHTML = ("1 wakeup")
  }
  else {
    $("#wakeup-count")[0].innerHTML = (totalScheduled.toString() + " wakeups")
  }
  let totalEarned = 0
  for (let item of HISTORY) {
    if (item.data.event === "PAID") {
      totalEarned += parseInt(item.data.data.amount)
    }
  }
  $("#account-earned")[0].innerHTML = (Math.floor(totalEarned / 100).toString() + "." + (totalEarned - (Math.floor(totalEarned / 100) * 100)).toString().padStart(2, "0"))
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
