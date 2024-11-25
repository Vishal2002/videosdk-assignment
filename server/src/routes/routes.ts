import express from 'express';
import { sessionController } from '../controllers/controller';

const router = express.Router();

router.get('/', sessionController.getAllSessions);
router.get('/:id', sessionController.getSessionById);
router.post('/', sessionController.createSession);
router.post('/:sessionId/participants', sessionController.addParticipant);
router.post('/:sessionId/participants/:participantId/events', sessionController.logEvent);

export default router;