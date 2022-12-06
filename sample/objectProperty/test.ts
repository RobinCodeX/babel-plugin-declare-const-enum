
const object = {
  greetings: [
    {
      type: HelloEnumObj.Hello,
      image: "https://placekitten.com/300/300"
    },
    {
      type: HelloEnumObj.Hola,
      image: "https://placekitten.com/300/300"
    }
  ]
}

console.log(object.greetings[0].type === HelloEnumObj.Hello);
