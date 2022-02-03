setHistory(JSON.parse(localStorage.getItem(LOCAL_STORAGE_TAG + "history") || "[]"))
setName()

FEEDBACK.mount($(".content")[0])
