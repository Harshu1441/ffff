import { useState, useEffect, useRef } from 'react';

export const useRealtimeStats = (initialStats) => {
  const [stats, setStats] = useState(initialStats);
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://20.193.252.169:5000/status', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Failed to fetch stats');

        const data = await response.json();
        const matchingAgent = data.find(item => item.pc_name === initialStats?.pc_name);
        
        if (matchingAgent) {
          setStats(matchingAgent.stats);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    intervalRef.current = setInterval(fetchStats, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [initialStats]);

  return stats;
};