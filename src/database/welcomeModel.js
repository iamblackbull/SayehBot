const mongoose = require('mongoose');

const reqString = {
    type: String,
    required: true
}

const welcomeSchema = new mongoose.Schema({
    _id: reqString,
    channelId: reqString
})

module.exports = mongoose.model("welcome", welcomeSchema)