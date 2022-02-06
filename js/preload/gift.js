const fetchWakeups = () => {
  $.ajax({
    url: (API + "/history"),
    type: "GET",
    xhrFields: {
      withCredentials: true
    },
    beforeSend: (xhr) => {
      xhr.setRequestHeader("Authorization", ID_TOKEN)
    },
    success: (data) => {
      data = data.history
      localStorage.setItem(LOCAL_STORAGE_TAG + "history", JSON.stringify(data))
      const kill2XMode = () => {
        if (localStorage.getItem(LOCAL_STORAGE_TAG + "2x-mode") === "true") {
          localStorage.setItem(LOCAL_STORAGE_TAG + "2x-mode", "false")
          window.location.reload()
        }
      }
      const url = new URL(window.location.href)
      const HISTORY = JSON.parse(localStorage.getItem(LOCAL_STORAGE_TAG + "history") || "[]")
      HISTORY.sort((a,b) => {
        return (moment(b.time).diff(moment(a.time)))
      })
      const wakeups = []
      const wakeupIDs = []
      const verifies = []
      const set2xs = []
      for (let item of HISTORY) {
        if (item.data.event === "SCHEDULE") {
          if (!wakeupIDs.includes(item.data.data.id)) {
            item.data.data.events = []
            item.data.data.verified = false
            item.data.data.day = JSON.parse(item.data.data.day)
            wakeups.push(item.data.data)
            wakeupIDs.push(item.data.data.id)
          }
        }
        else if (item.data.event === "VERIFY") {
          verifies.push(item.data.data.id)
        }
        else if (item.data.event === "SET2X") {
          set2xs.push(item.data.data.id)
        }
      }
      for (let id of verifies) {
        try {
          wakeups[wakeupIDs.indexOf(id)].verified = true
        } catch (e) {}
      }
      for (let id of set2xs) {
        try {
          wakeups[wakeupIDs.indexOf(id)].is2x = true
        } catch (e) {}
      }
      for (let item of HISTORY) {
        if (item.data.event === "SCHEDULE" || item.data.event === "CANCEL" || item.data.event === "VERIFY" || item.data.event === "PAID" || item.data.event === "CHARGED") {
          try {
            const id = item.data.data.id
            if (!wakeups[wakeupIDs.indexOf(id)].events) {
              wakeups[wakeupIDs.indexOf(id)].events = []
            }
            wakeups[wakeupIDs.indexOf(id)].events.push(item)
          } catch (e) {}
        }
      }
      for (const wakeup of wakeups) {
        wakeup.events.sort((a,b) => {
          return (moment(b.time).diff(moment(a.time)))
        })
        for (let ev of wakeup.events) {
          if (ev.data.event === "SCHEDULE") {
            wakeup.canceled = false;
            break;
          }
          if (ev.data.event === "CANCEL") {
            wakeup.canceled = true;
            wakeup.cancelFee = ev.data.data.fee;
            break;
          }
        }
      }
      wakeups.sort((a,b) => {
        return (b.day - a.day)
      })
      const LOCAL_TIME_ZONE = moment.tz.guess()
      const TODAY = moment().tz(TIME_ZONE).diff(moment.tz(EPOCH, TIME_ZONE).hour(0).minute(0).second(0), "days")
      let WAKEUP = null
      if (wakeups.length) {
        for (wakeup of wakeups) {
          if (wakeup.verified) {
            kill2XMode()
            return;
          }
          if ((wakeup.day === TODAY || wakeup.day === (TODAY - 1)) && !wakeup.canceled) {
            WAKEUP = wakeup
          }
        }
        if (WAKEUP) {
          const time = moment.tz(EPOCH, TIME_ZONE).add(WAKEUP.day, "days").add(Math.floor(WAKEUP.time / 60), "hours").add(WAKEUP.time % 60, "minutes").add(3, "minutes").tz(LOCAL_TIME_ZONE)
          const diff = Math.floor(time.diff(moment()) / 1000)
          if (diff < 0 && diff > (-86401) && !WAKEUP.verified) {
            localStorage.setItem(LOCAL_STORAGE_TAG + "2x-mode", "true")
            localStorage.setItem(LOCAL_STORAGE_TAG + "stale", "true")
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
          else {
            kill2XMode()
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
  })
}

fetchWakeups()
