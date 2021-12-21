setMaxTransfer()
document.getElementById("transfer-slider").value = Math.min(Math.max(Math.ceil(BALANCE * 0.4),1), BALANCE)
slider(document.getElementById("transfer-slider"))

DESTINATION = (parseInt(localStorage.getItem(LOCAL_STORAGE_TAG + "destination")) || 0)
selectDestination($("#destination-" + DESTINATION.toString())[0])
