const mongoose = require('mongoose');

const birthdaySchema = new mongoose.Schema({
    User: String,
    Username: String,
    Birthday: String,
    Day: String,
    Month: String,
    Year: String,
    Age: String,
})

module.exports = mongoose.model('birthday', birthdaySchema)