import React from 'react';

function ResultsSection({ results }) {
  const getStatusColor = (runType) => {
    switch (runType) {
      case 'All in VRAM':
        return {
          background: '#27ae6010',
          color: '#27ae60',
          border: '1px solid #27ae6030',
        };
      case 'KV cache offload':
        return {
          background: '#f1c40f10',
          color: '#f1c40f',
          border: '1px solid #f1c40f30',
        };
      case 'Partial offload':
        return {
          background: '#e67e2210',
          color: '#e67e22',
          border: '1px solid #e67e2230',
        };
      case 'All in System RAM':
        return {
          background: '#e74c3c10',
          color: '#e74c3c',
          border: '1px solid #e74c3c30',
        };
      default:
        return {
          background: '#95a5a610',
          color: '#95a5a6',
          border: '1px solid #95a5a630',
        };
    }
  };

  return (
    <div className="results">
      <h3>Quantization Analysis</h3>
      <div className="results-grid">
        {Object.entries(results).map(([quant, data]) => {
          const statusStyle = getStatusColor(data.runType);
          return (
            <div key={quant} className="result-card" style={statusStyle}>
              <h4>{quant.toUpperCase()}</h4>
              <div className="result-status" style={{ color: statusStyle.color }}>
                <strong>{data.runType}</strong>
              </div>
              <div className="result-details">
                <p>
                  <strong>Memory Required:</strong> {data.memoryRequired.toFixed(1)} GB
                </p>
                {data.offloadPercentage > 0 && (
                  <div className="progress-bar-container">
                    <div className="progress-label">
                      <strong>GPU Load:</strong>{' '}
                      {(100 - data.offloadPercentage).toFixed(1)}%
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${100 - data.offloadPercentage}%`,
                          backgroundColor: statusStyle.color,
                        }}
                      />
                    </div>
                  </div>
                )}
                {data.tks !== null ? (
                  <p className="speed">
                    <strong>Speed:</strong> {data.tks.toFixed(1)} tk/s
                  </p>
                ) : (
                  <p className="error">Not enough memory</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ResultsSection;
