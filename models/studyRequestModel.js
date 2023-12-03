const mongoose = require('mongoose');
const Joi = require('joi')

const studyRequestSchema = new mongoose.Schema({
    topics: [String],
    preferredLanguages: [String],
    preferredHours: {
        from: Date,
        to: Date
    },
    studyDuration: {
        min: Number,
        max: Number,
    },
    user_id: String
})

exports.StudyRequestModel = mongoose.model("studyRequests", studyRequestSchema);

exports.validateStudyRequest = (_reqBody) => {
    let schemaJoi = Joi.object({
        topics: Joi.array().items(Joi.string().min(2).max(100)).min(1).max(999).required(),
        preferredLanguages: Joi.array().items(Joi.string().min(2).max(100)).min(1).max(999).required(),
        preferredHours: Joi.object({
            from: Joi.date().required(),
            to: Joi.date().required(),
        }).required().when(Joi.object({
            from: Joi.date(),
            to: Joi.date(),
        }), {
            then: Joi.object({
                from: Joi.date().required(),
                to: Joi.date().required().greater(Joi.ref('from')),
            }),
        }),
        studyDuration: Joi.object({
            min: Joi.number().required().min(5),
            max: Joi.number().required().min(Joi.ref('min')),
        }).required(),
    }).custom((value, helpers) => {
        // Calculate the duration in hours
        const from = new Date(value.preferredHours.from);
        const to = new Date(value.preferredHours.to);
        const durationInMinutes = (to - from) / (60 * 1000);
        // Compare with studyDuration
        if (durationInMinutes < value.studyDuration.min) {
            return helpers.error(new Error('Preferred Hours must be greater than or equal to Study Duration'));
        }

        return value;
    });
    return schemaJoi.validate(_reqBody);
}
