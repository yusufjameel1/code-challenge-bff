import mongoose, { Schema } from 'mongoose';
import { IUserDocument } from '../types/user.types';
import { comparePasswords, hashPassword } from '../utils/auth.utils';

const userSchema = new Schema<IUserDocument>({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    }
}, {
    timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        this.password = await hashPassword(this.password);
        next();
    } catch (error) {
        next(error as Error);
    }
});


// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return comparePasswords(candidatePassword, this.password);
};

export const User = mongoose.model<IUserDocument>('User', userSchema);