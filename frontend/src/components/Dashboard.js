import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { AccessibilityContext } from '../context/AccessibilityContext';
import axios from 'axios';
import StressHeatmap from './StressHeatmap';

const Dashboard = () => {
    const { token, user } = useContext(AuthContext);
    const { settings } = useContext(AccessibilityContext);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!token) return;
            try {
                const res = await axios.get('http://127.0.0.1:5000/cognitive/history', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setHistory(res.data);
            } catch (err) {
                console.error("Failed to fetch history", err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
        const interval = setInterval(fetchHistory, 10000); // Update every 10s
        return () => clearInterval(interval);
    }, [token]);

    if (loading) return <div>Loading Cognitive Insights...</div>;

    const latest = history[0] || {};
    const avgScore = history.length > 0
        ? history.reduce((acc, curr) => acc + curr.cognitive_load_score, 0) / history.length
        : 0;

    const isMinimal = settings.layoutDensity === 'minimal';

    return (
        <div className="padded-adaptive" style={{ borderRadius: '12px', background: '#f0f4f8', marginTop: '20px' }}>
            <h3>Cognitive Insights for {user?.username}</h3>

            <div className="status-grid flex-adaptive" style={{ flexWrap: 'wrap' }}>
                <div className="stat-card" style={{ flex: 1, minWidth: '150px', padding: '15px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <small>Live Load Score</small>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: latest.cognitive_load_score > 0.7 ? '#e53e3e' : '#38a169' }}>
                        {(latest.cognitive_load_score || 0).toFixed(2)}
                    </div>
                </div>

                {!isMinimal && (
                    <>
                        <div className="stat-card" style={{ flex: 1, minWidth: '150px', padding: '15px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            <small>Avg Load (Recent)</small>
                            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                                {avgScore.toFixed(2)}
                            </div>
                        </div>

                        <div className="stat-card" style={{ flex: 1, minWidth: '150px', padding: '15px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            <small>Interaction Count</small>
                            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                                {latest.click_count || 0} clicks
                            </div>
                        </div>
                    </>
                )}
            </div>

            {!isMinimal && (
                <div className="history-chart" style={{ marginTop: '20px' }}>
                    <StressHeatmap history={history} />
                    <h4 style={{ marginTop: '20px' }}>Recent History</h4>
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                                    <th>Time</th>
                                    <th>Clicks</th>
                                    <th>Errors</th>
                                    <th>Load Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map(log => (
                                    <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td>{new Date(log.timestamp).toLocaleTimeString()}</td>
                                        <td>{log.click_count}</td>
                                        <td>{log.error_count}</td>
                                        <td style={{ color: log.cognitive_load_score > 0.7 ? 'red' : 'inherit' }}>
                                            {log.cognitive_load_score.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
