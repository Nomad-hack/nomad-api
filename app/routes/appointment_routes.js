// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for appointments
const Appointment = require('../models/appointment')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { appointment: { title: '', text: 'foo' } } -> { appointment: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /appointments
router.get('/appointments', requireToken, (req, res, next) => {
  Appointment.find()
    .then(appointments => {
      // `appointments` will be an array of Mongoose documents
      // we want to convert each one to a POJO, so we use `.map` to
      // apply `.toObject` to each one
      return appointments.map(appointment => appointment.toObject())
    })
    // respond with status 200 and JSON of the appointments
    .then(appointments => res.status(200).json({ appointments: appointments }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// SHOW
// GET /appointments/5a7db6c74d55bc51bdf39793
router.get('/appointments/:id', requireToken, (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  Appointment.findById(req.params.id)
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "appointment" JSON
    .then(appointment => res.status(200).json({ appointment: appointment.toObject() }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// CREATE
// POST /appointments
// router.post('/appointments', requireToken, (req, res, next) => {
//   // set owner of new appointment to be current user
//   req.body.appointment.owner = req.user._id

//   Appointment.create(req.body.appointment)
//     // respond to succesful `create` with status 201 and JSON of new "appointment"
//     .then(appointment => {
//       res.status(201).json({ appointment: appointment.toObject() })
//     })
//     // if an error occurs, pass it off to our error handler
//     // the error handler needs the error message and the `res` object so that it
//     // can send an error message back to the client
//     .catch(next)
// })

router.post('/appointments', requireToken, (req, res, next) => {
  const id = req.user.id
  const userAppointment = req.body.appointment
  userAppointment.owner = id

  Appointment.create(req.body.appointment)
    .then(appointment => res.status(201).json({ appointment: appointment }))
    .catch(next)
})

// UPDATE
// PATCH /appointments/5a7db6c74d55bc51bdf39793
router.patch('/appointments/:id', requireToken, removeBlanks, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  delete req.body.appointment.owner

  Appointment.findById(req.params.id)
    .then(handle404)
    .then(appointment => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      requireOwnership(req, appointment)

      // pass the result of Mongoose's `.update` to the next `.then`
      return appointment.updateOne(req.body.appointment)
    })
    // if that succeeded, return 204 and no JSON
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// DESTROY
// DELETE /appointments/5a7db6c74d55bc51bdf39793
router.delete('/appointments/:id', requireToken, (req, res, next) => {
  Appointment.findById(req.params.id)
    .then(handle404)
    .then(appointment => {
      // throw an error if current user doesn't own `appointment`
      requireOwnership(req, appointment)
      // delete the appointment ONLY IF the above didn't throw
      appointment.deleteOne()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

module.exports = router
