const FEEDBACK = {
  container: false,
  mount: (root) => {
    const container = document.createElement("div")
    container.id = "__FEEDBACK-container"
    const line = document.createElement("div")
    line.id = "__FEEDBACK-line"
    container.appendChild(line)
    const h3 = document.createElement("h3")
    h3.innerHTML = "How are you liking Paywake?"
    container.appendChild(h3)
    const buttons = document.createElement("div")
    buttons.id = "__FEEDBACK-buttons"
    container.appendChild(buttons)
    const onclicks = [
      () => {
        FEEDBACK.negative(2)
      },
      () => {
        FEEDBACK.negative(1)
      },
      () => {
        FEEDBACK.positive(1)
      },
      () => {
        FEEDBACK.positive(2)
      },
    ]
    for (let i = 0; i < 4; i++) {
      const img = document.createElement("img")
      img.src = ("assets/images/feedback-emoji-" + i.toString() + ".png")
      img.onclick = onclicks[i]
      buttons.appendChild(img)
    }
    root.appendChild(container)
    FEEDBACK.container = container
  },
  negative: (factor = 1) => {
    MODAL.hide()
    const h3 = document.createElement("h3")
    h3.innerHTML = "We're sorry to hear that."
    h3.id = "__FEEDBACK-sorry"
    const input = document.createElement("textarea")
    input.placeholder = "How can we improve?"
    input.id = "__FEEDBACK-sorry-input"
    input.maxLength = 500
    let group = document.createElement("div")
    group.className = "button-group"
    let goback = document.createElement("button")
    goback.innerHTML = "Dismiss"
    goback.className = "transparent"
    let confirm = document.createElement("button")
    confirm.innerHTML = "Submit"
    confirm.id = "__modal-dismiss"
    group.appendChild(goback)
    group.appendChild(confirm)
    goback.onclick = () => {
      FEEDBACK.loading()
      MODAL.hide()
      FEEDBACK.put((factor * (-1)), "", () => {
        FEEDBACK.thanks()
      })
    }
    confirm.onclick = () => {
      FEEDBACK.loading()
      MODAL.hide()
      FEEDBACK.put((factor * (-1)), input.value, () => {
        FEEDBACK.thanks()
      })
    }
    MODAL.display([
      h3,
      input,
      group,
    ])
  },
  positive: (factor = 1) => {
    FEEDBACK.loading()
    FEEDBACK.put(factor, "", () => {
      FEEDBACK.thanks()
    })
  },
  loading: () => {
    $(FEEDBACK.container).addClass("loading")
  },
  thanks: () => {
    const container = FEEDBACK.container
    if (container) {
      const h1 = document.createElement("h1")
      h1.innerHTML = "Thanks for your feedback!"
      const img = document.createElement("img")
      img.src = "assets/images/verified.png"
      h1.insertBefore(img, h1.firstChild)
      container.innerHTML = ""
      container.appendChild(h1)
      setTimeout(() => {
        $(container).removeClass("loading")
      },1)
    }
  },
  put: (factor, input, callback) => {
    $.ajax({
      url: (API + "/feedback"),
      type: "PUT",
      data: { factor, input },
      xhrFields: {
        withCredentials: true
      },
      beforeSend: (xhr) => {
        xhr.setRequestHeader("Authorization", ID_TOKEN)
      },
      success: (data) => {
        callback()
      },
      error: (data) => {
        callback()
      }
    })
  }
}
