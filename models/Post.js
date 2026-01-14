import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    subject: { type: String, default: null, required: true },
    description: { type: String, required: true },
    posters: [{ type: String, required: false }],
    links: [{
        text: { type: String, required: true },
        url: { type: String, required: true }
    }],
    updateStatus: { type: Boolean, default: false, required: false },
    poll: [{
        option: { type: String, required: true },
        votes: { type: Number, required: true },
        users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }],
    reactions: { type: Number, required: false },
    category: { type: String, required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    office: { type: mongoose.Schema.Types.ObjectId, ref: 'Office' },
    dateCreated: { type: Date, default: Date.now }
});

export default mongoose.model('Post', postSchema);
