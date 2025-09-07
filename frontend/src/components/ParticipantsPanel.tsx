import React from 'react';
import { Users, Mic, MicOff, Video, VideoOff, Crown } from 'lucide-react';

interface Participant {
  userId: string;
  displayName: string;
  isOnline: boolean;
}

interface ParticipantsPanelProps {
  participants: Participant[];
}

const ParticipantsPanel: React.FC<ParticipantsPanelProps> = ({ participants }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h3 className="font-medium flex items-center">
          <Users className="w-4 h-4 mr-2" />
          Participants
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          {participants.filter(p => p.isOnline).length} online
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {participants.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No participants yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {participants.map((participant) => (
              <div key={participant.userId} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700">
                <div className="relative">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {participant.displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${
                    participant.isOnline ? 'bg-green-500' : 'bg-gray-500'
                  }`}></div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-medium text-white truncate">
                      {participant.displayName}
                    </span>
                    <Crown className="w-3 h-3 text-yellow-500" />
                  </div>
                  <p className="text-xs text-gray-400">
                    {participant.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>

                <div className="flex space-x-1">
                  <Mic className="w-4 h-4 text-green-400" />
                  <Video className="w-4 h-4 text-green-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite section */}
      <div className="p-4 border-t border-gray-700">
        <button className="w-full btn-primary text-sm">
          <Users className="w-4 h-4 mr-2" />
          Invite Participants
        </button>
      </div>
    </div>
  );
};

export default ParticipantsPanel;
