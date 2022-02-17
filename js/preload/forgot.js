const CREATION_DELAY_MS = 500

const codeFormatter = (obj) => {
  obj.value = obj.value.replace(/\D/g,'')
}

const SCREENS = 4
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
  if (SCREEN > 0) {
    localStorage.setItem(LOCAL_STORAGE_TAG + "forgot-screen", SCREEN.toString())
  }
  setTimeout(() => {
    try {
      $("#screen-" + SCREEN.toString() + "-input")[0].focus()
    } catch (e) {}
  })
}

const nextScreen = () => {
  if (SCREEN < (SCREENS - 1)) {
    setScreen(SCREEN + 1)
  }
}

const previousScreen = () => {
  if (SCREEN > 0) {
    setScreen(SCREEN - 1)
  }
}

const sendCode = () => {
  const obj = document.getElementById("screen-0-input")
  if (verifyPhone(obj)) {
    const phone = ("+1" + cleanPhone(obj.value))
    $("#button-0").addClass("loading")
    ROUTINES.forgot(phone, (err) => {
      if (err) {
        obj.setAttribute("invalid", "true")
      }
      else {
        setTimeout(() => {
          $("#button-0").removeClass("loading")
          nextScreen()
        }, CODE_SEND_BUFFER)
      }
    })
  }
}

const resend = () => {
  const phone = ("+1" + cleanPhone(document.getElementById("screen-0-input").value))
  ROUTINES.forgot(phone, (err) => {
    $("#pre-resend").addClass("invisible")
    $("#post-resend").removeClass("invisible")
  })
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

const verifyCode = (obj) => {
  const code = cleanPhone(obj.value)
  if (code.length === 6) {
    obj.removeAttribute("invalid")
    return code
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

const toDashboard = () => {
  localStorage.removeItem(LOCAL_STORAGE_TAG + "forgot-screen")
  window.location.href = REDIRECTS.onAuth
}

const verify = () => {
  if (verifyCode(document.getElementById("screen-1-input"))) {
    nextScreen()
  }
}

const recaptchaError = () => {
  document.getElementById("subtext-2").innerHTML = "Please complete the reCAPTCHA."
}

const verifyRecaptcha = () => {
  if ((RECAPTCHA_TOKEN || "").length) {
    return RECAPTCHA_TOKEN
  }
  else {
    recaptchaError()
  }
  return false
}

const updatePassword = () => {
  const codeInput = document.getElementById("screen-1-input")
  if (verifyPassword(document.getElementById("screen-2-input")) && verifyRecaptcha()) {
    const phone = ("+1" + cleanPhone(document.getElementById("screen-0-input").value))
    const code = codeInput.value
    const password = document.getElementById("screen-2-input").value
    localStorage.setItem(LOCAL_STORAGE_TAG + "temp-username", phone)
    localStorage.setItem(LOCAL_STORAGE_TAG + "temp-password", password)
    $("#button-2").addClass("loading")
    ROUTINES.update(phone, code, password, (err) => {
      if (err) {
        $("#button-2").removeClass("loading")
        codeInput.placeholder = "Incorrect code."
        codeInput.setAttribute("invalid", "true")
        codeInput.value = ""
        previousScreen()
        grecaptcha.reset()
        RECAPTCHA_TOKEN = null
      }
      else {
        ROUTINES.login(
          localStorage.getItem(LOCAL_STORAGE_TAG + "temp-username"),
          localStorage.getItem(LOCAL_STORAGE_TAG + "temp-password"),
          RECAPTCHA_TOKEN,
          (err) => {
            $("#button-2").removeClass("loading")
            localStorage.removeItem(LOCAL_STORAGE_TAG + "temp-username")
            localStorage.removeItem(LOCAL_STORAGE_TAG + "temp-password")
            nextScreen()
          }
        )
      }
    })
  }
}

let RECAPTCHA_TOKEN = null
const setRecaptchaToken = (token) => {
  RECAPTCHA_TOKEN = token
}

window.setRecaptchaToken = setRecaptchaToken
