import express from 'express';
import { getHelpers, createHelper, updateHelper, deleteHelper, getHelperById } from '../controllers/helperController';

const router = express.Router();

router.get('/', getHelpers);
router.post('/', createHelper);
router.get('/:id', getHelperById)
router.put('/:id', updateHelper);
router.delete('/:id', deleteHelper);

export default router;
