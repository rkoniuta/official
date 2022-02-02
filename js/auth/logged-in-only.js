const AUTH = () => {
  if (!SESSION) {
    window.location.href = REDIRECTS.noAuth
  }
}

(() => {
  let wakeups = JSON.parse(localStorage.getItem(LOCAL_STORAGE_TAG + "wakeups"))
  if (wakeups) {
    if (wakeups.length) {
      let WAKEUP = false
      const LOCAL_TIME_ZONE = moment.tz.guess()
      const TODAY = moment().tz(TIME_ZONE).diff(moment.tz(EPOCH, TIME_ZONE).hour(0).minute(0).second(0), "days")
      for (let w of wakeups) {
        if (w.day === TODAY) {
          WAKEUP = w
        }
      }
      if (WAKEUP) {
        if (!WAKEUP.verified) {
          const time = moment.tz(EPOCH, TIME_ZONE).add(WAKEUP.day, "days").add(Math.floor(WAKEUP.time / 60), "hours").add(WAKEUP.time % 60, "minutes").add(3, "minutes").tz(LOCAL_TIME_ZONE)
          const diff = Math.max(Math.floor(time.diff(moment()) / 1000), 0)
          if (diff > 0 && diff < ((60 * 3) + 2)) {
            if (!window.location.href.toString().includes("verify")) {
              leavePage("./verify")
            }
          }
        }
      }
    }
  }
})()
