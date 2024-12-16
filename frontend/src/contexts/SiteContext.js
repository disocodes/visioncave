import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSites } from '../services/siteService';

const SiteContext = createContext();

// Default development site
const DEV_SITE = {
  id: 'dev-site-1',
  name: 'Development Site',
  type: 'residential',
  status: 'active',
  configuration: {
    widgets: []
  }
};

export const useSite = () => {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error('useSite must be used within a SiteProvider');
  }
  return context;
};

export const SiteProvider = ({ children }) => {
  const [sites, setSites] = useState([DEV_SITE]);
  const [selectedSite, setSelectedSite] = useState(DEV_SITE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      setLoading(true);
      const response = await getSites();
      // In development, always include the dev site
      const allSites = [DEV_SITE, ...response.data];
      setSites(allSites);
      
      // If no site is selected, select the dev site
      if (!selectedSite) {
        setSelectedSite(DEV_SITE);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error loading sites:', err);
      // In case of error, ensure we at least have the dev site
      setSites([DEV_SITE]);
      setSelectedSite(DEV_SITE);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectSite = (siteId) => {
    const site = sites.find(s => s.id === siteId) || DEV_SITE;
    setSelectedSite(site);
  };

  const value = {
    sites,
    selectedSite,
    loading,
    error,
    loadSites,
    selectSite,
  };

  return (
    <SiteContext.Provider value={value}>
      {children}
    </SiteContext.Provider>
  );
};
