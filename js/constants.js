const YEAR = (new Date()).getFullYear()

let API = "https://sf7d6paxe6.execute-api.us-east-1.amazonaws.com/prod"
const ESTIMATED_RETURN = 8
const SLIDER_INIT_MIN = 30
const SLIDER_INIT_MAX = 80
const SLIDER_DURATION_MS = 1200
const DARKNESS_THRESHOLD = 51 //out of 255
const FOUNDING_USER_THRESHOLD = 10000
const DIAMOND_USER_THRESHOLD = 500
const CODE_SEND_BUFFER = 700 //in ms
const TIME_ZONE = "America/Los_Angeles"
const EPOCH = [1970, 0, 1]
const LOCAL_STORAGE_TAG = "__paywake-"
const TWOX_WAKEUP_DESC = "2X money"
const ANTI_CLEARS = [ //Local storage which isn't cleared on logout
  "earnings",
  "copysheet-byId",
  "copysheet-byPage",
  "wakeup-sun",
  "wakeup-mon",
  "wakeup-tue",
  "wakeup-wed",
  "wakeup-thu",
  "wakeup-fri",
  "wakeup-sat",
]
const NOTIFICATION_STRING_2X = "2xnotify"
let IS_2X = false

if (window.location.origin === "https://dev.paywake.net" && !(new URLSearchParams(window.location.search)).get("prod")) {
  API = "https://0zynwo3qw4.execute-api.us-east-1.amazonaws.com/dev"
}

const IS_IOS = (
  (/iPad|iPhone|iPod/.test(navigator.platform) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
  !window.MSStream
)

const REDIRECTS = {
  home: "./",
  onAuth: "./dashboard",
  noAuth: "./login"
}

const __ensureInContinentalUS = () => {
  try {
    const __CONTINENTAL_PAGE = window.location.pathname.toLowerCase().trim().split("/").pop().split(".").shift()
    let timeDiff = (((moment().tz(TIME_ZONE).utcOffset() - moment().utcOffset()) / 60) * (-1))
    timeDiff += 0;
    if (!(timeDiff <= 3 && (-1) <= timeDiff)) {
      if (!(__CONTINENTAL_PAGE === "international" || __CONTINENTAL_PAGE === "terms" || __CONTINENTAL_PAGE === "index" || __CONTINENTAL_PAGE === "" || __CONTINENTAL_PAGE === "press" || __CONTINENTAL_PAGE === "faq")) {
        leavePage("./international")
      }
    }
  }
  catch (e) {}
}

const __scamNotice = () => {
  console.log("%cStop! ✋🏼","font-size: 72px; font-family: 'Urbanist', sans-serif; color: red;")
  console.log("%cThis is a browser feature intended for developers only. If someone told you to copy-paste something here to enable a Paywake feature or \"hack\" someone's account, it is a scam and will give them access to your Paywake account.\n", "font-size: 20px; font-family: 'Urbanist', sans-serif;")
}

const cleanPhone = (string) => {
  return string.toString().trim().toLowerCase().replace(/[^0-9]+/g, "")
}

const cleanName = (string) => {
  return string.toString().trim().replace(/[^a-zA-Z\.\- ]+/g, "")
}

const formatPhone = (value) => {
  if (!value) {
    return value
  }
  const number = value.replace(/[^\d]/g, "")
  const n = number.length
  if (n < 4) {
    return number
  }
  if (n < 7) {
    return `(${number.slice(0, 3)}) ${number.slice(3)}`
  }
  return `(${number.slice(0, 3)}) ${number.slice(3,6)}-${number.slice(6, 10)}`
}

const phoneFormatter = (obj) => {
  const value = formatPhone(obj.value)
  obj.value = value
}

const leavePage = (page = "./dashboard", params = []) => {
  let devAdd = ""
  let paramsAdd = ""
  let qFlag = true
  if (devAdd.length) {
    qFlag = false
  }
  for (let param of params) {
    let c = "&"
    if (qFlag) {
      c = "?"
      qFlag = false
    }
    paramsAdd = (paramsAdd + c + encodeURIComponent(param[0]) + "=" + encodeURIComponent(param[1]))
  }
  window.location.href = (page + devAdd + paramsAdd)
}

$(window).on("load", () => {
  if (IS_IOS) {
    $(".if-ios").removeClass("if-ios")
  }
});

(() => {
  const SAFARI_FIX = {
    minInnerHeight: window.innerHeight,
    maxInnerHeight: false,
    passiveIfSupported: false
  };
  try {
    window.addEventListener("test", null, Object.defineProperty({}, "passive", {
      get: () => {
        SAFARI_FIX.passiveIfSupported = {
          passive: true
        }
      }
    }))
  } catch (err) {};
  document.addEventListener("scroll", (e) => {
    const windowInnerHeight = window.innerHeight;
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      if (!SAFARI_FIX.minInnerHeight || (windowInnerHeight < SAFARI_FIX.minInnerHeight)) {
        SAFARI_FIX.minInnerHeight = windowInnerHeight
      }
      if ((!SAFARI_FIX.maxInnerHeight || (windowInnerHeight > SAFARI_FIX.maxInnerHeight)) && windowInnerHeight > SAFARI_FIX.minInnerHeight) {
        SAFARI_FIX.maxInnerHeight = windowInnerHeight
      }
      if (SAFARI_FIX.maxInnerHeight && (SAFARI_FIX.maxInnerHeight == windowInnerHeight)) {
        $(document.body).addClass("safari-toolbars-hidden")
      } else {
        $(document.body).removeClass("safari-toolbars-hidden")
      }
    }
  }, SAFARI_FIX.passiveIfSupported);
})();

const __EMOJIS = {};
(() => {
  const setEmojiDate = (month, day, emoji) => {
    if (!__EMOJIS[month]) {
      __EMOJIS[month] = {}
    }
    __EMOJIS[month][day.toString()] = emoji
  }

  //EMOJI HOLIDAYS
  //setEmojiDate("FEB", 14, "💕")
  setEmojiDate("MAR", 17, "☘️")
  setEmojiDate("JUL",  4, "🇺🇸")
  setEmojiDate("OCT", 31, "🎃")
  setEmojiDate("DEC", 25, "🎄")

})();
(() => {
  let day = moment().format("DD").toString().trim()
  let month = moment().format("MMM").toUpperCase().trim()
  let emoji = ""
  try {
    emoji = __EMOJIS[month][day]
  } catch (e) {
    emoji = ""
  }
  if (emoji !== undefined && emoji.length) {
    $(window).on("load", () => {
      document.getElementsByClassName("logo")[0].childNodes[3].innerHTML = (document.getElementsByClassName("logo")[0].childNodes[3].innerHTML + (" " + emoji))
    })
  }
})();

if (localStorage.getItem(LOCAL_STORAGE_TAG + "2x-mode") === "true") {
  IS_2X = true
  const GREEN_2X_ELEMENT = ("<span class='twoX'>2X</span>")
  const __TWOX_MODE_PAGE = window.location.pathname.toLowerCase().trim().split("/").pop().split(".").shift()
  $(document).ready(() => {
    if (!(__TWOX_MODE_PAGE === "index" || __TWOX_MODE_PAGE === "" || __TWOX_MODE_PAGE === "login" || __TWOX_MODE_PAGE === "create" || __TWOX_MODE_PAGE === "press" || __TWOX_MODE_PAGE === "terms" || __TWOX_MODE_PAGE === "privacy")) {
      $("*").addClass("__twox-mode")
      if (__TWOX_MODE_PAGE === "dashboard") {
        $(".toolbar")[0].childNodes[1].querySelector("img").src = "assets/images/home-2xmode.png"
        $("#__twox-mode-target-0")[0].innerHTML = ("Past Earnings " + GREEN_2X_ELEMENT)
        $("#__twox-mode-target-1")[0].innerHTML = ("users with 2X who deposited")
        $("#schedule-button")[0].innerHTML = ("Schedule a " + GREEN_2X_ELEMENT + " Wakeup")
      }
      else if (__TWOX_MODE_PAGE === "schedule") {
        $(".toolbar")[0].childNodes[3].querySelector("img").src = "assets/images/schedule-2xmode.png"
      }
      else if (__TWOX_MODE_PAGE === "settings") {
        $(".toolbar")[0].childNodes[5].querySelector("img").src = "assets/images/settings-2xmode.png"
        try {
          $("#award-icon[src='assets/images/award-3.png']")[0].src = "assets/images/award-3-green.png"
        } catch (e) {}
        try {
          $("#award-icon[src='assets/images/award-4.png']")[0].src = "assets/images/award-4-green.png"
        } catch (e) {}
        try {
          $("#award-icon[src='assets/images/award-5.png']")[0].src = "assets/images/award-5-green.png"
        } catch (e) {}
      }
      else if (__TWOX_MODE_PAGE === "index" || __TWOX_MODE_PAGE === "" || __TWOX_MODE_PAGE === "tutorial" || __TWOX_MODE_PAGE === "login" || __TWOX_MODE_PAGE === "faq" || __TWOX_MODE_PAGE === "international") {
        $("#sun")[0].src = "assets/images/sun-192-green.png"
      }
    }
  })
}

$(document).ready(() => {
  try {
    $("#__YEAR")[0].innerHTML = YEAR.toString()
  } catch (e) {}
})

$(document).ready(() => {
  try {
    const showPassword = $("#__show-password")[0]
    if (showPassword) {
      const showPasswordTarget = $(showPassword.getAttribute("target"))[0]
      showPassword.onclick = () => {
        if (showPasswordTarget.type === "password") {
          showPasswordTarget.type = "text"
          $(showPassword).addClass("visible")
          $("#__show-password-container").addClass("visible")
        }
        else {
          showPasswordTarget.type = "password"
          $(showPassword).removeClass("visible")
          $("#__show-password-container").removeClass("visible")
        }
      }
    }
  } catch (e) {}
});

(() => {
  let __url = new URLSearchParams(window.location.search)
  if (__url.get("source")) {
    let __source = decodeURIComponent(__url.get("source"))
    if (__source !== "dev") {
      localStorage.setItem(LOCAL_STORAGE_TAG + "source", __source)
      window.history.replaceState(null, null, window.location.pathname)
    }
  }
})();

$(document).ready(() => {
  try {
    if (USER && (localStorage.getItem(LOCAL_STORAGE_TAG + "source") || "").length) {
      let __asource = localStorage.getItem(LOCAL_STORAGE_TAG + "source")
      $.ajax({
        url: (API + "/source"),
        type: "PUT",
        data: {
          source: __asource.toString()
        },
        xhrFields: {
          withCredentials: true
        },
        beforeSend: (xhr) => {
          xhr.setRequestHeader("Authorization", ID_TOKEN)
        },
        success: (data) => {
          localStorage.removeItem(LOCAL_STORAGE_TAG + "source")
        }
      })
    }
  }
  catch (e) {}
});

__scamNotice()
console.log("\u00A9 " + YEAR.toString() + " Paywake Corporation")

__ensureInContinentalUS()
