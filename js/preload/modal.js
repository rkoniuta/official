const MODAL = {
  visible: false,
  show: () => {
    if (!MODAL.visible) {
      MODAL.visible = true
      const backdrop = document.getElementById("__modal-backdrop")
      const container = document.getElementById("__modal-container")
      backdrop.className = "on"
      setTimeout(() => {
        $(backdrop).addClass("visible")
        container.style.top = (Math.ceil(window.innerHeight - container.offsetHeight).toString() + "px")
      }, 50)
    }
  },
  hide: () => {
    if (MODAL.visible) {
      MODAL.visible = false
      const backdrop = document.getElementById("__modal-backdrop")
      const container = document.getElementById("__modal-container")
      $(backdrop).removeClass("visible")
      container.style.top = ""
      setTimeout(() => {
        backdrop.className = ""
      }, 650)
    }
  },
  setContent: (elements = []) => {
    const modal = document.getElementById("__modal")
    modal.innerHTML = ""
    for (let element of elements) {
      modal.appendChild(element)
    }
  },
  setHTML: (html = "") => {
    const modal = document.getElementById("__modal")
    modal.innerHTML = html
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
