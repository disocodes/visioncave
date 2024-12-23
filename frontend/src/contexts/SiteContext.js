import React, { createContext, useContext, useState, useEffect } from 'react';
import * as siteService from '../services/siteService';
import { setDevToken } from '../services/authService';

const SiteContext = createContext();

// Default development site
const DEV_SITE = {
  id: 1,
  name: 'Development Site',
  type: 'development',
  location: 'Local Environment',
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
      
      // Ensure we have a development token before making API calls
      if (process.env.NODE_ENV === 'development') {
        await setDevToken();
      }
      
      const response = await siteService.getSites();
      
      // Ensure we always have the dev site in development
      const allSites = process.env.NODE_ENV === 'development' 
        ? [DEV_SITE, ...response]
        : response;
      
      setSites(allSites);
      
      // If no site is selected, select the first available site
      if (!selectedSite) {
        setSelectedSite(allSites[0]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error loading sites:', err);
      // In case of error, ensure we at least have the dev site in development
      if (process.env.NODE_ENV === 'development') {
        setSites([DEV_SITE]);
        setSelectedSite(DEV_SITE);
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectSite = (siteId) => {
    const site = sites.find(s => s.id === siteId);
    if (site) {
      setSelectedSite(site);
    } else {
      console.warn(`Site with id ${siteId} not found`);
      // Fallback to dev site in development
      if (process.env.NODE_ENV === 'development') {
        setSelectedSite(DEV_SITE);
      }
    }
  };

  const createSite = async (siteData) => {
    try {
      const newSite = await siteService.createSite(siteData);
      setSites(prev => [...prev, newSite]);
      return newSite;
    } catch (err) {
      console.error('Error creating site:', err);
      setError(err.message);
      throw err;
    }
  };

  const updateSite = async (siteId, siteData) => {
    try {
      const updatedSite = await siteService.updateSite(siteId, siteData);
      setSites(prev => prev.map(site => 
        site.id === siteId ? updatedSite : site
      ));
      if (selectedSite?.id === siteId) {
        setSelectedSite(updatedSite);
      }
      return updatedSite;
    } catch (err) {
      console.error('Error updating site:', err);
      setError(err.message);
      throw err;
    }
  };

  const deleteSite = async (siteId) => {
    try {
      await siteService.deleteSite(siteId);
      setSites(prev => prev.filter(site => site.id !== siteId));
      if (selectedSite?.id === siteId) {
        setSelectedSite(sites[0] || DEV_SITE);
      }
    } catch (err) {
      console.error('Error deleting site:', err);
      setError(err.message);
      throw err;
    }
  };

  const value = {
    sites,
    selectedSite,
    loading,
    error,
    loadSites,
    selectSite,
    createSite,
    updateSite,
    deleteSite
  };

  return (
    <SiteContext.Provider value={value}>
      {children}
    </SiteContext.Provider>
  );
};
