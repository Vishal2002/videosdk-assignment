import { Request, Response } from 'express';
import SessionModel from '../models/Session';
import { Session, Participant, Event } from '../types/session';

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
      const sessionData: Session = req.body;
      const newSession = new SessionModel(sessionData);
      await newSession.save();
      res.status(201).json(newSession);
    } catch (error) {
      res.status(500).json({ message: 'Error creating session' });
    }
  },

  addParticipant: async (req: Request, res: Response): Promise<void> => {
    try {
      const { sessionId } = req.params;
      const participantData: Participant = req.body;
      
      const session = await SessionModel.findOne({ meetingId: sessionId });
      if (!session) {
        res.status(404).json({ message: 'Session not found' });
        return;
      }
      
      session.participantArray.push(participantData);
      session.uniqueParticipantsCount = session.participantArray.length;
      await session.save();
      
      res.status(200).json(session);
    } catch (error) {
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