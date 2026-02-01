import express from 'express';
import communityController from '../controllers/communityController';
import authController from '../controllers/authController';

const router = express.Router();

router.use(authController.protect);

// Announcements
router.get('/announcements', communityController.getAllAnnouncements);
router.post('/announcements', authController.restrictTo(['admin']), communityController.createAnnouncement);

// Amenities
router.get('/amenities', communityController.getAllAmenities);
router.post('/amenities/book', communityController.bookAmenity);
router.get('/amenities/my-bookings', communityController.getMyBookings);

// Postings
router.get('/postings', communityController.getAllPostings);
router.post('/postings', communityController.createPosting);
router.get('/postings/my-postings', communityController.getMyPostings);

export default router;
