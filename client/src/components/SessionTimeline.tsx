import React, { useState } from "react"
import { format } from "date-fns"
import { Camera, Mic,Monitor,WifiOff, Wifi,Clipboard,LogOut } from 'lucide-react'
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Participant, TimelineEvent } from "../types/timeline"
import { Link } from "react-router-dom"

interface SessionTimelineProps {
  participants: Participant[]
  startTime: string
  endTime: string
}

const SessionTimeline: React.FC<SessionTimelineProps> = ({ 
  participants, 
  startTime, 
  endTime 
}) => {
  const [showTimeline, setShowTimeline] = useState(true)

  const getTimePosition = (time: string) => {
    const date = new Date(time)
    const startDate = new Date(startTime)
    const endDate = new Date(endTime)
    const totalDuration = endDate.getTime() - startDate.getTime()
    const eventTime = date.getTime() - startDate.getTime()
    return `${(eventTime / totalDuration) * 100}%`
  }

  const getEventIcon = (type: TimelineEvent['type'], status?: boolean) => {
    switch (type) {
      case 'video':
        return <Camera className={cn("h-4 w-4", status ? "text-blue-500" : "text-gray-500")} />
      case 'audio':
        return <Mic className={cn("h-4 w-4", status ? "text-blue-500" : "text-gray-500")} />
      case 'screenShare':
      case 'screenShareAudio':
        return <Monitor className={cn("h-4 w-4", status ? "text-blue-500" : "text-gray-500")} />
      case 'error':
      case 'disconnect':
        return <WifiOff className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full bg-gray-950 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
           <Clipboard className="h-4 w-4" />
            Participants wise Session Timeline
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm">Show participant timeline</span>
            <Switch
              checked={showTimeline}
              onCheckedChange={setShowTimeline}
              className="data-[state=checked]:bg-violet-500"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {showTimeline && (
            <div className="relative">
              <div className="grid grid-cols-11 gap-0 mb-4 text-sm text-gray-400">
                {Array.from({ length: 11 }, (_, i) => {
                  const time = new Date(startTime)
                  time.setMinutes(time.getMinutes() + i * 2)
                  return (
                    <div key={i} className="text-center">
                      {format(time, 'HH:mm')}
                    </div>
                  )
                })}
              </div>

              <div className="space-y-8">
                {participants.map((participant) => (
                  <div key={participant.id} className="relative">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h3 className="font-medium">
                          {participant.name} ({participant.id})
                        </h3>
                        <p className="text-sm text-gray-400">
                          {format(new Date(participant.joinTime), 'dd MMMM yyyy, HH:mm')} |{' '}
                          Duration {participant.duration} Mins
                        </p>
                      </div>
                  <Link 
                  to={`/sessions/${participant.id}/details`} 
                  className="text-blue-500"
                >
                  View details →
                </Link>
                    
                    </div>

                    <div className="h-12 relative border-t border-b border-gray-800">
                      <div className="absolute inset-0 bg-blue-500/10 rounded-full" />
                      {participant.events.map((event, index) => (
                        <React.Fragment key={index}>
                          {index > 0 && (
                            <div
                              className="absolute top-1/2 h-0.5 bg-violet-600"
                              style={{
                                left: getTimePosition(participant.events[index - 1].timestamp),
                                right: `calc(100% - ${getTimePosition(event.timestamp)})`,
                              }}
                            />
                          )}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className="absolute top-1/2 -translate-y-1/2 z-10"
                                  style={{ left: getTimePosition(event.timestamp) }}
                                >
                                  <Avatar className="h-6 w-6 bg-gray-800 border-2 border-blue-500">
                                    <AvatarFallback>
                                      {getEventIcon(event.type, event.status)}
                                    </AvatarFallback>
                                  </Avatar>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p>{format(new Date(event.timestamp), 'HH:mm')}</p>
                                {event.message && <p>{event.message}</p>}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default SessionTimeline

