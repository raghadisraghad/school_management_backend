import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    role: { type: String, default: '1' },
    picture: { type: String, default: null, required: false },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    birthDate: { type: Date, required: true },
    tel: { type: String, default: null, required: true },
    level: { type: String, required: false },
    sector: { type: String, required: false },
    status: { type: Boolean, default: false, required: true },
    dateCreated: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
