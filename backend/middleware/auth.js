const { createClerkClient } = require('@clerk/clerk-sdk-node');
const User = require('../models/User');

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            
            // Verify the session token with Clerk
            const sessionClaims = await clerkClient.verifyToken(token);
            const clerkUserId = sessionClaims.sub;

            // Find user in our DB by clerkId or Email
            let user = await User.findOne({ clerkId: clerkUserId });

            // If not found by clerkId, try email (syncing)
            if (!user) {
                const clerkUser = await clerkClient.users.getUser(clerkUserId);
                const email = clerkUser.emailAddresses[0].emailAddress;
                
                user = await User.findOne({ email: email.toLowerCase().trim() });
                
                if (user) {
                    user.clerkId = clerkUserId;
                    await user.save();
                } else {
                    // Create new user if they don't exist in our DB
                    user = await User.create({
                        clerkId: clerkUserId,
                        name: `${clerkUser.firstName} ${clerkUser.lastName}`,
                        email: email.toLowerCase().trim()
                    });
                }
            }

            req.user = user;
            next();
        } catch (error) {
            console.error('Clerk Auth Error:', error);
            res.status(401).json({ message: 'Not authorized, Clerk token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };
