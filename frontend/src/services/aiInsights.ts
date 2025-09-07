export interface ActionItem {
  id: string;
  text: string;
  assignee?: string;
  dueDate?: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

export interface Decision {
  id: string;
  text: string;
  timestamp: string;
  context: string;
}

export interface KeyPoint {
  id: string;
  text: string;
  importance: number;
  category: 'discussion' | 'decision' | 'action' | 'question';
}

export interface MeetingInsights {
  summary: string;
  actionItems: ActionItem[];
  decisions: Decision[];
  keyPoints: KeyPoint[];
  sentiment: 'positive' | 'neutral' | 'negative';
  topics: string[];
  duration: number;
  participantCount: number;
}

class AIInsightsService {
  /**
   * Extract insights from meeting transcript using local NLP
   */
  extractInsights(transcript: string, meetingDuration: number = 0): MeetingInsights {
    const sentences = this.splitIntoSentences(transcript);
    
    return {
      summary: this.generateSummary(sentences),
      actionItems: this.extractActionItems(sentences),
      decisions: this.extractDecisions(sentences),
      keyPoints: this.extractKeyPoints(sentences),
      sentiment: this.analyzeSentiment(transcript),
      topics: this.extractTopics(sentences),
      duration: meetingDuration,
      participantCount: 1 // Will be enhanced for multi-user
    };
  }

  /**
   * Split transcript into sentences
   */
  private splitIntoSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  /**
   * Generate meeting summary
   */
  private generateSummary(sentences: string[]): string {
    if (sentences.length === 0) return 'No content to summarize.';
    
    // Simple extractive summarization - take most important sentences
    const importantSentences = sentences
      .filter(s => s.length > 20) // Filter out very short sentences
      .slice(0, 3); // Take first 3 substantial sentences
    
    if (importantSentences.length === 0) {
      return sentences.slice(0, 2).join('. ') + '.';
    }
    
    return importantSentences.join('. ') + '.';
  }

  /**
   * Extract action items from transcript
   */
  private extractActionItems(sentences: string[]): ActionItem[] {
    const actionKeywords = [
      'need to', 'should', 'will', 'must', 'have to', 'going to',
      'action item', 'todo', 'follow up', 'next step', 'assign',
      'deadline', 'by tomorrow', 'by next week', 'complete'
    ];

    const actionItems: ActionItem[] = [];
    
    sentences.forEach((sentence, index) => {
      const lowerSentence = sentence.toLowerCase();
      
      // Check if sentence contains action keywords
      const hasActionKeyword = actionKeywords.some(keyword => 
        lowerSentence.includes(keyword)
      );
      
      if (hasActionKeyword && sentence.length > 10) {
        const priority = this.determinePriority(sentence);
        const assignee = this.extractAssignee(sentence);
        
        actionItems.push({
          id: `action-${index}`,
          text: sentence.trim(),
          assignee,
          priority,
          completed: false
        });
      }
    });

    return actionItems;
  }

  /**
   * Extract decisions from transcript
   */
  private extractDecisions(sentences: string[]): Decision[] {
    const decisionKeywords = [
      'decided', 'agreed', 'conclusion', 'resolved', 'determined',
      'final decision', 'we will', 'going with', 'chosen', 'selected'
    ];

    const decisions: Decision[] = [];
    
    sentences.forEach((sentence, index) => {
      const lowerSentence = sentence.toLowerCase();
      
      const hasDecisionKeyword = decisionKeywords.some(keyword => 
        lowerSentence.includes(keyword)
      );
      
      if (hasDecisionKeyword && sentence.length > 15) {
        decisions.push({
          id: `decision-${index}`,
          text: sentence.trim(),
          timestamp: new Date().toISOString(),
          context: sentences[Math.max(0, index - 1)] || ''
        });
      }
    });

    return decisions;
  }

  /**
   * Extract key points from transcript
   */
  private extractKeyPoints(sentences: string[]): KeyPoint[] {
    const keyPoints: KeyPoint[] = [];
    
    sentences.forEach((sentence, index) => {
      if (sentence.length < 10) return;
      
      const importance = this.calculateImportance(sentence);
      const category = this.categorizePoint(sentence);
      
      if (importance > 0.3) { // Only include moderately important points
        keyPoints.push({
          id: `point-${index}`,
          text: sentence.trim(),
          importance,
          category
        });
      }
    });

    // Sort by importance and return top points
    return keyPoints
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 10);
  }

  /**
   * Analyze sentiment of the transcript
   */
  private analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = [
      'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
      'success', 'achieve', 'progress', 'agree', 'love', 'like', 'happy'
    ];
    
    const negativeWords = [
      'bad', 'terrible', 'awful', 'horrible', 'problem', 'issue', 'concern',
      'worry', 'difficult', 'challenge', 'disagree', 'hate', 'dislike', 'sad'
    ];

    const words = text.toLowerCase().split(/\s+/);
    let positiveScore = 0;
    let negativeScore = 0;

    words.forEach(word => {
      if (positiveWords.includes(word)) positiveScore++;
      if (negativeWords.includes(word)) negativeScore++;
    });

    const totalScore = positiveScore - negativeScore;
    
    if (totalScore > 2) return 'positive';
    if (totalScore < -2) return 'negative';
    return 'neutral';
  }

  /**
   * Extract main topics from transcript
   */
  private extractTopics(sentences: string[]): string[] {
    const text = sentences.join(' ').toLowerCase();
    
    // Extract specific topics mentioned in the transcript
    const topicPatterns = [
      /\b(project|projects)\b/g,
      /\b(meeting|meetings)\b/g,
      /\b(deadline|deadlines)\b/g,
      /\b(integration|integrations)\b/g,
      /\b(algorithm|algorithms)\b/g,
      /\b(structure|structures)\b/g,
      /\b(flowchart|flowcharts|flow chart|flow charts)\b/g,
      /\b(agenda|agendas)\b/g,
      /\b(topic|topics)\b/g,
      /\b(plan|plans|planning)\b/g,
      /\b(development)\b/g,
      /\b(presentation|presentations)\b/g,
      /\b(task|tasks)\b/g,
      /\b(chart|charts)\b/g
    ];
    
    const foundTopics = new Set<string>();
    
    topicPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const topic = match.replace(/s$/, ''); // Remove plural 's'
          foundTopics.add(topic);
        });
      }
    });
    
    // Also extract capitalized words that might be proper nouns/topics
    const originalText = sentences.join(' ');
    const capitalizedWords = originalText.match(/\b[A-Z][a-z]+\b/g) || [];
    capitalizedWords.forEach(word => {
      if (word.length > 3 && !this.isStopWord(word)) {
        foundTopics.add(word.toLowerCase());
      }
    });
    
    // Fallback to word frequency if no specific topics found
    if (foundTopics.size === 0) {
      const words = text.split(/\s+/).filter(word => word.length > 3);
      const wordCount: { [key: string]: number } = {};
      words.forEach(word => {
        wordCount[word] = (wordCount[word] || 0) + 1;
      });
      
      return Object.entries(wordCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([word]) => word)
        .filter(word => !this.isStopWord(word));
    }
    
    return Array.from(foundTopics).slice(0, 8);
  }

  /**
   * Determine priority of action item
   */
  private determinePriority(sentence: string): 'high' | 'medium' | 'low' {
    const highPriorityKeywords = ['urgent', 'asap', 'immediately', 'critical', 'important'];
    const lowPriorityKeywords = ['eventually', 'sometime', 'when possible', 'nice to have'];
    
    const lowerSentence = sentence.toLowerCase();
    
    if (highPriorityKeywords.some(keyword => lowerSentence.includes(keyword))) {
      return 'high';
    }
    
    if (lowPriorityKeywords.some(keyword => lowerSentence.includes(keyword))) {
      return 'low';
    }
    
    return 'medium';
  }

  /**
   * Extract assignee from sentence
   */
  private extractAssignee(sentence: string): string | undefined {
    const assigneePatterns = [
      /\bI need (\w+) to\b/i,
      /\bI want (\w+) to\b/i,
      /\b(\w+) will\b/i,
      /\b(\w+) should\b/i,
      /assign to (\w+)/i,
      /\b(\w+) needs to\b/i,
      /\b(\w+) has to\b/i,
      /\b(\w+) must\b/i,
      /\bgive (\w+) the\b/i,
      /\bassign (\w+) to\b/i
    ];

    for (const pattern of assigneePatterns) {
      const match = sentence.match(pattern);
      if (match && match[1]) {
        const assignee = match[1].toLowerCase();
        // Filter out common pronouns and words that aren't names
        if (!['i', 'we', 'you', 'they', 'he', 'she', 'it', 'this', 'that', 'the', 'and', 'or', 'but', 'will', 'should', 'want', 'give', 'watch', 'mail', 'number', 'all', 'me', 'him', 'her', 'them', 'us'].includes(assignee)) {
          return match[1];
        }
      }
    }

    // Look for proper names (capitalized words) - prioritize common names
    const commonNames = ['Robin', 'Naman', 'Devansh', 'John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa', 'Tom', 'Emma', 'Alex', 'Chris', 'Sam'];
    const namePattern = /\b([A-Z][a-z]+)\b/g;
    const names = sentence.match(namePattern);
    if (names && names.length > 0) {
      // First check for common names
      for (const name of names) {
        if (commonNames.includes(name)) {
          return name;
        }
      }
      
      // Then check for other capitalized words that aren't common words
      for (const name of names) {
        if (!['I', 'The', 'And', 'Or', 'But', 'Will', 'Should', 'Want', 'Give', 'Plan', 'Project', 'Meeting', 'Tomorrow', 'Today', 'Plant', 'City', 'Mr', 'Mrs', 'Ms', 'Dr'].includes(name)) {
          return name;
        }
      }
    }

    return undefined;
  }

  /**
   * Calculate importance score for a sentence
   */
  private calculateImportance(sentence: string): number {
    let score = 0;
    const lowerSentence = sentence.toLowerCase();
    
    // Length factor
    score += Math.min(sentence.length / 100, 0.3);
    
    // Keyword importance
    const importantKeywords = [
      'important', 'critical', 'key', 'main', 'primary', 'essential',
      'decision', 'action', 'result', 'outcome', 'conclusion'
    ];
    
    importantKeywords.forEach(keyword => {
      if (lowerSentence.includes(keyword)) score += 0.2;
    });
    
    // Question factor
    if (sentence.includes('?')) score += 0.1;
    
    return Math.min(score, 1.0);
  }

  /**
   * Categorize a key point
   */
  private categorizePoint(sentence: string): 'discussion' | 'decision' | 'action' | 'question' {
    const lowerSentence = sentence.toLowerCase();
    
    if (sentence.includes('?')) return 'question';
    
    if (lowerSentence.includes('decided') || lowerSentence.includes('agreed')) {
      return 'decision';
    }
    
    if (lowerSentence.includes('will') || lowerSentence.includes('should')) {
      return 'action';
    }
    
    return 'discussion';
  }

  /**
   * Check if word is a stop word
   */
  private isStopWord(word: string): boolean {
    const stopWords = [
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
      'after', 'above', 'below', 'between', 'among', 'this', 'that', 'these',
      'those', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves',
      'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his',
      'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself',
      'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which',
      'who', 'whom', 'whose', 'this', 'that', 'these', 'those', 'am', 'is',
      'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
      'having', 'do', 'does', 'did', 'doing', 'will', 'would', 'could',
      'should', 'may', 'might', 'must', 'can', 'shall'
    ];
    
    return stopWords.includes(word.toLowerCase());
  }
}

export const aiInsightsService = new AIInsightsService();
