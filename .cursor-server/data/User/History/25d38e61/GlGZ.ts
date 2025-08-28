import { useState, useEffect } from 'react';

interface HealthStatus {
  success: boolean;
  message: string;
  timestamp: string;
  status: string;
  version: string;
  environment: string;
}

interface HealthCheckResult {
  isLoading: boolean;
  isHealthy: boolean;
  data: HealthStatus | null;
  error: string | null;
  lastChecked: Date | null;
  refresh: () => void;
}

export function useHealthCheck(autoRefresh = false, interval = 30000): HealthCheckResult {
  const [isLoading, setIsLoading] = useState(true);
  const [isHealthy, setIsHealthy] = useState(false);
  const [data, setData] = useState<HealthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkHealth = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: HealthStatus = await response.json();
      
      setData(result);
      setIsHealthy(result.success);
      setLastChecked(new Date());
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setIsHealthy(false);
      setData(null);
      setLastChecked(new Date());
    } finally {
      setIsLoading(false);
    }
  };

  // 初始化時檢查一次
  useEffect(() => {
    checkHealth();
  }, []);

  // 自動刷新
  useEffect(() => {
    if (!autoRefresh) return;

    const timer = setInterval(checkHealth, interval);
    return () => clearInterval(timer);
  }, [autoRefresh, interval]);

  return {
    isLoading,
    isHealthy,
    data,
    error,
    lastChecked,
    refresh: checkHealth,
  };
}
