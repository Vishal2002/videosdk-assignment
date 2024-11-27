import { Request, Response } from 'express';
import SessionModel from '../models/Session';
import { Session, Participant, Event, ErrorEvent } from '../types/session';
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
      const session = await SessionModel.findById(id);
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
      const { eventType, action, message } = req.body;
  
      // Validate sessionId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(sessionId)) {
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
  
      const session = await SessionModel.findById(sessionId);
      if (!session) {
        res.status(404).json({ message: 'Session not found' });
        return;
      }
  
      const participant = session.participantArray.find(
        p => p.participantId === participantId
      );
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
        } else if (eventType === 'exit') {
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
        const errorEvent: ErrorEvent = {
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
  
        const eventArray = participant.events[eventType as keyof Omit<Participant['events'], 'errors'>];
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
        } else if (action === 'stop') {
          const lastEvent = eventArray[eventArray.length - 1];
          if (!lastEvent || lastEvent.end) {
            res.status(400).json({ message: `Cannot stop a ${eventType} event that hasn't started or is already stopped` });
            return;
          }
          lastEvent.end = currentTime;
        }
      }
  
      await session.save();
  
      res.status(200).json({ 
        message: 'Event logged successfully',
        timelog: participant.timelog 
      });
  
    } catch (error) {
      console.error('Error logging event:', error);
      res.status(500).json({ message: 'Error logging event' });
    }
  },

  endSession: async (req: Request, res: Response): Promise<void> => {
    try {
      const { sessionId } = req.params;
      const session = await SessionModel.findById(sessionId);
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