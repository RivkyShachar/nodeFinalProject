const mongoose = require('mongoose');
const Joi = require('joi')

const tablesSchema = new mongoose.Schema({
})

exports.TablesModel = mongoose.model("tables", tablesSchema);

exports.validateTable = (_reqBody) =>{
    let schemaJoi = Joi.object({})
    return schemaJoi.validate(_reqBody);
}

// fill the tablesSchema and validateTable--schemaJoi
