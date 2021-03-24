const mongoose = require('mongoose')

const eventSchema = new mongoose.Schema({
  Event: {
    type: String,
    required: true
  },
  Date: {
    type: Integer,
    required: true
  },
  Time: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Event', eventSchema)
