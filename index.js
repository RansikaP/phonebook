const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

morgan.token('body', req => {
    return JSON.stringify(req.body)
})

app.use(express.json())

const conditionalLogger = (req, res, next) => {
    if (req.method === 'POST') {
        return morgan(':method :url :status :res[content-length] - :response-time ms :body')(req, res, next)
    } else {
        return morgan(':method :url :status :res[content-length] - :response-time ms')(req, res, next)
    }
}

app.use(conditionalLogger)

app.use(cors())

app.use(express.static('dist'))

let persons = [
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

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
    const datetime = new Date()

    response.send(
        `<p>Phonebook has info for ${persons.length}</p>
        <p>${datetime}</p>`
    )
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(p => p.id === id)

    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(p => p.id !== id)

    response.status(204).end()
})

const generateID = () => {
    let id

    while (true) {
        id = Math.floor(Math.random() * 1000000)
        if (!persons.map(p => p.id).includes(id)) {
            break;
        }
    }

    return id
}

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'content missing'
        })
    } else if (persons.filter(p => p.name === body.name).length != 0) {
        return response.status(409).json({
            error: 'name must be unique'
        })
    }

    const person = {
        id: generateID(),
        name: body.name,
        number: body.number,
    }

    persons = persons.concat(person)

    response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})