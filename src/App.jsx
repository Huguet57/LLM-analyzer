import React, { useState, useEffect } from 'react';
import './App.css';
import SystemSpecsForm from './SystemSpecsForm';
import ResultsSection from './ResultsSection';
import Tutorial from './Tutorial';

const QUANTIZATION_BPWS = {
  "fp8": 8.0,
  "q6_k_s": 6.6,
  "q5_k_s": 5.5,
  "q4_k_m": 4.8,
  "IQ4_XS": 4.3,
  "q3_k_m": 3.9,
  "IQ3_XS": 3.3,
  "IQ2_XS": 2.4
};

function App() {
  const [modelId, setModelId] = useState('');
  const [modelParams, setModelParams] = useState(null);
  const [specs, setSpecs] = useState({
    ram: 16,
    ramBandwidth: 48,
    vram: 8,
    vramBandwidth: 400,
    numGpus: 1
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isTutorialVisible, setIsTutorialVisible] = useState(true);

  useEffect(() => {
    const savedSpecs = localStorage.getItem('specs');
    if (savedSpecs) {
      setSpecs(JSON.parse(savedSpecs));
    }
  }, []);

  const handleSpecsChange = (e) => {
    const { name, value } = e.target;
    const newSpecs = { ...specs, [name]: parseFloat(value) || 0 };
    setSpecs(newSpecs);
    localStorage.setItem('specs', JSON.stringify(newSpecs));
  };

  const estimateVramBandwidth = (vram) => {
    if (vram >= 49) return 1500;
    if (vram >= 25) return 1790;
    if (vram >= 17) return 950;
    if (vram >= 13) return 550;
    if (vram >= 9) return 400;
    if (vram >= 7) return 300;
    if (vram >= 5) return 240;
    return 200;
  };

  const convertParamsToB = (sizeText) => {
    const cleaned = sizeText.toLowerCase().replace('b', '').replace('m', '').trim();
    const value = parseFloat(cleaned);
    if (sizeText.toLowerCase().includes('b')) return value * 1e9;
    if (sizeText.toLowerCase().includes('m')) return value * 1e6;
    return value;
  };

  const analyzeQuantization = (paramsB, vramGB, bandwidth, ramGB, bpw, ramBandwidth) => {
    const requiredBase = 1.0 + paramsB * 0.05 / 1e9;
    const requiredMem = requiredBase + (paramsB * bpw / 8 / 1e9);

    let result = {};

    if (requiredMem <= vramGB) {
      result = {
        runType: "All in VRAM",
        memoryRequired: requiredMem,
        offloadPercentage: 0,
        tks: bandwidth / requiredMem
      };
    } else if (requiredMem <= vramGB + 1) {
      result = {
        runType: "KV cache offload",
        memoryRequired: requiredMem,
        offloadPercentage: 0,
        tks: (bandwidth / requiredMem) * 0.9
      };
    } else if (vramGB > 1 && requiredMem <= (ramGB + vramGB)) {
      const offloadRatio = (requiredMem - vramGB) / requiredMem * 100;
      const baseTks = (ramBandwidth / requiredMem) * 0.9;
      result = {
        runType: "Partial offload",
        memoryRequired: requiredMem,
        offloadPercentage: offloadRatio,
        tks: baseTks * (0.052 * Math.exp(4.55 * (100 - offloadRatio)/100) + 1.06)
      };
    } else if (requiredMem <= ramGB) {
      result = {
        runType: "All in System RAM",
        memoryRequired: requiredMem,
        offloadPercentage: 100,
        tks: (ramBandwidth / requiredMem) * 0.9
      };
    } else {
      result = {
        runType: "Won't run",
        memoryRequired: requiredMem,
        offloadPercentage: 0,
        tks: null
      };
    }

    return {
      ...result,
      memoryRequired: parseFloat(result.memoryRequired.toFixed(2)),
      tks: result.tks ? parseFloat(result.tks.toFixed(2)) : null
    };
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Fetch model info from Hugging Face API
      const response = await fetch(`https://huggingface.co/api/models/${modelId}`);
      const data = await response.json();
      
      console.log(data);

      // Calculate total parameters from safetensors if available
      let totalParams = 0;
      if (data.safetensors?.parameters) {
        totalParams = Object.values(data.safetensors.parameters).reduce((a, b) => a + b, 0);
      }

      if (!totalParams) {
        alert('Model size not found in API response');
        return;
      }

      // Convert to billions and format as string
      const modelSizeText = `${(totalParams / 1e9).toFixed(1)}B`;
      const paramsB = totalParams;

      const vram = specs.vram * specs.numGpus;
      const bandwidth = specs.vramBandwidth * specs.numGpus * 0.42;
      const ramBandwidth = specs.ramBandwidth;

      const analysisResults = {};
      Object.entries(QUANTIZATION_BPWS).forEach(([quant, bpw]) => {
        analysisResults[quant] = analyzeQuantization(
          paramsB,
          vram,
          bandwidth,
          specs.ram,
          bpw,
          ramBandwidth
        );
      });

      setResults(analysisResults);
      setModelParams({
        text: modelSizeText,
        paramsB: paramsB
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Error fetching model information');
    } finally {
      setLoading(false);
    }
  };

  const handleModelIdChange = (e) => {
    let value = e.target.value;
    // Extract model ID from URL if pasted
    if (value.includes('huggingface.co/')) {
      value = value.split('huggingface.co/')[1].trim();
    }
    setModelId(value);
  };

  const getStatusColor = (runType) => {
    switch (runType) {
      case 'All in VRAM':
        return { background: '#27ae6010', color: '#27ae60', border: '1px solid #27ae6030' };
      case 'KV cache offload':
        return { background: '#f1c40f10', color: '#f1c40f', border: '1px solid #f1c40f30' };
      case 'Partial offload':
        return { background: '#e67e2210', color: '#e67e22', border: '1px solid #e67e2230' };
      case 'All in System RAM':
        return { background: '#e74c3c10', color: '#e74c3c', border: '1px solid #e74c3c30' };
      default:
        return { background: '#95a5a610', color: '#95a5a6', border: '1px solid #95a5a630' };
    }
  };

  return (
    <div className="App">
      <header>
        <h1>LLM Inference Analyzer</h1>
      </header>

      <div className="container">
        <div className="left-panel">
          <SystemSpecsForm
            modelId={modelId}
            handleModelIdChange={handleModelIdChange}
            specs={specs}
            handleSpecsChange={handleSpecsChange}
            handleAnalyze={handleAnalyze}
            loading={loading}
          />

          {modelParams && (
            <div className="model-info">
              <h3>Model Analysis: {modelId}</h3>
              <p>Parameters: {modelParams.text} ({(modelParams.paramsB / 1e9).toFixed(1)}B)</p>
            </div>
          )}
        </div>

        <div className="right-panel">
          {results && <ResultsSection results={results} />}
        </div>
      </div>

      <Tutorial 
        isTutorialVisible={isTutorialVisible} 
        setIsTutorialVisible={setIsTutorialVisible} 
      />
    </div>
  );
}

export default App;
