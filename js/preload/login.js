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

const verifyRecaptcha = () => {
  if (RECAPTCHA_TOKEN.length) {
    return RECAPTCHA_TOKEN
  }
  else {
    recaptchaError()
  }
  return false
}

const phoneNumberDoesntExist = () => {
  document.getElementById("message").innerHTML = "No account exists with that phone number."
  document.getElementById("phone").setAttribute("invalid", "true")
}

const incorrectPassword = () => {
  document.getElementById("message").innerHTML = "Incorrect password."
  document.getElementById("password").setAttribute("invalid", "true")
}

const recaptchaError = () => {
  document.getElementById("message").innerHTML = "Please complete the reCAPTCHA."
}

const login = (obj) => {
  const phoneInput = document.getElementById("phone")
  const passwordInput = document.getElementById("password")
  if (verifyPhone(phoneInput) && verifyPassword(passwordInput) && verifyRecaptcha()) {
    const phone = ("+1" + cleanPhone(phoneInput.value))
    const password = passwordInput.value
    $(obj).addClass("loading")
    ROUTINES.login(phone, password, RECAPTCHA_TOKEN, (err) => {
      $(obj).removeClass("loading")
      if (err) {
        if (err.code === "UserNotFoundException") {
          phoneNumberDoesntExist()
        }
        else if (err.code === "UserLambdaValidationException") {
          if (err.message === "PreAuthentication failed with error USER NOT FOUND.") {
            phoneNumberDoesntExist()
          }
          else {
            recaptchaError()
            if (verifyRecaptcha()) {
              window.location.reload()
            }
          }
        }
        else {
          incorrectPassword()
        }
      }
      else {
        window.location.href = REDIRECTS.onAuth
      }
    })
  }
}

let RECAPTCHA_TOKEN = null
const setRecaptchaToken = (token) => {
  RECAPTCHA_TOKEN = token
}

window.setRecaptchaToken = setRecaptchaToken
