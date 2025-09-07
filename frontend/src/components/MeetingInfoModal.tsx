import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Users, 
  Video,
  Copy,
  ExternalLink
} from "lucide-react";
import toast from "react-hot-toast";

interface Meeting {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  scheduled_start?: string;
  duration?: number;
  attendees?: string[];
  meeting_id?: string;
  host?: string;
  location?: string;
  status?: string;
}

interface MeetingInfoModalProps {
  meeting: Meeting | null;
  isOpen: boolean;
  onClose: () => void;
}

const MeetingInfoModal: React.FC<MeetingInfoModalProps> = ({ 
  meeting, 
  isOpen, 
  onClose 
}) => {
  if (!meeting) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyMeetingId = () => {
    if (meeting.meeting_id) {
      navigator.clipboard.writeText(meeting.meeting_id);
      toast.success('Meeting ID copied to clipboard');
    }
  };

  const copyMeetingLink = () => {
    const meetingLink = `${window.location.origin}/meeting/join/${meeting.meeting_id || meeting.id}`;
    navigator.clipboard.writeText(meetingLink);
    toast.success('Meeting link copied to clipboard');
  };

  const joinMeeting = () => {
    const meetingLink = `/meeting/join/${meeting.meeting_id || meeting.id}`;
    window.open(meetingLink, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-strong border border-white/20">
        <DialogHeader className="pb-4 border-b border-white/20">
          <DialogTitle className="text-xl font-semibold text-white">
            Meeting Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Meeting Title & Status */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {meeting.title}
              </h2>
              <Badge 
                variant="secondary"
                className="bg-slate-600 text-white border-slate-600"
              >
                {meeting.status || 'Scheduled'}
              </Badge>
            </div>
          </div>

          {/* Meeting Access - Glassmorphism Style */}
          <div className="glass p-4 rounded-lg border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <Video className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-white">Meeting Access</h3>
            </div>
            
            {meeting.meeting_id && (
              <div className="mb-4">
                <div className="text-sm font-medium text-white/80 mb-1">Meeting ID</div>
                <div className="flex items-center gap-2">
                  <code className="bg-white/10 border border-white/20 px-3 py-2 rounded text-sm font-mono text-white flex-1">
                    {meeting.meeting_id}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyMeetingId}
                    className="bg-transparent border-white/20 text-white hover:bg-white/10"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                </div>
              </div>
            )}
            
            <div>
              <div className="text-sm font-medium text-white/80 mb-1">Join Link</div>
              <div className="flex items-center gap-2">
                <code className="bg-white/10 border border-white/20 px-3 py-2 rounded text-sm flex-1 text-white break-all">
                  {window.location.origin}/meeting/join/{meeting.meeting_id || meeting.id}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyMeetingLink}
                  className="bg-transparent border-white/20 text-white hover:bg-white/10"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
            </div>
          </div>

          {/* Meeting Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass p-4 rounded-lg border border-white/20">
              <h4 className="font-semibold text-white flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-primary" />
                Date & Time
              </h4>
              <div className="text-sm text-white/80 space-y-1">
                <div>📅 {meeting.scheduled_start ? formatDate(meeting.scheduled_start) : formatDate(meeting.createdAt)}</div>
                <div>🕐 {meeting.scheduled_start ? formatTime(meeting.scheduled_start) : formatTime(meeting.createdAt)}</div>
                {meeting.duration && <div>⏱️ Duration: {meeting.duration} minutes</div>}
              </div>
            </div>
            
            <div className="glass p-4 rounded-lg border border-white/20">
              <h4 className="font-semibold text-white flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-primary" />
                Participants
              </h4>
              <div className="text-sm text-white/80 space-y-1">
                {meeting.host && <div>👤 Host: {meeting.host}</div>}
                <div>👥 {meeting.attendees?.length || 0} attendees invited</div>
                {meeting.attendees && meeting.attendees.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {meeting.attendees.slice(0, 2).map((attendee, index) => (
                      <div key={index} className="text-xs text-white/60">
                        • {attendee}
                      </div>
                    ))}
                    {meeting.attendees.length > 2 && (
                      <div className="text-xs text-white/60">
                        • +{meeting.attendees.length - 2} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {meeting.description && (
            <div className="glass p-4 rounded-lg border border-white/20">
              <h3 className="font-semibold text-white mb-2">Description</h3>
              <p className="text-sm text-white/80 leading-relaxed">
                {meeting.description}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-white/20">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-6 bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              Close
            </Button>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={copyMeetingLink}
                className="flex items-center gap-2 bg-transparent border-white/20 text-white hover:bg-white/10"
              >
                <ExternalLink className="h-4 w-4" />
                Share Link
              </Button>
              <Button
                onClick={joinMeeting}
                className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2 px-6"
              >
                <Video className="h-4 w-4" />
                Join Meeting
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MeetingInfoModal;
