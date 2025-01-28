import React from 'react';

function Tutorial({ isTutorialVisible, setIsTutorialVisible }) {
  return (
    <div className="tutorial-section">
      <div
        className="tutorial-header"
        onClick={() => setIsTutorialVisible(!isTutorialVisible)}
      >
        <h2>How to Find System Specifications in Ubuntu</h2>
        <button className={`collapse-btn ${isTutorialVisible ? 'expanded' : ''}`}>
          {isTutorialVisible ? '−' : '+'}
        </button>
      </div>

      {isTutorialVisible && (
        <div className="command-list">
          <div className="command-item">
            <h4>Total RAM:</h4>
            <code>free -h</code>
            <p>Look at the "total" column in the "Mem:" row:</p>
            <ul>
              <li>
                Example output: <code>Mem: 61Gi total</code>
              </li>
              <li>This means you have 61GB of RAM</li>
            </ul>
          </div>
          <div className="command-item">
            <h4>RAM Bandwidth:</h4>
            <code>sudo dmidecode -t memory | grep -i speed</code>
            <p>Calculate: Memory Speed (MT/s) × 8 bytes × number of channels</p>
            <ul>
              <li>Look for "Speed: X MT/s" (ignore "Unknown" entries)</li>
              <li>Example: 4800 MT/s × 8 bytes = 38.4 GB/s per channel</li>
              <li>For DDR (dual channel): multiply by 2</li>
              <li>Final bandwidth: 38.4 × 2 = 76.8 GB/s</li>
            </ul>
          </div>
          <div className="command-item">
            <h4>GPU Info (NVIDIA):</h4>
            <code>nvidia-smi</code>
            <p>Key information:</p>
            <ul>
              <li>Model: First column under "GPU Name"</li>
              <li>VRAM: Look for "Memory-Usage" (e.g., "24564MiB" total)</li>
              <li>Power Usage: Under "Pwr:Usage/Cap"</li>
            </ul>
          </div>
          <div className="command-item">
            <h4>Detailed GPU Info:</h4>
            <code>nvidia-smi -q</code>
            <p>Navigate to these sections:</p>
            <ul>
              <li>FB Memory Usage → Total: Your VRAM size</li>
              <li>Max Clocks → Memory: Multiply by 8 for bandwidth</li>
              <li>Example: 10501 MHz × 8 = 84.0 GB/s raw bandwidth</li>
              <li>Actual bandwidth is typically ~80% of raw</li>
            </ul>
          </div>
          <div className="command-item">
            <h4>Number of GPUs:</h4>
            <code>nvidia-smi --list-gpus | wc -l</code>
            <p>Directly shows GPU count (1 in your case)</p>
          </div>
          <div className="command-item">
            <h4>RAM Channels:</h4>
            <code>sudo dmidecode -t memory | grep -i "memory device" -A 21</code>
            <p>How to count memory channels:</p>
            <ul>
              <li>Look for "Memory Device" sections</li>
              <li>Count populated slots (where "Size:" is not "No Module Installed")</li>
              <li>Check if slots are in pairs (look at "Locator:" field)</li>
              <li>Example output from your system:</li>
              <li>
                <code>
                  Memory Device
                  <br />
                  Locator: DIMM_A1
                  <br />
                  Size: 32 GB
                  <br />
                  ...
                  <br />
                  Memory Device
                  <br />
                  Locator: DIMM_B1
                  <br />
                  Size: 32 GB
                </code>
              </li>
              <li>You have 2 populated slots (DIMM_A1 and DIMM_B1) → Dual Channel</li>
            </ul>
            <p>Alternative command:</p>
            <code>lscpu | grep -i "numa node"</code>
            <p>Tips for identifying channels:</p>
            <ul>
              <li>Memory slots usually come in pairs (A1/B1, A2/B2)</li>
              <li>For optimal performance, RAM should be installed in matching pairs</li>
              <li>Most modern desktop systems support dual channel (2 channels)</li>
              <li>High-end desktop/server systems may support quad channel (4 channels)</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tutorial;
