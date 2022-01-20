if (localStorage.getItem(LOCAL_STORAGE_TAG + "2x-mode") === "true") {
  localStorage.setItem(LOCAL_STORAGE_TAG + "2x-mode", "false")
  alert("2X mode disabled")
}
else {
  localStorage.setItem(LOCAL_STORAGE_TAG + "2x-mode", "true")
  alert("2X mode enabled")
}
window.location.replace("./dashboard");
