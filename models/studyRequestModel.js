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
    const schema = Joi.object({
        topics: validateTopics(),
        preferredLanguages: validatePreferredLanguages(),
        preferredHours: validatePreferredHours(),
        studyDuration: validateStudyDuration(),
    }).custom(validateDurationAndStudy());
    return schema.validate(_reqBody);
};

function validateTopics() {
    return Joi.array().items(Joi.string().min(2).max(100)).min(1).max(999).required();
}

function validatePreferredLanguages() {
    return Joi.array().items(Joi.string().min(2).max(100)).min(1).max(999).required();
}

function validatePreferredHours() {
    return Joi.object({
        from: Joi.date().required(),
        to: Joi.date().required().greater(Joi.ref('from')),
    }).required();
}

function validateStudyDuration() {
    return Joi.object({
        min: Joi.number().required().min(5),
        max: Joi.number().required().min(Joi.ref('min')),
    }).required();
}

function validateDurationAndStudy(value, helpers) {
    const from = new Date(value.preferredHours.from);
    const to = new Date(value.preferredHours.to);
    const durationInHours = (to - from) / (60 * 60 * 1000);

    if (durationInHours < value.studyDuration.min) {
        return helpers.error(new Error('Preferred Hours must be greater than or equal to Study Duration'));
    }

    return value;
}
