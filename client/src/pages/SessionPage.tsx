import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import SessionTimeline from "../components/SessionTimeline"
import { Participant, Event } from "../types/timeline"

const SessionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [sessionData, setSessionData] = useState<{
    participants: Participant[];
    startTime: string;
    endTime: string;
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/sessions/${id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch session data')
        }
        const session = await response.json()

        const transformedData = {
          participants: session.participantArray?.map((p: any) => {
            const firstJoin = p.timelog[0]?.start;
            const lastLeave = p.timelog[p.timelog.length - 1]?.end;
        
            return {
              id: p.participantId,
              name: p.name,
              joinTime: firstJoin || session.start,
              duration: lastLeave
                ? ((new Date(lastLeave).getTime() - new Date(firstJoin).getTime()) / 1000 / 60).toFixed(2)
                : "Ongoing",
              events: [
                ...p.timelog.flatMap((log: any) => [
                  {
                    type: 'join',
                    timestamp: log.start,
                    endTime: log.end
                  }
                ]),
                ...(p.events.mic?.map((e: any) => ({
                  type: 'mic',
                  timestamp: e.start,
                  status: !e.end,
                  endTime: e.end
                })) || []),
                ...(p.events.webcam?.map((e: any) => ({
                  type: 'webcam',
                  timestamp: e.start,
                  status: !e.end,
                  endTime: e.end
                })) || []),
                ...(p.events.screenShare?.map((e: any) => ({
                  type: 'screenShare',
                  timestamp: e.start,
                  status: !e.end,
                  endTime: e.end
                })) || []),
                ...(p.events.screenShareAudio?.map((e: any) => ({
                  type: 'screenShareAudio',
                  timestamp: e.start,
                  status: !e.end,
                  endTime: e.end
                })) || []),
                ...(p.events.errors?.map((e: any) => ({
                  type: 'error',
                  timestamp: e.start,
                  message: e.message
                })) || []),
                { type: 'leave', timestamp: lastLeave || session.end || new Date().toISOString() }
              ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) as Event[]
            }
          }) || [],
          startTime: session.start,
          endTime: session.end || new Date().toISOString()
        }
        
        setSessionData(transformedData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchSessionData()
  }, [id])

  if (loading) {
    return <div className="p-6 text-center">Loading session data...</div>
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>
  }

  if (!sessionData) {
    return <div className="p-6 text-center">No session data available</div>
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <SessionTimeline {...sessionData} />
    </div>
  )
}

export default SessionPage

