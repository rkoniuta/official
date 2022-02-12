setBankData(JSON.parse(localStorage.getItem(LOCAL_STORAGE_TAG + "bank") || "{}"))

setUSStates()

setMaxTransfer()
document.getElementById("transfer-slider").value = Math.min(Math.max(Math.ceil(BALANCE * 0.4),1), BALANCE)
slider(document.getElementById("transfer-slider"))

DESTINATION = (parseInt(localStorage.getItem(LOCAL_STORAGE_TAG + "destination")) || 0)
selectDestination($("#destination-" + DESTINATION.toString())[0])

//$("#personal-name")[0].value = ((localStorage.getItem(LOCAL_STORAGE_TAG + "name") || USER.signInUserSession.idToken.payload.name))

if (BALANCE === 0) {
  let __HTML_STRING = ("<h3>Transfer Funds</h3><p id='no-funds-notice'>Once you've been paid for waking up on time, you'll be able to transfer funds to your Venmo or bank account.</p><br><button class='full-width gradient' onclick='goToSchedulePage()'>Schedule a Wakeup</button><br>")
  if (IS_2X) {
    __HTML_STRING.replace("<button class='full-width gradient'>", "<button class='full-width gradient __twox-mode'>")
  }
  $(".content")[0].innerHTML = __HTML_STRING
}
FEEDBACK.mount($(".content")[0])
