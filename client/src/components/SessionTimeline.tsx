import React, { useState } from "react"
import { format } from "date-fns"
import { Camera, Mic, Monitor, WifiOff, Clipboard, LogOut, ScreenShare } from 'lucide-react'
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"
import { SessionTimelineProps, Event } from "../types/timeline"

const SessionTimeline: React.FC<SessionTimelineProps> = ({
  participants,
  startTime,
  endTime
}) => {
  const [showTimeline, setShowTimeline] = useState(true)

  const calculateTimeIntervals = () => {
    const start = new Date(startTime)
    const end = new Date(endTime)
    const duration = end.getTime() - start.getTime()
    const intervalCount = 11 
    const intervalMs = duration / (intervalCount - 1)
    
    return Array.from({ length: intervalCount }, (_, i) => {
      const time = new Date(start.getTime() + (intervalMs * i))
      return time
    })
  }

  const getTimePosition = (time: string) => {
    const date = new Date(time)
    const startDate = new Date(startTime)
    const endDate = new Date(endTime)
    const totalDuration = endDate.getTime() - startDate.getTime()
    const eventTime = date.getTime() - startDate.getTime()
    return `${(eventTime / totalDuration) * 100}%`
  }

  // Group events that occur at similar times
  const groupEvents = (events: Event[]) => {
    const groups: Event[][] = []
    const timeThreshold = 30000 

    events.forEach((event) => {
      const eventTime = new Date(event.timestamp).getTime()
      const existingGroup = groups.find(group => {
        const groupTime = new Date(group[0].timestamp).getTime()
        return Math.abs(eventTime - groupTime) < timeThreshold
      })

      if (existingGroup) {
        existingGroup.push(event)
      } else {
        groups.push([event])
      }
    })

    return groups
  }
  const getEventIcon = (event: Event) => {
    switch (event.type) {
      case 'webcam':
        return <Camera className={cn("h-4 w-4", event.status ? "text-blue-500" : "text-gray-500")} />
      case 'mic':
        return <Mic className={cn("h-4 w-4", event.status ? "text-blue-500" : "text-gray-500")} />
      case 'screenShare':
      case 'screenShareAudio':
        return <ScreenShare className={cn("h-4 w-4", event.status ? "text-blue-500" : "text-gray-500")} />
      case 'error':
      case 'disconnect':
        return <WifiOff className="h-4 w-4 text-red-500" />
      case 'join':
        return <Monitor className="h-4 w-4 text-green-500" />
      case 'leave':
        return <LogOut className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  const renderEventConnections = (participant: SessionTimelineProps['participants'][0]) => {
    return participant.events.map((event, index) => {
      const nextEvent = participant.events[index + 1]
      if (!nextEvent) return null

      const isDashed = event.type === 'leave' || nextEvent.type === 'join'

      return (
        <div
          key={`connection-${index}`}
          className={cn(
            "absolute top-1/2 h-0.5",
            isDashed ? "border-t-2 border-dashed border-violet-600/50" : "bg-violet-600"
          )}
          style={{
            left: getTimePosition(event.timestamp),
            right: `calc(100% - ${getTimePosition(nextEvent.timestamp)})`,
            transform: "translateY(-50%)"
          }}
        />
      )
    })
  }

  const timeIntervals = calculateTimeIntervals()

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
              <div className="grid grid-cols-11 gap-4 mb-4 text-sm text-gray-400">
                {timeIntervals.map((time, i) => (
                  <div key={i} className="text-center">
                    {format(time, 'HH:mm')}
                  </div>
                ))}
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
                      {renderEventConnections(participant)}
                      {groupEvents(participant.events).map((eventGroup, groupIndex) => (
                        <div
                          key={groupIndex}
                          className="absolute top-1/2 -translate-y-1/2 z-10 flex -ml-3"
                          style={{ left: getTimePosition(eventGroup[0].timestamp) }}
                        >
                          {eventGroup.map((event, eventIndex) => (
                            <TooltipProvider key={eventIndex}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className={cn(
                                    "relative",
                                    eventIndex > 0 && "-ml-2"
                                  )}>
                                    <Avatar className={cn(
                                      "h-6 w-6 bg-gray-800 border-2",
                                      event.type === 'error' ? "border-red-500" :
                                      event.type === 'join' ? "border-green-500" :
                                      event.type === 'leave' ? "border-yellow-500" :
                                      "border-violet-500"
                                    )}>
                                      <AvatarFallback>
                                        {getEventIcon(event)}
                                      </AvatarFallback>
                                    </Avatar>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p>{format(new Date(event.timestamp), 'HH:mm:ss')}</p>
                                  <p className="capitalize">{event.type}</p>
                                  {event.message && <p>{event.message}</p>}
                                  {event.endTime && (
                                    <p>End: {format(new Date(event.endTime), 'HH:mm:ss')}</p>
                                  )}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
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