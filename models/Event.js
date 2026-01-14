import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    name: { type: String, default: null, required: true},
    description: { type: String, required: true },
    posters: [{ type: String, required: true }],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    location: { type: String, required: true },
    note: { type: String, required: false },
    activities: [{ type: String, required: false }],
    ticket: {
        intern: { type: String, required: false },
        extern: { type: String, required: false }
    },
    collaborators: [{type: String, required: false}],
    archive: { type: Boolean, default: false, required: true },
    updateStatus: { type: Boolean, default: false, required: false },
    active: { type: Boolean, default: false, required: false },
    office: { type: mongoose.Schema.Types.ObjectId, ref: 'Office' },
    dateCreated: { type: Date, default: Date.now }
});

export default mongoose.model('Event', eventSchema);
