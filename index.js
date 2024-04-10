require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')

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

app.get('/api/persons', (request, response) => {
    Person.find({}).then(people => {
        response.json(people)
    })
})

app.get('/info', (request, response) => {
    const datetime = new Date()

    Person.find({}).count().then(count => {
        response.send(
            `<p>Phonebook has info for ${count}</p>
            <p>${datetime}</p>`
        )
    })
})

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(person => {
        response.json(person)
    })
})

app.delete('/api/persons/:id', (request, response) => {
    Person.findByIdAndDelete(request.params.id).then(person => {
        response.json(person)
    })
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
    }

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})