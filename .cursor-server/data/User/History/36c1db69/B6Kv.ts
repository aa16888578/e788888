export interface MemoryRecord {
  id: string;
  timestamp: number;
  fileName: string;
  content: string;
  category: string;
  tags: string[];
  importance: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  relatedMemories: string[]; // 相關記憶的ID
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

export interface MemoryLogic {
  id: string;
  pattern: string;
  description: string;
  examples: string[];
  category: string;
  confidence: number;
}
