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
