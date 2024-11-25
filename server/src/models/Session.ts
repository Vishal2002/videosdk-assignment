import mongoose, { Schema, Document } from 'mongoose';
import { Session, Participant, Event, ErrorEvent } from '../types/session';

const EventSchema: Schema = new Schema({
  start: { type: Date, required: true },
  end: { type: Date, required: true },
});

const ErrorEventSchema: Schema = new Schema({
  start: { type: Date, required: true },
  message: { type: String, required: true },
});

const ParticipantSchema: Schema = new Schema({
  participantId: { type: String },
  name: { type: String, required: true },
  events: {
    mic: [EventSchema],
    webcam: [EventSchema],
    screenShare: [EventSchema],
    screenShareAudio: [EventSchema],
    errors: [ErrorEventSchema],
  },
  timelog: [EventSchema],
});

const SessionSchema: Schema = new Schema({
  meetingId: { type: String, unique: true },
  start: { type: Date, required: true },
  end: { type: Date },
  uniqueParticipantsCount: { type: Number, default: 0 },
  participantArray: [ParticipantSchema],
});

export default mongoose.model<Session & Document>('Session', SessionSchema);