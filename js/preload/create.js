const CREATION_DELAY_MS = 500

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

const setScreen = (n) => {
  SCREEN = n
  for (let i = 0; i < SCREEN; i++) {
    $("#screen-" + i.toString()).addClass("unloaded top")
  }
  $("#screen-" + SCREEN.toString()).removeClass("unloaded top bottom")
  for (let i = SCREEN + 1; i < SCREENS; i++) {
    $("#screen-" + i.toString()).addClass("unloaded bottom")
  }
  if (SCREEN > 3) {
    localStorage.setItem("__paywake-screen", SCREEN.toString())
  }
  setTimeout(() => {
    try {
      $("#screen-" + SCREEN.toString() + "-input")[0].focus()
    } catch (e) {}
  })
}

const nextScreen = () => {
  if (SCREEN < (SCREENS - 1)) {
    const go = () => {
      setScreen(SCREEN + 1)
    }
    if (SCREEN === 0) {
      if (verifyName(document.getElementById("screen-0-input"))) {
        go()
      }
    }
    else if (SCREEN === 1) {
      if (verifyPhone(document.getElementById("screen-1-input"))) {
        go()
      }
    }
    else {
      go()
    }
  }
}

const previousScreen = () => {
  if (SCREEN > 0) {
    setScreen(SCREEN - 1)
  }
}

const phoneNumberExists = () => {
  document.getElementById("subtext-1").innerHTML = "An account exists with this phone number."
  document.getElementById("screen-1-input").setAttribute("invalid", "true")
  setScreen(1)
}

const unknownError = () => {
  document.getElementById("subtext-2").innerHTML = "Your account cannot be created at this time."
  document.getElementById("screen-2-input").setAttribute("invalid", "true")
  setScreen(2)
}

const createAccount = () => {
  if (!verifyName(document.getElementById("screen-0-input"))) {
    setScreen(0)
  }
  else if (!verifyPhone(document.getElementById("screen-1-input"))) {
    setScreen(1)
  }
  if (verifyPassword(document.getElementById("screen-2-input"))) {
    const name = cleanPhone(document.getElementById("screen-0-input").value)
    const phone = ("+1" + cleanPhone(document.getElementById("screen-1-input").value))
    const password = document.getElementById("screen-2-input").value
    setScreen(3)
    setTimeout(() => {
      ROUTINES.signup(name, phone, password, (err) => {
        if (err) {
          if (err.code === "UsernameExistsException") {
            phoneNumberExists()
          }
          else {
            unknownError()
          }
        }
        else {
          localStorage.setItem("__paywake-screen", (4).toString())
          setTimeout(() => {
            setScreen(4)
          },1)
        }
      })
    }, CREATION_DELAY_MS)
  }
}

const resend = () => {
  ROUTINES.resend(() => {
    $("#pre-resend").addClass("invisible")
    $("#post-resend").removeClass("invisible")
  })
}

const verify = () => {
  const codeInput = document.getElementById("screen-3-input")
  if (verifyCode(codeInput)) {
    const code = cleanPhone(codeInput.value)
    ROUTINES.verify(code, (err) => {
      if (err) {
        codeInput.placeholder = "Incorrect code."
        codeInput.setAttribute("invalid", "true")
        codeInput.value = ""
      }
      else {
        localStorage.setItem("__paywake-screen", (5).toString())
        ROUTINES.login(
          localStorage.getItem("__paywake-temp-username"),
          localStorage.getItem("__paywake-temp-password"),
          (err) => {
            localStorage.removeItem("__paywake-temp-username"),
            localStorage.removeItem("__paywake-temp-password")
            nextScreen()
          }
        )
      }
    })
  }
}

const verifyName = (obj) => {
  const name = cleanName(obj.value)
  if (name.length > 0) {
    obj.removeAttribute("invalid")
    return name
  }
  obj.setAttribute("invalid", "true")
  return false
}

const verifyPhone = (obj) => {
  const phone = cleanPhone(obj.value)
  if (phone.length === 10) {
    obj.removeAttribute("invalid")
    return phone
  }
  obj.setAttribute("invalid", "true")
  return false
}

const verifyPassword = (obj) => {
  const password = obj.value
  if (password.length > 7) {
    obj.removeAttribute("invalid")
    return password
  }
  obj.setAttribute("invalid", "true")
  return false
}

const verifyCode = (obj) => {
  const code = cleanPhone(obj.value)
  if (code.length === 6) {
    obj.removeAttribute("invalid")
    return code
  }
  obj.setAttribute("invalid", "true")
  return false
}

const toDashboard = () => {
  window.location.href = REDIRECTS.onAuth
}
