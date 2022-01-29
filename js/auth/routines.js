const ROUTINES = {

  //LOGIN
  login: (phone, password, callback = (() => {})) => {
    const AUTH_DETAILS = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails({
      Username: phone,
      Password: password,
    })
    USER = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser({
      Username: phone,
      Pool: USER_POOL
    })
    USER.authenticateUser(AUTH_DETAILS, {
      onSuccess: (result) => {
        USER = result.user
        callback(null)
      },
      onFailure: (err) => {
        callback(err)
      },
    })
  },

  //SIGNUP
  signup: (name, phone, password, callback = (() => {})) => {
    let attributes = new Array()
    const PHONE = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute({
      Name: "phone_number",
      Value: phone
    })
    const NAME = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute({
      Name: "name",
      Value: name.toString().trim()
    })
    attributes.push(PHONE)
    attributes.push(NAME)

    USER_POOL.signUp(phone, password, attributes, null, (err, result) => {
      if (err) {
        callback(err)
      }
      else {
        USER = result.user
        localStorage.setItem("__paywake-verify", phone)
        localStorage.setItem("__paywake-temp-name", name)
        localStorage.setItem("__paywake-temp-username", phone)
        localStorage.setItem("__paywake-temp-password", password)
        callback(null)
      }
    })
  },

  //VERIFY
  verify: (code, callback = (() => {})) => {
    USER = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser({
        Username: localStorage.getItem("__paywake-verify").toString(),
        Pool: USER_POOL
    })
    USER.confirmRegistration(code, true, (err, result) => {
      if (err) {
        callback(err)
      }
      else {
        callback(null)
      }
    })
  },

  //LOGOUT
  logout: () => {
    if (USER != null) {
      USER.getSession((err, session) => {
        USER.globalSignOut({
          onSuccess: (data) => {
            const balance = localStorage.getItem(LOCAL_STORAGE_TAG + "balance")
            localStorage.clear()
            localStorage.setItem(LOCAL_STORAGE_TAG + "balance", balance)
            window.location.href = REDIRECTS.home
          },
          onFailure: (err) => {
            const balance = localStorage.getItem(LOCAL_STORAGE_TAG + "balance")
            localStorage.clear()
            localStorage.setItem(LOCAL_STORAGE_TAG + "balance", balance)
            window.location.href = REDIRECTS.home
          }
        })
      })
    }
    else {
      localStorage.clear()
      window.location.href = REDIRECTS.home
    }
  },

  //RESEND VERIFICATION
  resend: (callback = (() => {})) => {
    (new AWS.CognitoIdentityServiceProvider()).resendConfirmationCode({
      ClientId: USER_POOL.clientId,
      Username: localStorage.getItem("__paywake-verify").toString()
    }, (err, result) => {
      if (err) {
        callback(err)
      }
      else {
        callback(null)
      }
    })
  },

  //FORGOT PASSWORD
  forgot: (phone, callback = (() => {})) => {
    USER = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser({
      Username: phone,
      Pool: USER_POOL
    })
    USER.forgotPassword({
      onSuccess: (result) => {
        callback(null)
      },
      onFailure: (err) => {
        callback(err)
      },
    })
  },

  //UPDATE PASSWORD
  update: (phone, code, password, callback = (() => {})) => {
    USER = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser({
      Username: phone,
      Pool: USER_POOL
    })
    USER.confirmPassword(code, password, {
      onSuccess: (result) => {
        callback(null)
      },
      onFailure: (err) => {
        callback(err)
      },
    })
  },

  //SET NAME
  name: (name, callback = (() => {})) => {
    name.toString().trim()
    if (name.length) {
      USER.updateAttributes([new AmazonCognitoIdentity.CognitoUserAttribute({
        Name: "name",
        Value: name,
      })], (err, result) => {
        if (err) {
          callback(err)
        }
        else {
          localStorage.setItem(LOCAL_STORAGE_TAG + "name", name)
          callback(null)
        }
      })
    }
  },

}
