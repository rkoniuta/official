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

const setHistory = (data) => {
  localStorage.setItem(LOCAL_STORAGE_TAG + "history", JSON.stringify(data))
  HISTORY = data
  for (let item of HISTORY) {
    if (item.data.event === "BIRTH") {
      $("#user-number")[0].innerHTML = item.data.data.userNumber.toString()
      $("#account-birthday")[0].innerHTML = moment(item.time).format("MMMM DDDo, YYYY")
      if (item.data.data.userNumber < (EARLY_USER_THRESHOLD + 1)) {
        const award = document.createElement("img")
        award.src = "./assets/images/award.png"
        award.id = "award-icon"
        award.onclick = () => {
          let elements = []
          let center = document.createElement("div")
          center.className = "center"
          let img = document.createElement("img")
          img.src = "assets/images/award.png"
          center.appendChild(img)
          let title = document.createElement("h3")
          title.className = "center"
          title.innerHTML = "Paywake Founding User"
          title.style.marginBottom = "24px"
          let text = document.createElement("p")
          text.innerHTML = ("You were one of the first 10,000 users to join Paywake.")
          elements.push(center)
          elements.push(title)
          elements.push(text)
          MODAL.display(elements)
        }
        $("#user-number")[0].appendChild(award)
      }
    }
  }
  let totalScheduled = 0
  for (let item of HISTORY) {
    if (item.data.event === "SCHEDULE") {
      totalScheduled++
    }
  }
  $("#wakeup-count")[0].innerHTML = totalScheduled.toString()
  let totalEarned = 0
  for (let item of HISTORY) {
    if (item.data.event === "PAID") {
      totalEarned += parseInt(item.data.data.amount)
    }
  }
  $("#account-earned")[0].innerHTML = (Math.floor(totalEarned / 100).toString() + "." + (totalEarned - (Math.floor(totalEarned / 100) * 100)).toString().padStart(2, "0"))
}

const setName = () => {
  $("#account-name")[0].value = (USER.signInUserSession.idToken.payload.name)
}
