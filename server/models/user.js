const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    _id: { type: String, required: 'please enter id' },
    role: { type: String, default: 'student', enum: ["student", "teacher", "admin"] },
    name: { type: String, required: 'Please Enter Student Name' },
    email: { type: String, required: 'Please Enter Student Email' },
    password: { type: String, required: 'Please Enter Student Password', min: 8 },
    created_at: { type: Date, default: Date.now() },
    accessToken: { type: String },
    courses: [
        { Id: { type: String } }
    ]
});

module.exports = mongoose.model('user', userSchema);