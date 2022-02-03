const __worker2x = () => {
  const kill2XMode = () => {
    if (localStorage.getItem(LOCAL_STORAGE_TAG + "2x-mode") === "true") {
      localStorage.setItem(LOCAL_STORAGE_TAG + "2x-mode", "false")
      window.location.reload()
    }
  }
  const url = new URL(window.location.href)
  let wakeups = (JSON.parse(localStorage.getItem(LOCAL_STORAGE_TAG + "wakeups")) || [])
  const LOCAL_TIME_ZONE = moment.tz.guess()
  const TODAY = moment().tz(TIME_ZONE).diff(moment.tz(EPOCH, TIME_ZONE).hour(0).minute(0).second(0), "days")
  wakeups.sort((a,b) => {
    return (b.day - a.day)
  })
  let WAKEUP = null
  if (wakeups.length) {
    for (wakeup of wakeups) {
      if (wakeup.verified) {
        kill2XMode()
        return;
      }
      if (wakeup.day === TODAY || wakeup.day === (TODAY - 1)) {
        WAKEUP = wakeup
      }
    }
    if (WAKEUP) {
      const time = moment.tz(EPOCH, TIME_ZONE).add(WAKEUP.day, "days").add(Math.floor(WAKEUP.time / 60), "hours").add(WAKEUP.time % 60, "minutes").add(3, "minutes").tz(LOCAL_TIME_ZONE)
      const diff = Math.floor(time.diff(moment()) / 1000)
      if (diff < 0 && !WAKEUP.verified && localStorage.getItem(LOCAL_STORAGE_TAG + "2x-mode") !== "true") {
        localStorage.setItem(LOCAL_STORAGE_TAG + "2x-mode", "true")
        let hitFlag = false
        const onComplete = () => {
          url.searchParams.set(NOTIFICATION_STRING_2X, true)
          url.searchParams.set("id", encodeURIComponent(WAKEUP.id))
          localStorage.setItem(LOCAL_STORAGE_TAG + "2x-day", (WAKEUP.day + 1).toString())
          leavePage("./dashboard?" + url.searchParams.toString())
        }
        for (wakeup of wakeups) {
          if (wakeup.day === (WAKEUP.day + 1) && !wakeup.verified && !wakeup.is2x) {
            hitFlag = true
            $.ajax({
              url: (API + "/set2xwakeup"),
              type: "PUT",
              data: {
                id: wakeup.id
              },
              xhrFields: {
                withCredentials: true
              },
              beforeSend: (xhr) => {
                xhr.setRequestHeader("Authorization", ID_TOKEN)
              },
              success: onComplete,
              error: onComplete,
            })
            break;
          }
        }
        if (!hitFlag) {
          onComplete()
        }
      }
    }
    else {
      kill2XMode()
    }
  }
  else {
    kill2XMode()
  }
}

__worker2x()
