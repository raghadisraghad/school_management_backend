import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: Boolean, default: false, required: false },
    dateCreated: { type: Date, default: Date.now }
});

export default mongoose.model('Contact', contactSchema);
