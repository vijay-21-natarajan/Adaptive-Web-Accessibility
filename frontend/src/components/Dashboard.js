import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { AccessibilityContext } from '../context/AccessibilityContext';
import axios from 'axios';
import StressHeatmap from './StressHeatmap';
import "./Dashboard.css";

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
        const interval = setInterval(fetchHistory, 10000);
        return () => clearInterval(interval);
    }, [token]);

    if (loading) return (
        <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <p>Loading Insights...</p>
        </div>
    );

    const latest = history[0] || {};
    const avgScore = history.length > 0
        ? history.reduce((acc, curr) => acc + curr.cognitive_load_score, 0) / history.length
        : 0;

    const isMinimal = settings.layoutDensity === 'minimal';

    return (
        <div className="dashboard-container">
            <div className="dashboard-grid">
                <div className="card" style={{ gridColumn: '1 / -1' }}>
                    <h3>Live Insights for {user?.username}</h3>
                    <div className="stat-grid">
                        <div className="stat-item">
                            <span className="stat-label">Live Load Score</span>
                            <span className="stat-value" style={{ color: latest.cognitive_load_score > 0.7 ? '#e53e3e' : '#38a169' }}>
                                {(latest.cognitive_load_score || 0).toFixed(2)}
                            </span>
                        </div>

                        {!isMinimal && (
                            <>
                                <div className="stat-item">
                                    <span className="stat-label">Avg Load (Recent)</span>
                                    <span className="stat-value">{avgScore.toFixed(2)}</span>
                                </div>

                                <div className="stat-item">
                                    <span className="stat-label">Interactions</span>
                                    <span className="stat-value">{latest.click_count || 0} clicks</span>
                                </div>

                                <div className="stat-item">
                                    <span className="stat-label">System Errors</span>
                                    <span className="stat-value" style={{ color: (latest.error_count || 0) > 0 ? '#e53e3e' : 'inherit' }}>
                                        {latest.error_count || 0}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {!isMinimal && (
                    <>
                        <div className="card" style={{ gridColumn: '1 / -1' }}>
                            <StressHeatmap history={history} />
                        </div>

                        <div className="card" style={{ gridColumn: '1 / -1' }}>
                            <h3>Interaction History</h3>
                            <div className="history-table-container">
                                <table className="history-table">
                                    <thead>
                                        <tr>
                                            <th>Time</th>
                                            <th>Clicks</th>
                                            <th>Errors</th>
                                            <th>Load Score</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.map(log => (
                                            <tr key={log.id}>
                                                <td>{new Date(log.timestamp).toLocaleTimeString()}</td>
                                                <td>{log.click_count}</td>
                                                <td>{log.error_count}</td>
                                                <td style={{ fontWeight: 'bold', color: log.cognitive_load_score > 0.7 ? '#e53e3e' : 'inherit' }}>
                                                    {log.cognitive_load_score.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
