import express, { Router } from 'express';
import { sessionController } from '../controllers/controller';
import { validateSession } from '../middleware/validation';


const router: Router = express.Router();

router.get('/', sessionController.getAllSessions);
router.get('/:id', sessionController.getSessionById);
router.post('/', validateSession as any, sessionController.createSession);
router.post('/:sessionId/participants', sessionController.addParticipant);
router.post('/:sessionId/participants/:participantId/events', sessionController.logEvent);
router.put('/:sessionId/end', sessionController.endSession);

export default router;