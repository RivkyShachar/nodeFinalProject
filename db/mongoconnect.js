const mongoose = require('mongoose');
const {config} = require("../config/secret")

main().catch(err => console.log(err));

async function main() {
    mongoose.set('strictQuery', false);
    //await mongoose.connect("mongodb://localhost:27017/buildNode")
    await mongoose.connect(`mongodb+srv://${config.userDb}:${config.passDb}@basmachdb.buqa25j.mongodb.net/buildNode`);
    console.log("mongo connect started");
}