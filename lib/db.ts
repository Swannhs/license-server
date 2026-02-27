import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

export const connectDb = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI as string, opts).then((mongoose) => {
            return mongoose;
        });
    }
    cached.conn = await cached.promise;
    return cached.conn;
};

const LicenseSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    key: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

export const License = mongoose.models.License || mongoose.model('License', LicenseSchema);

export const initDb = async () => {
    await connectDb();
};

export const addLicense = async (username: string, key: string) => {
    await connectDb();
    const license = new License({ username, key });
    await license.save();
    return { id: license._id.toString(), username: license.username, key: license.key };
};

export const getLicense = async (username: string) => {
    await connectDb();
    const license = await License.findOne({ username });
    return license ? { id: license._id.toString(), username: license.username, key: license.key } : null;
};

export const getAllLicenses = async () => {
    await connectDb();
    const licenses = await License.find().sort({ createdAt: -1 });
    return licenses.map(l => ({ id: l._id.toString(), username: l.username, key: l.key }));
};

export const deleteLicense = async (id: string) => {
    await connectDb();
    await License.findByIdAndDelete(id);
    return { success: true };
};
