import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config';
import { getCurrentUser } from '../js/auth';

const useEntitlements = () => {
    const [entitlements, setEntitlements] = useState({
        plan: 'guest',
        limits: { 
            dailyCount: 1, 
            weeklyCount: 0, 
            maxDuration: 60, 
            features: ['makes_misses'] 
        },
        usage: { count: 0, remaining: 1 },
        loading: true,
        error: null
    });

    const fetchEntitlements = useCallback(async () => {
        try {
            const token = localStorage.getItem('authToken');
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE_URL}/api/user-limits`, { headers });
            if (!response.ok) throw new Error('Failed to fetch entitlements');
            
            const data = await response.json();
            setEntitlements({
                ...data,
                loading: false,
                error: null
            });
        } catch (err) {
            console.error('Error fetching entitlements:', err);
            setEntitlements(prev => ({ ...prev, loading: false, error: err.message }));
        }
    }, []);

    useEffect(() => {
        fetchEntitlements();
    }, [fetchEntitlements]);

    const hasFeature = (featureName) => {
        return entitlements.limits?.features?.includes(featureName);
    };

    const canAnalyze = () => {
        return entitlements.usage?.remaining > 0;
    };

    return {
        ...entitlements,
        hasFeature,
        canAnalyze,
        refresh: fetchEntitlements
    };
};

export default useEntitlements;
