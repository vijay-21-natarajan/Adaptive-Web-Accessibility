import React from 'react';

const StressHeatmap = ({ history }) => {
    // Reverse to show oldest to newest (left to right)
    const data = [...history].reverse();

    return (
        <div style={{ marginTop: '20px', padding: '15px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h4 style={{ margin: '0 0 10px 0' }}>Emotional Stress Timeline</h4>
            <div style={{
                display: 'flex',
                height: '40px',
                background: '#f8fafc',
                borderRadius: '6px',
                overflow: 'hidden',
                border: '1px solid #e2e8f0'
            }}>
                {data.map((log, i) => {
                    const score = log.cognitive_load_score || 0;
                    let color = '#38a169'; // low (green)
                    if (score > 0.4) color = '#ecc94b'; // medium (yellow)
                    if (score > 0.7) color = '#e53e3e'; // high (red)

                    return (
                        <div
                            key={i}
                            style={{
                                flex: 1,
                                background: color,
                                opacity: 0.8,
                                transition: 'all 0.3s ease',
                                cursor: 'help'
                            }}
                            title={`Load: ${score.toFixed(2)} | Jitter: ${log.mouse_jitter?.toFixed(2) || 0}`}
                        ></div>
                    );
                })}
                {data.length === 0 && <div style={{ padding: '8px', color: '#94a3b8', fontSize: '13px' }}>Collecting data...</div>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', color: '#64748b', fontSize: '11px' }}>
                <span>Earlier</span>
                <span>Now</span>
            </div>
        </div>
    );
};

export default StressHeatmap;
