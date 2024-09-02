const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Schema } = mongoose;

const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
    answers: [{ type: Schema.Types.ObjectId, ref: 'Answer' }],
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    comments:[{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    reputation:{type:Number, default:100},
    memberSince:{type: Date, default: Date.now}
});

userSchema.virtual('url').get(function () {
    return `users/profile/${this._id}`;
});

userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;

  