const API_BASE = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // Journal endpoints
  journals: {
    getAll: () => request<any[]>('/journals'),
    getById: (id: number) => request<any>(`/journals/${id}`),
    create: (data: any) => request<any>('/journals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: number, data: any) => request<any>(`/journals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: number) => request<void>(`/journals/${id}`, { method: 'DELETE' }),
    getStats: () => request<any>('/journals/stats'),
    getMoodTrend: (days: number = 30) => request<any[]>(`/journals/mood-trend?days=${days}`),
  },

  // Goal endpoints
  goals: {
    getAll: () => request<any[]>('/goals'),
    getById: (id: number) => request<any>(`/goals/${id}`),
    create: (data: any) => request<any>('/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: number, data: any) => request<any>(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: number) => request<void>(`/goals/${id}`, { method: 'DELETE' }),
    getStats: () => request<any>('/goals/stats'),
    getOverdue: () => request<any[]>('/goals/overdue'),
  },

  // Habit endpoints
  habits: {
    getAll: () => request<any[]>('/habits'),
    getById: (id: number) => request<any>(`/habits/${id}`),
    create: (data: any) => request<any>('/habits', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: number, data: any) => request<any>(`/habits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: number) => request<void>(`/habits/${id}`, { method: 'DELETE' }),
    complete: (id: number, note?: string) => request<any>(`/habits/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    }),
    getLogs: (id: number, limit?: number) =>
      request<any[]>(`/habits/${id}/logs${limit ? `?limit=${limit}` : ''}`),
    getTodayStats: () => request<any>('/habits/today-stats'),
  },

  // Insight endpoints
  insights: {
    getAll: () => request<any[]>('/insights'),
    getUnread: () => request<any[]>('/insights/unread'),
    generate: () => request<any[]>('/insights/generate', { method: 'POST' }),
    markAsRead: (id: number) => request<void>(`/insights/${id}/read`, { method: 'PUT' }),
    delete: (id: number) => request<void>(`/insights/${id}`, { method: 'DELETE' }),
  },

  // Pattern endpoints
  patterns: {
    getAll: () => request<any[]>('/patterns'),
    getById: (id: number) => request<any>(`/patterns/${id}`),
    analyze: () => request<any[]>('/patterns/analyze', { method: 'POST' }),
    delete: (id: number) => request<void>(`/patterns/${id}`, { method: 'DELETE' }),
  },

  // Git endpoints
  git: {
    getAll: () => request<any[]>('/git'),
    getStats: () => request<any>('/git/stats'),
    getInsights: () => request<any>('/git/insights'),
    import: (repoPath: string, days?: number) => request<any>('/git/import', {
      method: 'POST',
      body: JSON.stringify({ repoPath, days }),
    }),
  },
};
