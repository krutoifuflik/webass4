import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    age: { type: Number, required: true },
    country: { type: String, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    role: { type: String, enum: ['admin', 'regular'], default: 'regular' }
}, {
    versionKey: false
});

const UserModel = mongoose.model('User', userSchema);

export default UserModel;
