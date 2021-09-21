const formatPhone = (value) => {
  if (!value) {
    return value
  }
  const number = value.replace(/[^\d]/g, "")
  const n = number.length
  if (n < 4) {
    return number
  }
  if (n < 7) {
    return `(${number.slice(0, 3)}) ${number.slice(3)}`
  }
  return `(${number.slice(0, 3)}) ${number.slice(3,6)}-${number.slice(6, 10)}`
}

const phoneFormatter = (obj) => {
  const value = formatPhone(obj.value)
  obj.value = value
}

const codeFormatter = (obj) => {
  obj.value = obj.value.replace(/\D/g,'')
}

const SCREENS = 6
let SCREEN = 0

const nextScreen = () => {
  if (SCREEN < (SCREENS - 1)) {
    SCREEN++
    for (let i = 0; i < SCREEN; i++) {
      $("#screen-" + i.toString()).addClass("unloaded top")
    }
    $("#screen-" + SCREEN.toString()).removeClass("unloaded top bottom")
    for (let i = SCREEN + 1; i < SCREENS; i++) {
      $("#screen-" + i.toString()).addClass("unloaded bottom")
    }
    setTimeout(() => {
      try {
        $("#screen-" + SCREEN.toString() + "-input")[0].focus()
      } catch (e) {}
    })
  }
}

const previousScreen = () => {
  if (SCREEN > 0) {
    SCREEN--
    for (let i = 0; i < SCREEN; i++) {
      $("#screen-" + i.toString()).addClass("unloaded top")
    }
    $("#screen-" + SCREEN.toString()).removeClass("unloaded top bottom")
    for (let i = SCREEN + 1; i < SCREENS; i++) {
      $("#screen-" + i.toString()).addClass("unloaded bottom")
    }
  }
}
