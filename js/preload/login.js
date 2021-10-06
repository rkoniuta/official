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

const phoneNumberDoesntExist = () => {
  document.getElementById("message").innerHTML = "No account exists with that phone number."
  document.getElementById("phone").setAttribute("invalid", "true")
}

const incorrectPassword = () => {
  document.getElementById("message").innerHTML = "Incorrect password."
  document.getElementById("password").setAttribute("invalid", "true")
}

const login = (obj) => {
  const phoneInput = document.getElementById("phone")
  const passwordInput = document.getElementById("password")
  if (verifyPhone(phoneInput) && verifyPassword(passwordInput)) {
    const phone = ("+1" + cleanPhone(phoneInput.value))
    const password = passwordInput.value
    $(obj).addClass("loading")
    ROUTINES.login(phone, password, (err) => {
      $(obj).removeClass("loading")
      if (err) {
        if (err.code === "UserNotFoundException") {
          phoneNumberDoesntExist()
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
