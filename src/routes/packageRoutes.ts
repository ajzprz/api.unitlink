import express from 'express';
import { createPackage, deletePackage, getPackage, updatePackage } from '../controllers/packageController';

const router = express.Router();

router.get('/:id', getPackage);
router.post('/', createPackage);
router.put('/:id', updatePackage);
router.delete('/:id', deletePackage);

export default router;