const mongoose = require('mongoose');

const checkBirthdaySchema = new mongoose.Schema({
    guildId: String,
    Date: String,
    IsTodayChecked: Boolean,
})

module.exports = mongoose.model('checkBirthday', checkBirthdaySchema);