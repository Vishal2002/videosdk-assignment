export interface Session {
    meetingId: string;
    start: string;
    end: string;
    uniqueParticipantsCount: number;
    participantArray: Participant[];
  }
  
  export interface Participant {
    participantId: string;
    name: string;
    events: {
      mic: Event[];
      webcam: Event[];
      screenShare: Event[];
      screenShareAudio: Event[];
      errors?: ErrorEvent[];
    };
    timelog: Event[];
  }
  
  export interface Event {
    start: string;
    end: string;
  }
  
  export interface ErrorEvent {
    start: string;
    message: string;
  }