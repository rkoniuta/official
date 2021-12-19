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
    FEEDBACK.loading()
    //TODO: Server stuff
    FEEDBACK.thanks()
  },
  positive: (factor = 1) => {
    FEEDBACK.loading()
    //TODO: Server stuff
    FEEDBACK.thanks()
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
      $(container).removeClass("loading")
      container.appendChild(h1)
    }
  },
}
