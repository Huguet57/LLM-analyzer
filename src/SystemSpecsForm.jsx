import React from 'react';

function SystemSpecsForm({
  modelId,
  handleModelIdChange,
  specs,
  handleSpecsChange,
  handleAnalyze,
  loading,
}) {
  return (
    <form onSubmit={handleAnalyze}>
      <div className="input-group">
        <label>
          Hugging Face Model ID or URL:
          <input
            type="text"
            value={modelId}
            onChange={handleModelIdChange}
            placeholder="e.g., microsoft/phi-4 or https://huggingface.co/microsoft/phi-4"
            required
          />
        </label>
      </div>

      <div className="specs-form">
        <h2>System Specifications</h2>
        <div className="spec-grid">
          <div className="spec-item">
            <label>Total RAM (GB)</label>
            <input
              type="number"
              name="ram"
              value={specs.ram}
              onChange={handleSpecsChange}
              step="1"
            />
          </div>
          <div className="spec-item">
            <label>RAM Bandwidth (GB/s)</label>
            <input
              type="number"
              name="ramBandwidth"
              value={specs.ramBandwidth}
              onChange={handleSpecsChange}
              step="1"
            />
          </div>
          <div className="spec-item">
            <label>VRAM per GPU (GB)</label>
            <input
              type="number"
              name="vram"
              value={specs.vram}
              onChange={handleSpecsChange}
              step="1"
            />
          </div>
          <div className="spec-item">
            <label>VRAM Bandwidth (GB/s)</label>
            <input
              type="number"
              name="vramBandwidth"
              value={specs.vramBandwidth}
              onChange={handleSpecsChange}
              step="10"
            />
          </div>
          <div className="spec-item">
            <label>Number of GPUs</label>
            <input
              type="number"
              name="numGpus"
              value={specs.numGpus}
              onChange={handleSpecsChange}
              min="1"
              step="1"
            />
          </div>
        </div>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze Model'}
      </button>
    </form>
  );
}

export default SystemSpecsForm;
