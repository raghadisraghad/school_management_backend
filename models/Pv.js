import mongoose from 'mongoose';

const pvSchema = new mongoose.Schema({
    name: { type: String, default: null, required: true },
    description: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    pv: { type: String, required: false },
    dateCreated: { type: Date, default: Date.now }
});

export default mongoose.model('Pv', pvSchema);