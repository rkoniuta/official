let USER_POOL = null;
let USER = null;
let SESSION = false;

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
      }
    })
  }
  try {
    if (AUTH) {
      AUTH()
    }
  } catch (e) {}
})()
