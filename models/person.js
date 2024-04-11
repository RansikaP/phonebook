const mongoose = require('mongoose')

mongoose.set('strictQuery',false)

const url = process.env.MONGO_URI

mongoose.connect(url)
    .then(() => {
        console.log('connected to MongoDB')
    })  .catch(error => {
        console.log('error connecting to MongoDB:', error.message)
    })

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        required: [true, 'Name Required']
    },
    number: {
        type: String,
        minLength: 8,
        validate: {
            validator: function(v) {
                return /\d{2,3}-\d{5,}/.test(v)
            },
            message: props => `${props.value} is not a valid phone number!`
        },
        required: [true, 'Phone number required']
    },
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', personSchema)