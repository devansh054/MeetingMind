import React, { useRef, useEffect } from 'react';
import { TranscriptSegment } from '../types';
import { MessageSquare, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface TranscriptPanelProps {
  transcripts: TranscriptSegment[];
  meetingId: string;
}

const TranscriptPanel: React.FC<TranscriptPanelProps> = ({ transcripts, meetingId }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new transcripts arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcripts]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h3 className="font-medium flex items-center">
          <MessageSquare className="w-4 h-4 mr-2" />
          Live Transcript
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          {transcripts.length} segments captured
        </p>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {transcripts.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Transcript will appear here when the meeting starts</p>
          </div>
        ) : (
          transcripts.map((transcript) => (
            <div key={transcript.id} className="group">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {transcript.speakerName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-white">
                      {transcript.speakerName}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {format(new Date(transcript.createdAt), 'HH:mm:ss')}
                    </span>
                    {transcript.confidence && (
                      <span className="text-xs text-gray-500">
                        {Math.round(transcript.confidence * 100)}%
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {transcript.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick actions */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 mb-2">Quick Actions</div>
        <div className="space-y-2">
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('generateSummary', { detail: { transcripts } }))}
            className="w-full text-left text-sm text-gray-300 hover:text-white p-2 rounded hover:bg-gray-700"
          >
            📝 Generate Summary
          </button>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('extractActionItems', { detail: { transcripts } }))}
            className="w-full text-left text-sm text-gray-300 hover:text-white p-2 rounded hover:bg-gray-700"
          >
            ✅ Extract Action Items
          </button>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('analyzeSentiment', { detail: { transcripts } }))}
            className="w-full text-left text-sm text-gray-300 hover:text-white p-2 rounded hover:bg-gray-700"
          >
            📊 Analyze Sentiment
          </button>
        </div>
      </div>
    </div>
  );
};

export default TranscriptPanel;
