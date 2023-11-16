const express = require('express')
const fs = require('fs')
const morgan = require('morgan')
const path = require('path')
const app = express()
const cors = require('cors')

app.use(cors())
app.use(express.json())
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
morgan.token('type', (req, res) => {
  return `${res.method} ${res.res.statusCode} ${res.route ? res.route.path : 'Route not found'} ${res.headers['content-length']} ${JSON.stringify(res.body)}`
})
app.use(morgan('type', { stream: accessLogStream }))
let phoneBook = [
  {
    "id": 1,
    "name": "Arto Hellas",
    "number": "040-123456"
  },
  {
    "id": 2,
    "name": "Ada Lovelace",
    "number": "39-44-5323523"
  },
  {
    "id": 3,
    "name": "Dan Abramov",
    "number": "12-43-234345"
  },
  {
    "id": 4,
    "name": "Mary Poppendieck",
    "number": "39-23-6423122"
  }
]

const generateId = () => {
  const maxId = phoneBook.length > 0
    ? Math.max(...phoneBook.map(n => n.id))
    : 0
  return maxId + 1
}

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  response.json(phoneBook)
})

app.get('/info', (request, response) => {
  response.send(`Phonebook has info for ${phoneBook.length} people <br> ${new Date()}`)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const person = phoneBook.find(prs => prs.id === id);
  person && response.status(200).json(person);
  !person && response.status(404).json({ error: 'Person not found' })
})

app.post('/api/persons', (request, response) => {
  const person = { id: generateId(), ...request.body };
  if (!person.name) {
    response.status(500).json({ error: 'Name must not be null' })
  } else if (!person.number) {
    response.status(500).json({ error: 'Number must not be null' })
  } else if (phoneBook.find(prs => prs.name === person.name)) {
    response.status(500).json({ error: 'Name must be unique' })
  } else {
    phoneBook = [...phoneBook, person];
    response.status(200).json(person);
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  phoneBook = phoneBook.filter(prs => prs.id !== id);
  response.status(204).json();
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
