export interface Event {
  type: 'join' | 'leave' | 'webcam' | 'mic' | 'screenShare' | 'screenShareAudio' | 'error' | 'disconnect';
  timestamp: string;
  status?: boolean;
  message?: string;
  endTime?: string;
}

export interface Participant {
  id: string;
  name: string;
  joinTime: string;
  duration: string;
  events: Event[];
}
export interface Session {
  _id: string;
  meetingId: string;
  start: string;
  end: string | null;
  uniqueParticipantsCount: number;
}

export interface SessionTimelineProps {
  participants: Participant[];
  startTime: string;
  endTime: string;
}

