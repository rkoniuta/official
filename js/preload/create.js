const CREATION_DELAY_MS = 500

const codeFormatter = (obj) => {
  obj.value = obj.value.replace(/\D/g,'')
}

const SCREENS = 7
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
    localStorage.setItem(LOCAL_STORAGE_TAG + "screen", SCREEN.toString())
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

const recaptchaError = () => {
  document.getElementById("subtext-2").innerHTML = "Please complete the recaptcha."
  setScreen(2)
}

const createAccount = () => {
  if (!verifyName(document.getElementById("screen-0-input"))) {
    setScreen(0)
    return;
  }
  else if (!verifyPhone(document.getElementById("screen-1-input"))) {
    setScreen(1)
    return;
  }
  else if (!RECAPTCHA_TOKEN) {
    recaptchaError()
    return;
  }
  else {
    document.getElementById("subtext-2").innerHTML = ""
  }
  if (verifyPassword(document.getElementById("screen-2-input"))) {
    const name = document.getElementById("screen-0-input").value
    const phone = ("+1" + cleanPhone(document.getElementById("screen-1-input").value))
    const password = document.getElementById("screen-2-input").value
    setScreen(3)
    setTimeout(() => {
      ROUTINES.signup(name, phone, password, RECAPTCHA_TOKEN, (err) => {
        if (err) {
          if (err.code === "UsernameExistsException") {
            phoneNumberExists()
          }
          else if (err.code === "UserLambdaValidationException") {
            grecaptcha.reset()
            recaptchaError()
          }
          else {
            unknownError()
          }
        }
        else {
          localStorage.setItem(LOCAL_STORAGE_TAG + "screen", (4).toString())
          setTimeout(() => {
            setScreen(4)
          }, CODE_SEND_BUFFER)
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

let isVerifying = false
const verify = () => {
  if (!isVerifying) {
    $("#verify-button").addClass("loading")
    const codeInput = document.getElementById("screen-3-input")
    if (verifyCode(codeInput)) {
      const code = cleanPhone(codeInput.value)
      isVerifying = true
      ROUTINES.verify(code, (err) => {
        $("#verify-button").removeClass("loading")
        if (err) {
          console.log(err)
          codeInput.placeholder = "Incorrect code."
          codeInput.setAttribute("invalid", "true")
          codeInput.value = ""
          isVerifying = false
        }
        else {
          const firstName = localStorage.getItem(LOCAL_STORAGE_TAG + "temp-name").split(" ")[0].trim()
          document.getElementById("first-name").innerHTML = (", " + firstName)
          localStorage.setItem(LOCAL_STORAGE_TAG + "screen", (6).toString())
          ROUTINES.login(
            localStorage.getItem(LOCAL_STORAGE_TAG + "temp-username"),
            localStorage.getItem(LOCAL_STORAGE_TAG + "temp-password"),
            RECAPTCHA_TOKEN,
            (err) => {
              if (err) {
                localStorage.setItem(LOCAL_STORAGE_TAG + "screen", (5).toString())
                setScreen(5)
              }
              else {
                localStorage.removeItem(LOCAL_STORAGE_TAG + "temp-username")
                localStorage.removeItem(LOCAL_STORAGE_TAG + "temp-password")
                setScreen(6)
              }
            }
          )
        }
      })
    }
  }
}

const verifyName = (obj) => {
  const name = obj.value
  if (name.length > 0 && name.length < 65) {
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
  localStorage.removeItem(LOCAL_STORAGE_TAG + "temp-name", name)
  leavePage("tutorial")
}

let RECAPTCHA_TOKEN = null
const setRecaptchaToken = (token) => {
  RECAPTCHA_TOKEN = token
}

const setRecaptchaTokenSecond = (token) => {
  RECAPTCHA_TOKEN = token
  localStorage.setItem(LOCAL_STORAGE_TAG + "screen", (6).toString())
  ROUTINES.login(
    localStorage.getItem(LOCAL_STORAGE_TAG + "temp-username"),
    localStorage.getItem(LOCAL_STORAGE_TAG + "temp-password"),
    RECAPTCHA_TOKEN,
    (err) => {
      if (err) {
        localStorage.setItem(LOCAL_STORAGE_TAG + "screen", (5).toString())
        setScreen(5)
      }
      else {
        localStorage.removeItem(LOCAL_STORAGE_TAG + "temp-username")
        localStorage.removeItem(LOCAL_STORAGE_TAG + "temp-password")
        setScreen(6)
      }
    }
  )
}

window.setRecaptchaTokenSecond = setRecaptchaTokenSecond
window.setRecaptchaToken = setRecaptchaToken
