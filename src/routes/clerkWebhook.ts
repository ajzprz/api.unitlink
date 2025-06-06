import { Router, Request, Response, NextFunction } from 'express';
import User from '../models/User';
import express from 'express';

const router = Router();
router.post('/', (req: Request, res: Response, next: NextFunction) => {
    (async () => {
        const event = req.body;

        if (!event || !event.type) {
            res.status(400).send('Invalid webhook event');
            return;
        }

        const clerkUser = event.data;

        try {
            if (event.type === 'user.created' || event.type === 'user.updated') {
                const userData = {
                    clerkId: clerkUser.id,
                    email: clerkUser.email_addresses?.[0]?.email_address || '',
                    firstName: clerkUser.first_name,
                    lastName: clerkUser.last_name,
                    imageUrl: clerkUser.image_url,
                };

                // Upsert the user (update if exists, insert if not)
                const result = await User.findOneAndUpdate(
                    { clerkId: clerkUser.id },
                    userData,
                    { upsert: true, new: true }
                );
                console.log('User upserted:', result);

                res.status(200).send('User synced');
                return;
            }

            res.status(200).send('Event ignored');
        } catch (error) {
            console.error('Webhook Error:', error);
            res.status(500).send('Internal Server Error');
        }
    })().catch(next);
});


export default router;
