import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  analytics: {
    occupancy: [],
    traffic: [],
    safety: [],
    equipment: [],
  },
  zones: [],
  alerts: [],
  trafficFlow: {
    currentFlow: 0,
    flowChange: 0,
    avgSpeed: 0,
    speedChange: 0,
    congestionLevel: 0,
    congestionChange: 0,
    hourlyData: [],
    lastUpdated: null
  }
};

export const widgetDataSlice = createSlice({
  name: 'widgetData',
  initialState,
  reducers: {
    updateAnalytics: (state, action) => {
      state.analytics = { ...state.analytics, ...action.payload };
    },
    updateZones: (state, action) => {
      state.zones = action.payload;
    },
    addZone: (state, action) => {
      state.zones.push(action.payload);
    },
    removeZone: (state, action) => {
      state.zones = state.zones.filter(zone => zone.id !== action.payload);
    },
    updateZone: (state, action) => {
      const index = state.zones.findIndex(zone => zone.id === action.payload.id);
      if (index !== -1) {
        state.zones[index] = action.payload;
      }
    },
    addAlert: (state, action) => {
      state.alerts.push(action.payload);
    },
    clearAlerts: (state) => {
      state.alerts = [];
    },
    updateTrafficFlowData: (state, action) => {
      state.trafficFlow = {
        ...state.trafficFlow,
        ...action.payload,
        lastUpdated: new Date().toISOString()
      };
    }
  },
});

export const {
  updateAnalytics,
  updateZones,
  addZone,
  removeZone,
  updateZone,
  addAlert,
  clearAlerts,
  updateTrafficFlowData
} = widgetDataSlice.actions;

export default widgetDataSlice.reducer;
