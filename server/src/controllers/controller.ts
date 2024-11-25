import { Request, Response } from 'express';
import SessionModel from '../models/Session';
import { Session, Participant, Event } from '../types/session';
import crypto from 'crypto';
import mongoose from 'mongoose';
export const sessionController = {
  getAllSessions: async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const sessions = await SessionModel.find()
        .skip((page - 1) * limit)
        .limit(limit);
      
      const total = await SessionModel.countDocuments();
      
      res.status(200).json({
        sessions,
        totalPages: Math.ceil(total / limit),
        currentPage: page
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching sessions' });
    }
  },

  getSessionById: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const session = await SessionModel.findOne({ meetingId: id });
      if (!session) {
        res.status(404).json({ message: 'Session not found' });
        return;
      }
      res.status(200).json(session);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching session' });
    }
  },

  createSession: async (req: Request, res: Response): Promise<void> => {
    try {
      const sessionData: Partial<Session> = req.body;
      // debugger;
      const meetingId = crypto.randomBytes(7).toString('hex');
     console.log(meetingId);
     const newSession = new SessionModel({
        meetingId:meetingId,
        start: new Date(), 
        ...sessionData, 
      });

      // Save the new session
      await newSession.save();
      res.status(201).json(newSession);
    } catch (error) {
      res.status(500).json({ message: 'Error creating session' });
    }
  },

  addParticipant: async (req: Request, res: Response): Promise<void> => {
    try {
      const { sessionId } = req.params;
      const participantData: Partial<Participant> = req.body;

      const participantId = crypto.randomBytes(7).toString('hex');
      // Validate sessionId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(sessionId)) {
        res.status(400).json({ message: 'Invalid sessionId' });
        return;
      }

      const session = await SessionModel.findById(sessionId);
      if (!session) {
        res.status(404).json({ message: 'Session not found' });
        return;
      }

      // Create a new participant object with default values
      const newParticipant: Participant = {
        participantId:participantId,
        name: req.body.name,
        events: {
          mic: [],
          webcam: [],
          screenShare: [],
          screenShareAudio: [],
          errors: [],
        },
        timelog: [],
        ...participantData, // Spread the rest of participantData to override defaults if provided
      };

      session.participantArray.push(newParticipant);
      
      // Update uniqueParticipantsCount
      const uniqueParticipantIds = new Set(session.participantArray.map(p => p.participantId));
      session.uniqueParticipantsCount = uniqueParticipantIds.size;

      await session.save();

      res.status(200).json(session);
    } catch (error) {
      console.error('Error adding participant:', error);
      res.status(500).json({ message: 'Error adding participant' });
    }
  },
  logEvent: async (req: Request, res: Response): Promise<void> => {
    try {
      const { sessionId, participantId } = req.params;
      const eventData: Event = req.body;
      const eventType = req.body.eventType as keyof Participant['events'];
      
      const session = await SessionModel.findOne({ meetingId: sessionId });
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
      await session.save();
      
      res.status(200).json({ message: 'Event logged successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error logging event' });
    }
  },

  endSession: async (req: Request, res: Response): Promise<void> => {
    try {
      const { sessionId } = req.params;
      const session = await SessionModel.findOne({ meetingId: sessionId });
      if (!session) {
        res.status(404).json({ message: 'Session not found' });
        return;
      }
      //@ts-ignore
      session.end = new Date();
      await session.save();
      
      res.status(200).json(session);
    } catch (error) {
      res.status(500).json({ message: 'Error ending session' });
    }
  }
};