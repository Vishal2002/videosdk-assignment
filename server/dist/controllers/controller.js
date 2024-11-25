"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionController = void 0;
const Session_1 = __importDefault(require("../models/Session"));
exports.sessionController = {
    getAllSessions: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const sessions = yield Session_1.default.find()
                .skip((page - 1) * limit)
                .limit(limit);
            const total = yield Session_1.default.countDocuments();
            res.status(200).json({
                sessions,
                totalPages: Math.ceil(total / limit),
                currentPage: page
            });
        }
        catch (error) {
            res.status(500).json({ message: 'Error fetching sessions' });
        }
    }),
    getSessionById: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const session = yield Session_1.default.findOne({ meetingId: id });
            if (!session) {
                res.status(404).json({ message: 'Session not found' });
                return;
            }
            res.status(200).json(session);
        }
        catch (error) {
            res.status(500).json({ message: 'Error fetching session' });
        }
    }),
    createSession: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sessionData = req.body;
            const newSession = new Session_1.default(sessionData);
            yield newSession.save();
            res.status(201).json(newSession);
        }
        catch (error) {
            res.status(500).json({ message: 'Error creating session' });
        }
    }),
    addParticipant: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { sessionId } = req.params;
            const participantData = req.body;
            const session = yield Session_1.default.findOne({ meetingId: sessionId });
            if (!session) {
                res.status(404).json({ message: 'Session not found' });
                return;
            }
            session.participantArray.push(participantData);
            session.uniqueParticipantsCount = session.participantArray.length;
            yield session.save();
            res.status(200).json(session);
        }
        catch (error) {
            res.status(500).json({ message: 'Error adding participant' });
        }
    }),
    logEvent: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { sessionId, participantId } = req.params;
            const eventData = req.body;
            const eventType = req.body.eventType;
            const session = yield Session_1.default.findOne({ meetingId: sessionId });
            if (!session) {
                res.status(404).json({ message: 'Session not found' });
                return;
            }
            const participant = session.participantArray.find(p => p.participantId === participantId);
            if (!participant) {
                res.status(404).json({ message: 'Participant not found' });
                return;
            }
            //@ts-ignore
            participant.events[eventType].push(eventData);
            yield session.save();
            res.status(200).json({ message: 'Event logged successfully' });
        }
        catch (error) {
            res.status(500).json({ message: 'Error logging event' });
        }
    }),
    endSession: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { sessionId } = req.params;
            const session = yield Session_1.default.findOne({ meetingId: sessionId });
            if (!session) {
                res.status(404).json({ message: 'Session not found' });
                return;
            }
            //@ts-ignore
            session.end = new Date();
            yield session.save();
            res.status(200).json(session);
        }
        catch (error) {
            res.status(500).json({ message: 'Error ending session' });
        }
    })
};
