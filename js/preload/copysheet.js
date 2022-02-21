const __COPYSHEET = {
  fetched: false,
  windowLoaded: false,
  byPage: {
    "*": {},
  },
  byId: {},
  get: (id) => {
    if (__COPYSHEET.byId[id]) {
      return __COPYSHEET.byId[id];
    }
    return false;
  },
  setAll: (first) => {
    let pageName = window.location.pathname.toString().substring(1).toLowerCase().replace(".html","").trim()
    if (!pageName.length) {
      pageName = "index"
    }
    if (__COPYSHEET.windowLoaded) {
      __COPYSHEET.set(pageName)
      __COPYSHEET.set("*")
    }
    else {
      if (first) {
        $(window).on("load", () => {
          if (!__COPYSHEET.fetched) {
            __COPYSHEET.set(pageName)
            __COPYSHEET.set("*")
          }
        })
      }
      else {
        $(window).on("load", () => {
          __COPYSHEET.set(pageName)
          __COPYSHEET.set("*")
        })
      }
    }
  },
  set: (pageName) => {
    const ID_TAG = "__COPYSHEET-";
    if (__COPYSHEET.byPage[pageName]) {
      for (let id in __COPYSHEET.byPage[pageName]) {
        try {
          document.getElementById((ID_TAG + id).trim()).innerHTML = __COPYSHEET.byPage[pageName][id]
        } catch (e) {}
      }
    }
  },
};

(() => {
  __COPYSHEET.byPage = (JSON.parse(localStorage.getItem((LOCAL_STORAGE_TAG + "copysheet-byPage"))) || ({
    "*": {},
  }));
  __COPYSHEET.byId = (JSON.parse(localStorage.getItem((LOCAL_STORAGE_TAG + "copysheet-byId"))) || ({}));
  __COPYSHEET.setAll(true)
})();

(async () => {
  const SHEET_ID = ("1bNc_Zc6t9Lidda9IELTPAJuRvXBKkCK5l99yp41pctg")
  let SHEET_NAME = "/prod"
  const subdomain = window.location.toString().split("//")[1].substring(0,3).toLowerCase().trim()
  if (subdomain === "dev" || subdomain === "/us") {
    SHEET_NAME = "/dev"
  }
  const sheetData = await fetch("https://opensheet.elk.sh/" + SHEET_ID + SHEET_NAME).then(r => r.json()).then((data) => {
    let res = []
    for (let row of data) {
      const ret = {}
      let flag = true
      if (row["Copy*"]) {
        ret.copy = row["Copy*"]
      }
      else {
        flag = false
      }
      if (row["Element ID*"]) {
        ret.id = row["Element ID*"]
      }
      else {
        flag = false
      }
      if (row["Page(s)*"]) {
        ret.pages = row["Page(s)*"].split(",")
        ret.pages = ret.pages.map(i => i.trim().toLowerCase())
      }
      else {
        flag = false
      }
      if (flag) {
        res.push(ret)
      }
    }
    return res
  });
  __COPYSHEET.byPage = {
    "*": {},
  };
  __COPYSHEET.byId = {};
  for (let row of sheetData) {
    for (let page of row.pages) {
      if (!__COPYSHEET.byPage[page]) {
        __COPYSHEET.byPage[page] = {}
      }
      __COPYSHEET.byPage[page][row.id] = row.copy
    }
    __COPYSHEET.byId[row.id] = row.copy
  }
  localStorage.setItem((LOCAL_STORAGE_TAG + "copysheet-byPage"), JSON.stringify(__COPYSHEET.byPage))
  localStorage.setItem((LOCAL_STORAGE_TAG + "copysheet-byId"), JSON.stringify(__COPYSHEET.byId))
  __COPYSHEET.fetched = true
  __COPYSHEET.setAll()
})();

$(window).on("load", () => {
  __COPYSHEET.windowLoaded = true
});
