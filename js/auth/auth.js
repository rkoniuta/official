let USER_POOL = null;
let USER = null;
let SESSION = false;
let ID_TOKEN = "";

(() => {
  AWSCognito.config.region = AWS.config.region
  USER_POOL = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool({
    UserPoolId: POOL_ID,
    ClientId: CLIENT_ID
  })
  USER = USER_POOL.getCurrentUser()
  if (USER != null) {
    USER.getSession((err, session) => {
      const ARN = ("cognito-idp.us-east-1.amazonaws.com/" + POOL_ID).toString()
      let logins = new Object()
      logins[ARN] = session.getIdToken().getJwtToken()
      AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: POOL_ID,
        Logins: logins
      })
      if (session.isValid()) {
        SESSION = true
        ID_TOKEN = localStorage.getItem("CognitoIdentityServiceProvider." + CLIENT_ID + "." + USER.username + ".idToken")
      }
    })
  }
  try {
    if (AUTH) {
      AUTH()
    }
  } catch (e) {}
})()
