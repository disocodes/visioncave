import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { widgetService } from '../services/widgetService';
import { useSite } from './SiteContext';

const WidgetContext = createContext();

export const useWidget = () => {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error('useWidget must be used within a WidgetProvider');
  }
  return context;
};

export const WidgetProvider = ({ children }) => {
  const [widgets, setWidgets] = useState([]);
  const [customWidgets, setCustomWidgets] = useState({});
  const [isAnyWidgetFullscreen, setIsAnyWidgetFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentModule, setCurrentModule] = useState(null);

  // Load widgets for current module
  const loadWidgets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(`Loading widgets for module ${currentModule}`);
      const data = await widgetService.getWidgets(currentModule);
      console.log('Loaded widgets:', data);
      setWidgets(data);
    } catch (err) {
      console.error('Failed to load widgets:', err);
      setError('Failed to load widgets');
    } finally {
      setLoading(false);
    }
  }, [currentModule]);

  // Load custom widgets for a specific module
  const getCustomWidgets = useCallback(async (module) => {
    try {
      if (customWidgets[module]) {
        return customWidgets[module];
      }

      console.log(`Loading custom widgets for module: ${module}`);
      const data = await widgetService.getCustomWidgets(module);
      console.log('Loaded custom widgets:', data);
      setCustomWidgets(prev => ({
        ...prev,
        [module]: data
      }));
      return data;
    } catch (err) {
      console.error('Failed to load custom widgets:', err);
      return [];
    }
  }, [customWidgets]);

  // Load widgets when site or module changes
  useEffect(() => {
    loadWidgets();
  }, [loadWidgets]);

  // Create a new widget
  const createWidget = async (widgetData) => {
    try {
      console.log('Creating widget:', widgetData);
      const newWidget = await widgetService.createWidget({
        ...widgetData,
        module: currentModule
      });
      console.log('Widget created:', newWidget);
      setWidgets(prev => [...prev, newWidget]);
      return newWidget;
    } catch (err) {
      console.error('Failed to create widget:', err);
      setError('Failed to create widget');
      throw err;
    }
  };

  // Update a widget
  const updateWidget = async (widgetId, widgetData) => {
    try {
      console.log(`Updating widget ${widgetId}:`, widgetData);
      const updatedWidget = await widgetService.updateWidget(widgetId, widgetData);
      console.log('Widget updated:', updatedWidget);
      setWidgets(prev => prev.map(w => 
        w.id === widgetId ? updatedWidget : w
      ));
      return updatedWidget;
    } catch (err) {
      console.error('Failed to update widget:', err);
      setError('Failed to update widget');
      throw err;
    }
  };

  // Delete a widget
  const deleteWidget = async (widgetId) => {
    try {
      console.log(`Deleting widget ${widgetId}`);
      await widgetService.deleteWidget(widgetId);
      setWidgets(prev => prev.filter(w => w.id !== widgetId));
    } catch (err) {
      console.error('Failed to delete widget:', err);
      setError('Failed to delete widget');
      throw err;
    }
  };

  // Handle widget reordering
  const handleWidgetReorder = async (dragIndex, dropIndex) => {
    console.log(`Reordering widget from ${dragIndex} to ${dropIndex}`);
    const reorderedWidgets = [...widgets];
    const [draggedWidget] = reorderedWidgets.splice(dragIndex, 1);
    reorderedWidgets.splice(dropIndex, 0, draggedWidget);

    // Calculate new order values
    const widgetOrders = {};
    reorderedWidgets.forEach((widget, index) => {
      const prevOrder = index > 0 ? reorderedWidgets[index - 1].order : null;
      const nextOrder = index < reorderedWidgets.length - 1 ? reorderedWidgets[index + 1].order : null;
      widgetOrders[widget.id] = widgetService.calculateNewOrder(prevOrder, nextOrder);
    });

    try {
      await widgetService.reorderWidgets(widgetOrders);
      setWidgets(reorderedWidgets.map((w, i) => ({
        ...w,
        order: widgetOrders[w.id]
      })));
    } catch (err) {
      console.error('Failed to reorder widgets:', err);
      setError('Failed to reorder widgets');
      loadWidgets(); // Reload original order on error
    }
  };

  // Update widget position
  const updateWidgetPosition = async (widgetId, position) => {
    try {
      console.log(`Updating position for widget ${widgetId}:`, position);
      const widget = widgets.find(w => w.id === widgetId);
      if (!widget) {
        console.warn(`Widget ${widgetId} not found`);
        return;
      }

      const updatedWidget = await widgetService.updateWidgetPosition(
        widgetId,
        position,
        widget.order
      );
      console.log('Widget position updated:', updatedWidget);
      
      setWidgets(prev => prev.map(w => 
        w.id === widgetId ? updatedWidget : w
      ));
    } catch (err) {
      console.error('Failed to update widget position:', err);
      setError('Failed to update widget position');
      throw err;
    }
  };

  const value = {
    widgets,
    loading,
    error,
    isAnyWidgetFullscreen,
    currentModule,
    setCurrentModule,
    setIsAnyWidgetFullscreen,
    createWidget,
    updateWidget,
    deleteWidget,
    handleWidgetReorder,
    updateWidgetPosition,
    refreshWidgets: loadWidgets,
    getCustomWidgets
  };

  return (
    <WidgetContext.Provider value={value}>
      {children}
    </WidgetContext.Provider>
  );
};
