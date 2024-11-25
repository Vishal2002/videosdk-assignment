"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller_1 = require("../controllers/controller");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
router.get('/', controller_1.sessionController.getAllSessions);
router.get('/:id', controller_1.sessionController.getSessionById);
router.post('/', validation_1.validateSession, controller_1.sessionController.createSession);
router.post('/:sessionId/participants', controller_1.sessionController.addParticipant);
router.post('/:sessionId/participants/:participantId/events', controller_1.sessionController.logEvent);
router.put('/:sessionId/end', controller_1.sessionController.endSession);
exports.default = router;
