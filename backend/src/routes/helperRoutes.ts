import express from 'express';
import { getHelpers, createHelper, updateHelper, deleteHelper, getHelperById } from '../controllers/helperController';
import multer from 'multer';

const router = express.Router();
const upload = multer();

router.get('/', getHelpers);
router.post('/', upload.fields([{ name: 'photoURL', maxCount: 1 }, { name: 'kycdoc', maxCount: 1 }]), createHelper);
router.get('/:id', getHelperById)
router.put('/:id', upload.fields([{ name: 'photoURL', maxCount: 1 }, { name: 'kycdoc', maxCount: 1 }]), updateHelper);
router.delete('/:id', deleteHelper);

export default router;
