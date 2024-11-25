import mongoose, { Schema, Document } from 'mongoose';

interface IEvent {
  start: Date;
  end?: Date;
  message?: string;
}

interface ITimelog {
  start: Date;
  end: Date;
}

export interface IParticipant extends Document {
  participantId: string;
  name: string;
  events: {
    mic: IEvent[];
    webcam: IEvent[];
    screenShare: IEvent[];
    screenShareAudio: IEvent[];
    errors: IEvent[];
  };
  timelog: ITimelog[];
}

const EventSchema = new Schema<IEvent>({
  start: { type: Date, required: true },
  end: { type: Date },
  message: { type: String }
}, { _id: false });

const TimelogSchema = new Schema<ITimelog>({
  start: { type: Date, required: true },
  end: { type: Date, required: true }
}, { _id: false });

const ParticipantSchema = new Schema<IParticipant>({
  participantId: { type: String, required: true },
  name: { type: String, required: true },
  events: {
    mic: [EventSchema],
    webcam: [EventSchema],
    screenShare: [EventSchema],
    screenShareAudio: [EventSchema],
    errors: [EventSchema]
  },
  timelog: [TimelogSchema]
});

export default mongoose.model<IParticipant>('Participant', ParticipantSchema);

