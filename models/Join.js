import mongoose from 'mongoose';

const joinSchema = new mongoose.Schema({
    name: { type: String, required: true },
    user_id:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    email: { type: String, required: true },
    office: { type: mongoose.Schema.Types.ObjectId, ref: 'Office' },
    pole: { type: String, required: true },
    status: { type: Boolean, default: false, required: false },
    reason: { type: String, required: true },
    dateCreated: { type: Date, default: Date.now }
});

export default mongoose.model('Join', joinSchema);
