/* STRIPE TESTING */
const stripe = Stripe("pk_test_51JUdOkLpUT5ZEdXBfLc7zrtfyF0ZExQDolGH78FwUuRIC3O2qPalOclEL8mCNISHrXhGuxNA7mX17ARbY28hsvMT00QUcJY6MC")
const elements = stripe.elements()
const card = elements.create('card', {
  style: {
    base: {
      fontSize: "15px",
      fontFamily: "'Urbanist', sans-serif",
      color: "rgba(0,0,0,0.4)",
      width: "300px",
    },
  }
})
const submitToken = () => {
  stripe.createToken(card).then((result) => {
   if (result.error) {
     console.log("There was an error.")
   } else {
     console.log("Token: ", result.token)
   }
 })
}
