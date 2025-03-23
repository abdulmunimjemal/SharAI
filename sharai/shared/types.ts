// Source citation type for answers
export interface Source {
  title: string;
  text: string;
}

// Document format for vector database
export interface VectorDocument {
  id: string;
  title: string;
  content: string;
  type: string;
  sources: Source[];
  metadata?: Record<string, any>;
}

// Stats for dashboard
export interface Stats {
  totalQuestions: number;
  apiRequests: number;
  documentsCount: number;
  systemHealth: string;
}

// Health monitoring type
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  lastCheck: Date;
  services: {
    [key: string]: {
      status: 'healthy' | 'degraded' | 'down';
      latency: number;
    };
  };
}

// API Key usage statistics
export interface ApiKeyUsage {
  requests: number;
  cost: number;
  limit: string;
}
