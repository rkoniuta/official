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

const login = () => {

}
