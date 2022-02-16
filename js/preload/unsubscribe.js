const verifyEmail = (obj) => {
  const email = obj.value.trim()
  if (email.length && email.includes("@") && email.includes(".")) {
    obj.removeAttribute("invalid")
    return email
  }
  obj.setAttribute("invalid", "true")
  return false
}

const unsubscribe = () => {
  const onComplete = () => {
    $(".splash")[0].innerHTML = "<h1 style='text-align:center;'>You've been unsubscribed.</h1><br><p style='text-align:center;'>You can close this window now.</p>"
  }
  if (verifyEmail($("#email")[0])) {
    $.ajax({
      url: (API + "/history"),
      type: "PUT",
      data: {
          email: $("#email")[0].value.trim(),
      },
      success: (data) => {
        onComplete()
      },
      error: (data) => {
        onComplete()
      }
    })
  }
}
