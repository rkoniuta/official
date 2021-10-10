/* STRIPE TESTING */
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
