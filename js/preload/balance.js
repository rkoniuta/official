const setBalance = (balance = 0) => {
  localStorage.setItem(LOCAL_STORAGE_TAG + "balance", balance.toString())
  const dollars = Math.floor(balance / 100)
  const cents = Math.floor(balance % 100)
  document.getElementById("balance-dollars").innerHTML = dollars.toString()
  document.getElementById("balance-cents").innerHTML = ("." + cents.toString().padStart(2, "0"))
}

const fetchBalance = () => {
  $.ajax({
    url: (API + "/balance"),
    type: "GET",
    xhrFields: {
      withCredentials: true
    },
    beforeSend: (xhr) => {
      xhr.setRequestHeader("Authorization", ID_TOKEN)
    },
    success: (data) => {
      let local = localStorage.getItem(LOCAL_STORAGE_TAG + "balance")
      if (local !== null) {
        if ((parseInt(local) < data.balance) && data.balance !== 0) {
          gotPaid(data.balance - parseInt(local))
        }
      }
      setBalance(data.balance)
    }
  })
}

const gotPaid = (amount) => {
  const amountToString = (balance) => {
    return Math.floor(balance / 100).toString() + "." + (balance % 100).toString().padStart(2, "0")
  }
  const canvas = document.createElement("canvas")
  canvas.id = "__modal-canvas"
  const jsConfetti = new JSConfetti({canvas})
  let elements = []
  let center = document.createElement("div")
  center.className = "center"
  let img = document.createElement("img")
  img.src = "./assets/images/money.png"
  center.appendChild(img)
  let title = document.createElement("h3")
  title.className = "center"
  title.innerHTML = "You just got paid!"
  title.style.marginBottom = "24px"
  let text = document.createElement("p")
  text.innerHTML = ("We just added <b>$" + amountToString(amount) + "</b> to your Paywake balance for waking up on time today.")
  elements.push(center)
  elements.push(title)
  elements.push(text)
  elements.push(document.createElement("br"))
  let group = document.createElement("div")
  group.className = "button-group"
  let goback = document.createElement("button")
  goback.innerHTML = "Dismiss"
  goback.className = "transparent"
  let schedule = document.createElement("button")
  schedule.innerHTML = "Schedule Next Wakeup"
  schedule.className = "gradient"
  schedule.id = "__modal-dismiss"
  group.appendChild(goback)
  group.appendChild(schedule)
  elements.push(group)
  goback.onclick = () => {
    MODAL.hide()
  }
  schedule.onclick = () => {
    leavePage("./schedule")
  }
  canvas.onclick = () => {
    MODAL.hide()
  }
  document.body.appendChild(canvas)
  MODAL.display(elements)
  setTimeout(() => {
    jsConfetti.addConfetti({
      confettiColors: [
        "#6600FF",
        "#B20080",
        "#FF0000",
        "#FF6600",
        "#FFCC00",
      ],
      confettiRadius: 8,
      confettiNumber: 144,
    })
  }, 200)
}

let __AJAX_STACK = 0

const putAjaxLoader = () => {
  const loader = document.createElement("img")
  loader.src = ("./assets/images/loader-white.svg")
  loader.id = "__ajax-loader"
  try {
    $(".balance-container")[0].querySelector("h3").appendChild(loader)
  } catch (e) {}
}

const killAjaxLoader = () => {
  try {
    $("#__ajax-loader").remove()
  } catch (e) {}
}

$(document).ajaxStart(() => {
  if (__AJAX_STACK === 0) {
    putAjaxLoader()
  }
  __AJAX_STACK++;
})
$(document).ajaxComplete(() => {
  __AJAX_STACK--;
  setTimeout(() => {
    if (__AJAX_STACK < 1) {
      killAjaxLoader()
    }
  }, 300)
})
$(document).ajaxError(() => {
  __AJAX_STACK--;
  setTimeout(() => {
    if (__AJAX_STACK < 1) {
      killAjaxLoader()
    }
  }, 300)
})
