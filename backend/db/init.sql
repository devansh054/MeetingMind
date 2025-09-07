-- MeetingMind Database Schema
-- Initialize PostgreSQL database with required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meetings table
CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'ended', 'cancelled')),
    scheduled_start TIMESTAMP WITH TIME ZONE,
    actual_start TIMESTAMP WITH TIME ZONE,
    actual_end TIMESTAMP WITH TIME ZONE,
    recording_enabled BOOLEAN DEFAULT true,
    transcript_enabled BOOLEAN DEFAULT true,
    ai_insights_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meeting participants
CREATE TABLE meeting_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    display_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    role VARCHAR(20) DEFAULT 'participant' CHECK (role IN ('host', 'participant', 'observer')),
    joined_at TIMESTAMP WITH TIME ZONE,
    left_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transcripts table
CREATE TABLE transcripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    speaker_id UUID REFERENCES meeting_participants(id) ON DELETE SET NULL,
    speaker_name VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    confidence DECIMAL(3,2),
    start_time DECIMAL(10,3) NOT NULL, -- seconds from meeting start
    end_time DECIMAL(10,3) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI insights table
CREATE TABLE ai_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('action_item', 'decision', 'blocker', 'summary', 'sentiment')),
    content TEXT NOT NULL,
    assignee VARCHAR(100),
    due_date DATE,
    priority VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high')),
    confidence DECIMAL(3,2),
    metadata JSONB, -- Additional structured data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Automation rules table
CREATE TABLE automation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN ('meeting_end', 'insight_detected', 'sentiment_threshold')),
    conditions JSONB NOT NULL, -- JSON conditions
    actions JSONB NOT NULL, -- JSON actions (slack, email, calendar, etc.)
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Automation runs table
CREATE TABLE automation_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id UUID NOT NULL REFERENCES automation_rules(id) ON DELETE CASCADE,
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'retrying')),
    result JSONB, -- Execution result and logs
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Integration credentials table (encrypted)
CREATE TABLE integration_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    integration_type VARCHAR(50) NOT NULL CHECK (integration_type IN ('slack', 'email', 'google_calendar', 'notion', 'jira')),
    encrypted_credentials TEXT NOT NULL, -- Encrypted JSON credentials
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, integration_type)
);

-- Meeting analytics table
CREATE TABLE meeting_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    total_duration INTEGER, -- seconds
    participant_talk_time JSONB, -- {participant_id: seconds}
    sentiment_analysis JSONB, -- sentiment over time
    topic_keywords JSONB, -- extracted topics and keywords
    interruption_count INTEGER DEFAULT 0,
    silence_duration INTEGER DEFAULT 0, -- total silence in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_meetings_host_id ON meetings(host_id);
CREATE INDEX idx_meetings_status ON meetings(status);
CREATE INDEX idx_meeting_participants_meeting_id ON meeting_participants(meeting_id);
CREATE INDEX idx_transcripts_meeting_id ON transcripts(meeting_id);
CREATE INDEX idx_transcripts_speaker_id ON transcripts(speaker_id);
CREATE INDEX idx_ai_insights_meeting_id ON ai_insights(meeting_id);
CREATE INDEX idx_ai_insights_type ON ai_insights(type);
CREATE INDEX idx_automation_rules_user_id ON automation_rules(user_id);
CREATE INDEX idx_automation_runs_rule_id ON automation_runs(rule_id);
CREATE INDEX idx_automation_runs_meeting_id ON automation_runs(meeting_id);
CREATE INDEX idx_integration_credentials_user_id ON integration_credentials(user_id);

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON meetings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_automation_rules_updated_at BEFORE UPDATE ON automation_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integration_credentials_updated_at BEFORE UPDATE ON integration_credentials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
