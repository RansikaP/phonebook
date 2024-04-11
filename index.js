require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')

morgan.token('body', req => {
    return JSON.stringify(req.body)
})

const conditionalLogger = (req, res, next) => {
    if (req.method === 'POST') {
        return morgan(':method :url :status :res[content-length] - :response-time ms :body')(req, res, next)
    } else {
        return morgan(':method :url :status :res[content-length] - :response-time ms')(req, res, next)
    }
}

app.use(express.static('dist'))

app.use(express.json())

app.use(conditionalLogger)

app.use(cors())

app.get('/info', (request, response, next) => {
    const datetime = new Date()

    Person.find({}).count()
        .then(count => {
            response.send(
                `<p>Phonebook has info for ${count}</p>
                <p>${datetime}</p>`
            )
        })
        .catch(error => next(error))
})

app.get('/api/persons', (request, response, next) => {
    Person.find({})
        .then(people => {
            response.json(people)
        })
        .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            response.json(person)
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(person => {
            response.json(person)
        })
        .catch(error => next(error))
})

app.post('/api/persons', async (request, response, next) => {
    const body = request.body

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save()
        .then(savedPerson => {
            response.json(savedPerson)
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndUpdate(
        { _id: request.params.id },
        request.body,
        { new: true, runValidators: true, context: 'query' }
    )
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.log(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformed id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

// const generateID = () => {
//     let id

//     while (true) {
//         id = Math.floor(Math.random() * 1000000)
//         if (!persons.map(p => p.id).includes(id)) {
//             break;
//         }
//     }

//     return id
// }