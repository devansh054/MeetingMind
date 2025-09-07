import React, { useState, useEffect } from 'react';
import { aiInsightsService, MeetingInsights, ActionItem, Decision, KeyPoint } from '../services/aiInsights';
import { Brain, CheckCircle, AlertCircle, MessageSquare, Clock, Users, TrendingUp } from 'lucide-react';

interface MeetingInsightsProps {
  transcript: string;
  meetingDuration: number;
}

const MeetingInsightsComponent: React.FC<MeetingInsightsProps> = ({ 
  transcript, 
  meetingDuration 
}) => {
  const [insights, setInsights] = useState<MeetingInsights | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'actions' | 'decisions' | 'points'>('summary');

  // Handle custom events from TranscriptPanel
  useEffect(() => {
    const handleGenerateSummary = () => {
      if (transcript) {
        const newInsights = aiInsightsService.extractInsights(transcript, meetingDuration);
        setInsights(newInsights);
        setActiveTab('summary');
      }
    };

    const handleExtractActionItems = () => {
      if (transcript) {
        const newInsights = aiInsightsService.extractInsights(transcript, meetingDuration);
        setInsights(newInsights);
        setActiveTab('actions');
      }
    };

    const handleAnalyzeSentiment = () => {
      if (transcript) {
        const newInsights = aiInsightsService.extractInsights(transcript, meetingDuration);
        setInsights(newInsights);
        setActiveTab('summary'); // Show sentiment in summary tab
      }
    };

    window.addEventListener('generateSummary', handleGenerateSummary);
    window.addEventListener('extractActionItems', handleExtractActionItems);
    window.addEventListener('analyzeSentiment', handleAnalyzeSentiment);

    return () => {
      window.removeEventListener('generateSummary', handleGenerateSummary);
      window.removeEventListener('extractActionItems', handleExtractActionItems);
      window.removeEventListener('analyzeSentiment', handleAnalyzeSentiment);
    };
  }, [transcript, meetingDuration]);

  // Generate insights when transcript changes
  useEffect(() => {
    console.log('MeetingInsights: Transcript received:', transcript);
    console.log('MeetingInsights: Transcript length:', transcript.length);
    console.log('MeetingInsights: Transcript content:', JSON.stringify(transcript));
    if (transcript.length > 5) { // Reduced threshold for testing
      setIsAnalyzing(true);
      
      // Debounce analysis to avoid too frequent updates
      const timeoutId = setTimeout(() => {
        console.log('MeetingInsights: Extracting insights from:', transcript);
        const newInsights = aiInsightsService.extractInsights(transcript, meetingDuration);
        console.log('MeetingInsights: Generated insights:', newInsights);
        setInsights(newInsights);
        setIsAnalyzing(false);
      }, 1000); // Reduced delay for faster response

      return () => clearTimeout(timeoutId);
    } else {
      console.log('MeetingInsights: Transcript too short, not analyzing');
    }
  }, [transcript, meetingDuration]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'decision': return <CheckCircle className="w-4 h-4" />;
      case 'action': return <AlertCircle className="w-4 h-4" />;
      case 'question': return <MessageSquare className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  if (!insights && !isAnalyzing) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
        <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">AI Insights</h3>
        <p className="text-gray-600">Start speaking to generate meeting insights...</p>
      </div>
    );
  }

  console.log('MeetingInsights: Rendering with insights:', insights);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-gray-900">AI Insights</h3>
          {isAnalyzing && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <div className="animate-spin w-3 h-3 border border-primary-600 border-t-transparent rounded-full"></div>
              Analyzing...
            </div>
          )}
        </div>
        
        {/* Debug info */}
        <div className="text-xs text-gray-400">
          Transcript length: {transcript.length} | Has insights: {insights ? 'Yes' : 'No'}
        </div>
        
        {insights && (
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{insights.participantCount}</span>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(insights.sentiment)}`}>
              {insights.sentiment}
            </div>
          </div>
        )}
      </div>

      {insights && (
        <>
          {/* Tabs */}
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'summary', label: 'Summary', count: null },
                { id: 'actions', label: 'Actions', count: insights.actionItems.length },
                { id: 'decisions', label: 'Decisions', count: insights.decisions.length },
                { id: 'points', label: 'Key Points', count: insights.keyPoints.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count !== null && (
                    <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'summary' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Meeting Summary</h4>
                  <p className="text-gray-700 leading-relaxed">{insights.summary}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Main Topics</h4>
                  {insights.topics && insights.topics.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {insights.topics.map((topic, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No topics detected yet.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'actions' && (
              <div className="space-y-4">
                {insights.actionItems.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No action items detected yet.</p>
                ) : (
                  insights.actionItems.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-gray-900">{item.text}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Assigned to: <span className="font-medium">{item.assignee || 'Unassigned'}</span>
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'decisions' && (
              <div className="space-y-4">
                {insights.decisions.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No decisions detected yet.</p>
                ) : (
                  insights.decisions.map((decision) => (
                    <div key={decision.id} className="border rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-gray-900">{decision.text}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(decision.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'points' && (
              <div className="space-y-4">
                {insights.keyPoints.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No key points detected yet.</p>
                ) : (
                  insights.keyPoints.map((point) => (
                    <div key={point.id} className="border rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        {getCategoryIcon(point.category)}
                        <div className="flex-1">
                          <p className="text-gray-900">{point.text}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="text-xs text-gray-600 capitalize">{point.category}</span>
                            <div className="flex items-center space-x-1">
                              <TrendingUp className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-600">
                                {Math.round(point.importance * 100)}% importance
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MeetingInsightsComponent;
