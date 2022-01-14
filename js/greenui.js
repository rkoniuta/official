if (localStorage.getItem(LOCAL_STORAGE_TAG + "2x-mode") === "true") {
  localStorage.setItem(LOCAL_STORAGE_TAG + "2x-mode", "false")
}
else {
  localStorage.setItem(LOCAL_STORAGE_TAG + "2x-mode", "true")
}
window.location.replace("./dashboard");
