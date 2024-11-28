import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Session } from '../types/timeline';

const SessionListTable: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/sessions');
        if (!response.ok) {
          throw new Error('Failed to fetch session data');
        }
        const data = await response.json();
        setSessions(data.sessions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const handleSessionClick = (sessionId: string) => {
    navigate(`/sessions/${sessionId}`);
  };

  if (loading) {
    return <div className="p-6 text-center">Loading session data...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Session List</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Meeting ID</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>End Time</TableHead>
            <TableHead>Participants</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
            <TableRow key={session._id}>
              <TableCell>{session.meetingId}</TableCell>
              <TableCell>{new Date(session.start).toLocaleString()}</TableCell>
              <TableCell>
                {session.end ? new Date(session.end).toLocaleString() : 'Ongoing'}
              </TableCell>
              <TableCell>{session.uniqueParticipantsCount}</TableCell>
              <TableCell>
                <Button onClick={() => handleSessionClick(session._id)}>
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SessionListTable;

