export interface TimelineEvent {
    type: 'join' | 'leave' | 'video' | 'audio' | 'screenShare' | 'screenShareAudio' | 'error' | 'disconnect'
    timestamp: string
    status?: boolean
    message?: string
    endTime?: string
  }
  
  export interface Participant {
    id: string
    name: string
    joinTime: string
    duration: string
    events: TimelineEvent[]
  }
  
  