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
      data = data.sort((a, b) => {
        return (a.day - b.day)
      })
      localStorage.setItem(LOCAL_STORAGE_TAG + "wakeups", JSON.stringify(data))
      __worker2x()
    }
  })
}

fetchWakeups()
