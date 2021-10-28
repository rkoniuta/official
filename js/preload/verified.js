const fetchWakeups = () => {
  $.ajax({
    url: (API + "/wakeups"),
    type: "GET",
    xhrFields: {
      withCredentials: true
    },
    beforeSend: (xhr) => {
      xhr.setRequestHeader("Authorization", ID_TOKEN)
    },
    success: (data) => {
      processWakeups(data.wakeups)
    }
  })
}

const processWakeups = (wakeups) => {
  for (let wakeup of wakeups) {
    if (wakeup.verified) {
      const ID = wakeup.id
      leavePage("./dashboard", ["verified", ID])
    }
  }
}

fetchWakeups()
