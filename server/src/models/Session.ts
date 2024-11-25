import mongoose, { Schema, Document } from 'mongoose';
import { IParticipant } from './Participant';

export interface ISession extends Document {
  meetingId: string;
  start: Date;
  end?: Date;
  uniqueParticipantsCount: number;
  participantArray: IParticipant[];
}

const SessionSchema = new Schema<ISession>({
  meetingId: { type: String, required: true, unique: true },
  start: { type: Date, required: true },
  end: { type: Date },
  uniqueParticipantsCount: { type: Number, default: 0 },
  participantArray: [{ type: Schema.Types.ObjectId, ref: 'Participant' }]
});

export default mongoose.model<ISession>('Session', SessionSchema);

