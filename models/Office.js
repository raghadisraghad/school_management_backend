import mongoose from 'mongoose';

const officeSchema = new mongoose.Schema({
    email: { type: String, required: true },
    name: { type: String, required: true, unique: true },
    abb: { type: String, required: true },
    slogan: { type: String, required: true },
    description: { type: String, required: true },
    password: { type: String, required: true },
    picture: { type: String, default: null, required: false },
    backgroundPicture: { type: String, default: null, required: false },
    status: { type: Boolean, default: false, required: true },
    archive: { type: Boolean, default: false, required: false },
    dateCreated: { type: Date, default: Date.now },
    president: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    vice: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    secretary: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    pvs: [{
        name: { type: String, required: false },
        description: { type: String, required: false },
        pv: { type: String, required: false },
        dateCreated: { type: Date, default: Date.now, required: false  }
    }],
    poles: [{
        name: { type: String, default: null, required: false },
        description: { type: String, default: null, required: false },
        res: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        dateCreated: { type: Date, default: Date.now }
    }],
});

export default mongoose.model('Office', officeSchema);
