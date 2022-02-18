let FAQS = []
let FILTER_STRING = ""
let FAQ_FILTER_THRESHOLD = 0.6

const filterResults = (obj) => {
  FILTER_STRING = obj.value.trim().replace(/[^a-zA-Z0-9\- ]+/g, "").toLowerCase()
  renderFAQS()
}

const setFAQS = () => {
  const questions = {}
  const answers = {}
  const data = __COPYSHEET.byPage.faq
  for (let key in data) {
    if (key.includes("faq-question")) {
      questions[parseInt(key.split("-")[2])] = data[key]
    }
    else if (key.includes("faq-answer")) {
      answers[parseInt(key.split("-")[2])] = data[key]
    }
  }
  FAQS = []
  for (let key in questions) {
    const faq = {}
    faq.question = questions[key]
    faq.answer = (answers[key] || "")
    FAQS.push(faq)
  }
  renderFAQS()
  if (!FAQS.length) {
    setTimeout(setFAQS, 100)
  }
}

const htmlSafe = (s) => {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

const renderFAQS = () => {
  if (__COPYSHEET.windowLoaded) {
    $("#faq-container")[0].innerHTML = ""
    const filtered = []
    for (let faq of FAQS) {
      let hitCount = 0
      let possibleHits = 0
      for (let token of FILTER_STRING.split(" ")) {
        if (token.length) {
          possibleHits++;
          console.log()
          if (faq.question.replace(/[^a-zA-Z0-9\- ]+/g, "").toLowerCase().includes(token) || faq.answer.replace(/[^a-zA-Z0-9\- ]+/g, "").toLowerCase().includes(token)) {
            hitCount++;
          }
        }
      }
      if (possibleHits < 1 || (hitCount / possibleHits) > FAQ_FILTER_THRESHOLD) {
        const cloneFAQ = JSON.parse(JSON.stringify(faq))
        cloneFAQ.score = (hitCount / possibleHits)
        filtered.push(cloneFAQ)
      }
    }
    filtered.sort((a,b) => {
      return (b.score - a.score)
    })
    let first = true
    for (let faq of filtered) {
      const parent = document.createElement("div")
      parent.className = "faq"
      if (first) {
        parent.className = "faq expanded"
      }
      const question = document.createElement("div")
      question.className = "question"
      question.onclick = () => {
        if (parent.className.includes("expanded")) {
          $(parent).removeClass("expanded")
        }
        else {
          $(parent).addClass("expanded")
        }
      }
      const h3 = document.createElement("h3")
      h3.innerHTML = faq.question
      const toggle = document.createElement("div")
      toggle.className = "toggle"
      toggle.src = "./assets/images/collapse.png"
      question.appendChild(h3)
      question.appendChild(toggle)
      const answer = document.createElement("div")
      answer.className = "answer"
      if (faq.answer.charAt(0) === "<") {
        answer.innerHTML = faq.answer
      }
      else {
        answer.innerHTML = ("<p>" + htmlSafe(faq.answer) + "</p>")
      }
      parent.appendChild(question)
      parent.appendChild(answer)
      $("#faq-container")[0].appendChild(parent)
      first = false
    }
    if (!filtered.length) {
      const noResults = document.createElement("p")
      noResults.id = "no-results"
      noResults.innerHTML = "No results found."
      $("#faq-container")[0].appendChild(noResults)
    }
  }
  if (IS_2X) {
    $("a.gradient").addClass("__twox-mode")
  }
}

const parseSearch = () => {
  let url = (new URL(window.location.href))
  if (url.searchParams.get("search") !== null) {
    search = decodeURIComponent(url.searchParams.get("search"))
    $("#search")[0].value = search
    filterResults($("#search")[0])
    url.searchParams.delete("search")
    window.history.replaceState(null, null, url.toString())
  }
}
