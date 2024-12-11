import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAnalytics, getDetectionEvents } from '../services/analyticsService';

const AnalyticsContext = createContext();

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

export const AnalyticsProvider = ({ children }) => {
  const [analytics, setAnalytics] = useState({});
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [filters, setFilters] = useState({});

  useEffect(() => {
    loadAnalytics();
    loadEvents();
  }, [timeRange, filters]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await getAnalytics({
        timeRange,
        ...filters,
      });
      setAnalytics(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const response = await getDetectionEvents({
        timeRange,
        ...filters,
      });
      setEvents(response.data);
    } catch (err) {
      console.error('Error loading events:', err);
    }
  };

  const updateTimeRange = (newRange) => {
    setTimeRange(newRange);
  };

  const updateFilters = (newFilters) => {
    setFilters(newFilters);
  };

  const value = {
    analytics,
    events,
    loading,
    error,
    timeRange,
    filters,
    loadAnalytics,
    loadEvents,
    updateTimeRange,
    updateFilters,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};
