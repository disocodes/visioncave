import axios from 'axios';
import { API_BASE_URL, WS_BASE_URL } from '../config';

class WidgetService {
    constructor() {
        this.baseUrl = `${API_BASE_URL}/api/v1/widgets`;
        this.websockets = new Map(); // Store WebSocket connections by site ID
    }

    // CRUD Operations
    async createWidget(widgetData) {
        try {
            console.log('Creating widget with data:', widgetData);
            const response = await axios.post(this.baseUrl, {
                name: widgetData.name || widgetData.title,
                type: widgetData.type,
                site_id: widgetData.site_id,
                owner_id: widgetData.owner_id || 1, // Default to 1 for development
                config: widgetData.config || {},
                module: widgetData.module || 'default',
                description: widgetData.description,
                position: widgetData.position || {
                    x: 0,
                    y: 0,
                    w: 1,
                    h: 1
                },
                order: widgetData.order
            });
            console.log('Widget created successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('Failed to create widget:', error.response?.data || error.message);
            throw new Error(error.response?.data?.detail || 'Failed to create widget');
        }
    }

    async getWidget(widgetId) {
        try {
            const response = await axios.get(`${this.baseUrl}/${widgetId}`);
            return response.data;
        } catch (error) {
            console.error('Failed to get widget:', error.response?.data || error.message);
            throw new Error(error.response?.data?.detail || 'Failed to get widget');
        }
    }

    async getWidgets(siteId, module) {
        try {
            const params = {};
            if (siteId) params.site_id = siteId;
            if (module) params.module = module;
            
            const response = await axios.get(this.baseUrl, { params });
            return response.data;
        } catch (error) {
            console.error('Failed to get widgets:', error.response?.data || error.message);
            throw new Error(error.response?.data?.detail || 'Failed to get widgets');
        }
    }

    async getCustomWidgets(module) {
        try {
            const response = await axios.get(`${this.baseUrl}/custom`, {
                params: { module }
            });
            return response.data;
        } catch (error) {
            console.error('Failed to get custom widgets:', error.response?.data || error.message);
            throw new Error(error.response?.data?.detail || 'Failed to get custom widgets');
        }
    }

    async updateWidget(widgetId, widgetData) {
        try {
            // Only send fields that are allowed to be updated
            const updateData = {
                name: widgetData.name,
                config: widgetData.config,
                description: widgetData.description,
                position: widgetData.position,
                order: widgetData.order,
                status: widgetData.status
            };
            
            // Remove undefined fields
            Object.keys(updateData).forEach(key => 
                updateData[key] === undefined && delete updateData[key]
            );

            const response = await axios.put(`${this.baseUrl}/${widgetId}`, updateData);
            return response.data;
        } catch (error) {
            console.error('Failed to update widget:', error.response?.data || error.message);
            throw new Error(error.response?.data?.detail || 'Failed to update widget');
        }
    }

    async deleteWidget(widgetId) {
        try {
            const response = await axios.delete(`${this.baseUrl}/${widgetId}`);
            return response.data;
        } catch (error) {
            console.error('Failed to delete widget:', error.response?.data || error.message);
            throw new Error(error.response?.data?.detail || 'Failed to delete widget');
        }
    }

    // Position and Order Management
    async updateWidgetPosition(widgetId, position, order) {
        try {
            const response = await axios.put(`${this.baseUrl}/${widgetId}/position`, {
                position: {
                    x: position.x || 0,
                    y: position.y || 0,
                    w: position.w || 1,
                    h: position.h || 1
                },
                order: order || 0
            });
            return response.data;
        } catch (error) {
            console.error('Failed to update widget position:', error.response?.data || error.message);
            throw new Error(error.response?.data?.detail || 'Failed to update widget position');
        }
    }

    async reorderWidgets(siteId, widgetOrders) {
        try {
            const response = await axios.post(`${this.baseUrl}/reorder`, {
                site_id: siteId,
                widget_orders: widgetOrders
            });
            return response.data;
        } catch (error) {
            console.error('Failed to reorder widgets:', error.response?.data || error.message);
            throw new Error(error.response?.data?.detail || 'Failed to reorder widgets');
        }
    }

    // Metrics and Alerts
    async getWidgetSummary(widgetId) {
        try {
            const response = await axios.get(`${this.baseUrl}/${widgetId}/summary`);
            return response.data;
        } catch (error) {
            console.error('Failed to get widget summary:', error.response?.data || error.message);
            throw new Error(error.response?.data?.detail || 'Failed to get widget summary');
        }
    }

    async addMetric(widgetId, metric) {
        try {
            const response = await axios.post(`${this.baseUrl}/${widgetId}/metrics`, {
                widget_id: widgetId,
                label: metric.label,
                value: metric.value
            });
            return response.data;
        } catch (error) {
            console.error('Failed to add metric:', error.response?.data || error.message);
            throw new Error(error.response?.data?.detail || 'Failed to add metric');
        }
    }

    async addAlert(widgetId, alert) {
        try {
            const response = await axios.post(`${this.baseUrl}/${widgetId}/alerts`, {
                widget_id: widgetId,
                message: alert.message,
                severity: alert.severity,
                status: alert.status || 'active'
            });
            return response.data;
        } catch (error) {
            console.error('Failed to add alert:', error.response?.data || error.message);
            throw new Error(error.response?.data?.detail || 'Failed to add alert');
        }
    }

    // WebSocket Management
    connectToSite(siteId, callbacks = {}) {
        if (this.websockets.has(siteId)) {
            return;
        }

        const ws = new WebSocket(`${WS_BASE_URL}/ws/${siteId}`);
        
        ws.onopen = () => {
            console.log(`Connected to site ${siteId} websocket`);
            if (callbacks.onConnect) callbacks.onConnect();
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                switch (data.type) {
                    case 'widget_update':
                        if (callbacks.onWidgetUpdate) {
                            callbacks.onWidgetUpdate(data.widget_id, data.data);
                        }
                        break;
                    case 'widget_alert':
                        if (callbacks.onWidgetAlert) {
                            callbacks.onWidgetAlert(data.widget_id, data.alert);
                        }
                        break;
                    case 'widget_delete':
                        if (callbacks.onWidgetDelete) {
                            callbacks.onWidgetDelete(data.widget_id);
                        }
                        break;
                    default:
                        console.log('Unknown websocket message type:', data.type);
                }
            } catch (error) {
                console.error('Failed to parse websocket message:', error);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            if (callbacks.onError) callbacks.onError(error);
        };

        ws.onclose = () => {
            console.log(`Disconnected from site ${siteId} websocket`);
            this.websockets.delete(siteId);
            if (callbacks.onDisconnect) callbacks.onDisconnect();
            
            // Attempt to reconnect after a delay
            setTimeout(() => {
                if (callbacks.onReconnect) callbacks.onReconnect();
                this.connectToSite(siteId, callbacks);
            }, 5000);
        };

        this.websockets.set(siteId, ws);
    }

    disconnectFromSite(siteId) {
        const ws = this.websockets.get(siteId);
        if (ws) {
            ws.close();
            this.websockets.delete(siteId);
        }
    }

    // Utility method to calculate new order value for drag and drop
    calculateNewOrder(beforeOrder, afterOrder) {
        if (!beforeOrder) return afterOrder ? afterOrder / 2 : 1;
        if (!afterOrder) return beforeOrder + 1;
        return (beforeOrder + afterOrder) / 2;
    }
}

export const widgetService = new WidgetService();
