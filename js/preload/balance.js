const setBalance = (balance = 0) => {
  localStorage.setItem(LOCAL_STORAGE_TAG + "balance", balance.toString())
  const dollars = Math.floor(balance / 100)
  const cents = Math.floor(balance % 100)
  document.getElementById("balance-dollars").innerHTML = dollars.toString()
  document.getElementById("balance-cents").innerHTML = ("." + cents.toString().padStart(2, "0"))
}

const fetchBalance = () => {
  $.ajax({
    url: (API + "/balance"),
    type: "GET",
    xhrFields: {
      withCredentials: true
    },
    beforeSend: (xhr) => {
      xhr.setRequestHeader("Authorization", ID_TOKEN)
    },
    success: (data) => {
      setBalance(data.balance)
    }
  })
}

let __AJAX_STACK = 0

const putAjaxLoader = () => {
  const loader = document.createElement("img")
  loader.src = ("./assets/images/loader-white.svg")
  loader.id = "__ajax-loader"
  $(".balance-container")[0].querySelector("h3").appendChild(loader)
}

const killAjaxLoader = () => {
  $("#__ajax-loader").remove()
}

$(document).ajaxStart(() => {
  if (__AJAX_STACK === 0) {
    putAjaxLoader()
  }
  __AJAX_STACK++;
})
$(document).ajaxComplete(() => {
  __AJAX_STACK--;
  if (__AJAX_STACK < 1) {
    killAjaxLoader()
  }
})
$(document).ajaxError(() => {
  __AJAX_STACK--;
  if (__AJAX_STACK < 1) {
    killAjaxLoader()
  }
})
