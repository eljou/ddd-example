interface Message {
  type: 'HELLO' | 'BYE'
  str: string
}

const simpleMessage: Message = {
  type: 'HELLO',
  str: 'WORLD',
}

console.log(simpleMessage)
