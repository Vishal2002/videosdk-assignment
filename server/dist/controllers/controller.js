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
const crypto_1 = __importDefault(require("crypto"));
const mongoose_1 = __importDefault(require("mongoose"));
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
            const session = yield Session_1.default.findById(id);
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
            // debugger;
            const meetingId = crypto_1.default.randomBytes(7).toString('hex');
            console.log(meetingId);
            const newSession = new Session_1.default(Object.assign({ meetingId: meetingId, start: new Date() }, sessionData));
            // Save the new session
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
            const participantId = crypto_1.default.randomBytes(7).toString('hex');
            // Validate sessionId is a valid ObjectId
            if (!mongoose_1.default.Types.ObjectId.isValid(sessionId)) {
                res.status(400).json({ message: 'Invalid sessionId' });
                return;
            }
            const session = yield Session_1.default.findById(sessionId);
            if (!session) {
                res.status(404).json({ message: 'Session not found' });
                return;
            }
            // Create a new participant object with default values
            const newParticipant = Object.assign({ participantId: participantId, name: req.body.name, events: {
                    mic: [],
                    webcam: [],
                    screenShare: [],
                    screenShareAudio: [],
                    errors: [],
                }, timelog: [] }, participantData);
            session.participantArray.push(newParticipant);
            // Update uniqueParticipantsCount
            const uniqueParticipantIds = new Set(session.participantArray.map(p => p.participantId));
            session.uniqueParticipantsCount = uniqueParticipantIds.size;
            yield session.save();
            res.status(200).json(session);
        }
        catch (error) {
            console.error('Error adding participant:', error);
            res.status(500).json({ message: 'Error adding participant' });
        }
    }),
    logEvent: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { sessionId, participantId } = req.params;
            const { eventType, action, message } = req.body;
            // Validate sessionId is a valid ObjectId
            if (!mongoose_1.default.Types.ObjectId.isValid(sessionId)) {
                res.status(400).json({ message: 'Invalid sessionId' });
                return;
            }
            // Validate eventType
            const validEventTypes = [
                'mic', 'webcam', 'screenShare',
                'screenShareAudio', 'errors',
                'join', 'exit'
            ];
            if (!validEventTypes.includes(eventType)) {
                res.status(400).json({ message: 'Invalid event type' });
                return;
            }
            // Validate action for specific event types
            const currentTime = new Date();
            const session = yield Session_1.default.findById(sessionId);
            if (!session) {
                res.status(404).json({ message: 'Session not found' });
                return;
            }
            const participant = session.participantArray.find(p => p.participantId === participantId);
            if (!participant) {
                res.status(404).json({ message: 'Participant not found' });
                return;
            }
            // Handle timelog events (join and exit)
            if (eventType === 'join' || eventType === 'exit') {
                if (eventType === 'join') {
                    // Check if there's an ongoing session entry
                    const lastTimelogEntry = participant.timelog[participant.timelog.length - 1];
                    if (lastTimelogEntry && !lastTimelogEntry.end) {
                        res.status(400).json({ message: 'Participant is already in the session' });
                        return;
                    }
                    // Add a new timelog entry
                    participant.timelog.push({
                        start: currentTime,
                        end: null
                    });
                }
                else if (eventType === 'exit') {
                    // Close the most recent open timelog entry
                    const openTimelogEntry = participant.timelog.find(entry => !entry.end);
                    if (!openTimelogEntry) {
                        res.status(400).json({ message: 'No active session to exit' });
                        return;
                    }
                    openTimelogEntry.end = currentTime;
                }
            }
            // Handle other event types (mic, webcam, etc.)
            else if (eventType === 'errors') {
                if (!message) {
                    res.status(400).json({ message: 'Error events require a message' });
                    return;
                }
                const errorEvent = {
                    start: currentTime,
                    message: message
                };
                if (!participant.events.errors) {
                    participant.events.errors = [];
                }
                participant.events.errors.push(errorEvent);
            }
            else {
                // Validate action for non-error events
                if (!['start', 'stop'].includes(action)) {
                    res.status(400).json({ message: 'Invalid action. Must be "start" or "stop"' });
                    return;
                }
                const eventArray = participant.events[eventType];
                if (!eventArray) {
                    res.status(400).json({ message: `Event type ${eventType} is not supported for this participant` });
                    return;
                }
                if (action === 'start') {
                    // Check if there's an ongoing event
                    const lastEvent = eventArray[eventArray.length - 1];
                    if (lastEvent && !lastEvent.end) {
                        res.status(400).json({ message: `Cannot start a ${eventType} event that is already in progress` });
                        return;
                    }
                    eventArray.push({ start: currentTime, end: null });
                }
                else if (action === 'stop') {
                    const lastEvent = eventArray[eventArray.length - 1];
                    if (!lastEvent || lastEvent.end) {
                        res.status(400).json({ message: `Cannot stop a ${eventType} event that hasn't started or is already stopped` });
                        return;
                    }
                    lastEvent.end = currentTime;
                }
            }
            yield session.save();
            res.status(200).json({
                message: 'Event logged successfully',
                timelog: participant.timelog
            });
        }
        catch (error) {
            console.error('Error logging event:', error);
            res.status(500).json({ message: 'Error logging event' });
        }
    }),
    endSession: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { sessionId } = req.params;
            const session = yield Session_1.default.findById(sessionId);
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
