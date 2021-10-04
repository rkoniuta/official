(() => {

  //TOGGLE THIS ON LAUNCH
  const IS_REDIRECTING = true

  const REDIRECT = "https://launch.paywake.net"
  const QR_REDIRECT = "https://launch.paywake.net/?source=qr"
  const LOCAL_STORAGE_TAG = "__paywake-dev"

  const SOURCE = (new URLSearchParams(window.location.search)).get("source")
  if (SOURCE === "qr") {
    localStorage.setItem(LOCAL_STORAGE_TAG, false)
    if (IS_REDIRECTING) {
      window.location.replace(QR_REDIRECT)
    }
  }
  else if (SOURCE !== "dev") {
    localStorage.setItem(LOCAL_STORAGE_TAG, false)
    if (IS_REDIRECTING) {
      window.location.replace(REDIRECT)
    }
  }
  else {
    localStorage.setItem(LOCAL_STORAGE_TAG, true)
    console.log("%cDEV", "color: red", "mode enabled")
    if (!(new URLSearchParams(window.location.search)).get("hidebanner")) {
      let banner = document.createElement("div")
      banner.className = "__dev-banner"
      let text = document.createElement("p")
      text.innerHTML = "You are currently in <B>DEV</B> mode."
      let close = document.createElement("img")
      close.src = "https://dev.paywake.net/package/dev.png"
      close.onclick = () => {
        banner.remove()
        window.location.replace(location.href.toString() + "&hidebanner=true")
      }
      banner.appendChild(text)
      banner.appendChild(close)
      $(window).on("load", () => {
        const elements = document.body.querySelectorAll("*")
        for (let e of elements) {
          if (e.href) {
            e.href = (e.href + "?source=dev")
          }
        }
        document.body.appendChild(banner)
      })
    }
    else {
      $(window).on("load", () => {
        const elements = document.body.querySelectorAll("*")
        for (let e of elements) {
          if (e.href) {
            e.href = (e.href + "?source=dev&hidebanner=true")
          }
        }
      })
      console.log("%cHIDE-BANNER", "color: lime", "mode enabled")
    }
  }
})()
