const MODAL = {
  visible: false,
  show: () => {
    if (!MODAL.visible) {
      MODAL.visible = true
      const backdrop = document.getElementById("__modal-backdrop")
      const container = document.getElementById("__modal-container")
      backdrop.className = "on"
      $(container).addClass("visible")
      setTimeout(() => {
        $(backdrop).addClass("visible")
      }, 50)
    }
  },
  hide: () => {
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
  },
  setContent: (elements = []) => {
    const modal = document.getElementById("__modal")
    modal.innerHTML = ""
    for (let element of elements) {
      modal.appendChild(element)
    }
    if (!document.getElementById("__modal-dismiss")) {
      MODAL.addDismiss()
    }
  },
  setHTML: (html = "") => {
    const modal = document.getElementById("__modal")
    modal.innerHTML = html
    if (!document.getElementById("__modal-dismiss")) {
      MODAL.addDismiss()
    }
  },
  addDismiss: () => {
    const modal = document.getElementById("__modal")
    let group = document.createElement("div")
    group.className = "center"
    let dismiss = document.createElement("button")
    dismiss.className = "transparent"
    dismiss.innerHTML = "Dismiss"
    dismiss.id = "__modal-dismiss"
    dismiss.onclick = () => {
      MODAL.hide()
    }
    group.appendChild(dismiss)
    modal.appendChild(group)
  },
  display: (elements = []) => {
    MODAL.setContent(elements)
    MODAL.show()
  },
  displayHTML: (html = "") => {
    MODAL.setHTML(html)
    MODAL.show()
  }
}

$(window).on("load", () => {
  let container = document.createElement("div")
  container.id = "__modal-container"
  let modal = document.createElement("div")
  modal.id = "__modal"
  container.appendChild(modal)
  let backdrop = document.createElement("div")
  backdrop.id = "__modal-backdrop"
  backdrop.onclick = () => {
    MODAL.hide()
  }
  document.body.appendChild(backdrop)
  document.body.appendChild(container)
})
