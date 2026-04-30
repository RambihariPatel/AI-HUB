const { createClerkClient } = require('@clerk/clerk-sdk-node');
const User = require('../models/User');

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

const protect = async (req, res, next) => {
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const sessionClaims = await clerkClient.verifyToken(token);
        const clerkUserId = sessionClaims.sub;

        let user = await User.findOne({ clerkId: clerkUserId });

        if (!user) {
            const clerkUser = await clerkClient.users.getUser(clerkUserId);
            const email = clerkUser.emailAddresses[0].emailAddress;

            user = await User.findOne({ email: email.toLowerCase().trim() });

            if (user) {
                user.clerkId = clerkUserId;
                user.imageUrl = clerkUser.imageUrl;
                await user.save();
            } else {
                user = await User.create({
                    clerkId: clerkUserId,
                    name: `${clerkUser.firstName} ${clerkUser.lastName}`,
                    email: email.toLowerCase().trim(),
                    imageUrl: clerkUser.imageUrl
                });
            }
        }

        req.user = user;
        return next(); // Always use return to prevent double-response
    } catch (error) {
        console.error('Clerk Auth Error:', error.message);
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

const admin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.email === 'rambiharipatel175@gmail.com')) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin };
