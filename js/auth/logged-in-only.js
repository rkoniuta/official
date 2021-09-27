const AUTH = () => {
  if (!SESSION) {
    window.location.href = REDIRECTS.noAuth
  }
}
