setHistory(JSON.parse(localStorage.getItem(LOCAL_STORAGE_TAG + "history") || "[]"))
setName()
fetchHistory()

FEEDBACK.mount($(".content")[0])
