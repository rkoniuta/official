const BALANCE = parseInt(localStorage.getItem(LOCAL_STORAGE_TAG + "balance") || "0")
let DESTINATION = 0

const selectDestination = (obj) => {
  DESTINATION = (parseInt(obj.id.split("-")[1]) || 0)
  $(".destination-container > .option").removeClass("selected")
  $("#destination-" + DESTINATION.toString()).addClass("selected")
  localStorage.setItem(LOCAL_STORAGE_TAG + "destination", DESTINATION)
  if (DESTINATION === 1) {
    $("#details-title")[0].innerHTML = "Venmo Account Phone"
  }
  else {
    $("#details-title")[0].innerHTML = "Bank Account Details"
  }
  updateTransferButton()
}

const slider = (obj, userInputted = false) => {
  let transfer = Math.round(obj.value)
  document.getElementById("transfer-amount").value = balanceToString(transfer)
  adjustTransferInput(document.getElementById("transfer-amount"))
}

const transferInput = (obj) => {
  const element = document.getElementById("transfer-slider")
  element.value = Math.min(Math.max((Math.round(parseFloat(obj.value) * 100) || 0), 0), BALANCE)
  slider(element, true)
}

const adjustTransferInput = (obj) => {
  let numberOfOnes = 0
  for (let i = 0; i < obj.value.toString().length; i++) {
    if (obj.value.toString().charAt(i) === "1") {
      numberOfOnes++
    }
  }
  const numbers = (obj.value.toString().length - 1)
  obj.style.width = (Math.max((((numbers - numberOfOnes) * 36) + ((numberOfOnes + 1) * 16) + (16)), 112).toString() + "px")
  updateTransferButton()
}

const updateTransferButton = () => {
  let amount = document.getElementById("transfer-slider").value
  const button = $("#transfer-button")[0]
  if (DESTINATION === 1) {
    amount -= 25;
  }
  if (amount < 0) {
    amount = 0
  }
  button.innerHTML = ("Transfer $" + balanceToString(amount))
  if (amount < 1) {
    button.setAttribute("disabled", true)
  }
  else {
    button.removeAttribute("disabled")
  }
}

const balanceToString = (balance = BALANCE) => {
  return Math.floor(balance / 100).toString() + "." + (balance % 100).toString().padStart(2, "0")
}

const setMaxTransfer = () => {
  $("#transfer-amount")[0].maxLength = (Math.floor(BALANCE / 100).toString().length + 3)
  $("#transfer-slider")[0].max = BALANCE
  $("#max-transfer").text("$" + balanceToString(BALANCE))
}
