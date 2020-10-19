const mongoose = require('mongoose');
const moment = require('moment');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const rentalSchema = new mongoose.Schema({
    customer: {
        type: new mongoose.Schema({
            name: {
                type: String,
                minlength: 3,
                maxlength: 10,
                required: true
            },
            phone: {
                type: Number,
                minlength: 10,
                maxlength: 10,
                required: true
            }
        }),
        required: true
    },
    movie: {
        type: new mongoose.Schema({
            title: {
                type: String,
                required: true,
                trim: true,
                minlength: 3,
                maxlength: 100
            },
            dailyRentalRate: {
                type: Number,
                required: true,
                min: 0,
                max: 100
            }
        }),
        required: true
    },
    dateOut: {
        type: Date,
        required: true,
        default: Date.now
    },
    dateReturned: {
        type: Date
    },
    rentalFee: {
        type: Number,
        min: 0
    },
})

rentalSchema.statics.lookup = function (customerId, movieId) {
    return this.findOne(
        {
            'customer._id': customerId,
            'movie._id': movieId
        }
    );
}

rentalSchema.methods.processReturn = function () {
    this.dateReturned = new Date();

    // calculate the rental
    const rentalDays = moment().diff(this.dateOut, 'days');
    this.rentalFee = rentalDays * this.movie.dailyRentalRate;
}

const Rental = mongoose.model('Rental', rentalSchema);

function validateRental(rental) {
    const schema = {
        customerId: Joi.objectId().required(),
        movieId: Joi.objectId().required()
    };

    return Joi.validate(rental, schema);
}

module.exports.Rental = Rental;
module.exports.validateRental = validateRental;