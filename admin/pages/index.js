import { useState, useEffect } from 'react';
import Head from 'next/head';
import DarkModeToggle from '../components/DarkModeToggle';
import NodesList from '../components/NodesList';
import FlowChart from '../components/FlowChart';
import NodeDetailPanel from '../components/NodeDetailPanel';
import DraggableModal from '../components/DraggableModal';
import FloatingDetailPanel from '../components/FloatingDetailPanel';
import DraggableFlowChart from '../components/DraggableFlowChart';
import { checkFlaskAvailability, resetFlaskAvailability, getFlaskServerUrl, getFlaskPort } from '../utils/flaskCheck';


export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [listPosition, setListPosition] = useState('column'); // 'column', 'full-width', 'floating'
  const [showFloatingList, setShowFloatingList] = useState(false);
  const [showFloatingDetail, setShowFloatingDetail] = useState(false);
  const [showFloatingChart, setShowFloatingChart] = useState(false);
  const [panelZIndex, setPanelZIndex] = useState({ list: 40, chart: 41, detail: 42 });
  const [highlightedNode, setHighlightedNode] = useState(null);
  const [flaskAvailable, setFlaskAvailable] = useState(null); // null = checking, true = available, false = unavailable
const flaskUrl = getFlaskServerUrl();
const flaskPort = getFlaskPort();

  // Ensure hydration completes before rendering client-specific content
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNodeSelect = (node) => {
    setSelectedNode(node);
    setShowFloatingDetail(true);
  };

  const handleUpdateNode = (updatedNode) => {
    setSelectedNode(updatedNode);
  };

  const handleRunNode = (node, result) => {
    console.log('Node run result:', { node, result });
  };

  const bringToFront = (panelType) => {
    const maxZ = Math.max(...Object.values(panelZIndex));
    setPanelZIndex(prev => ({
      ...prev,
      [panelType]: maxZ + 1
    }));
  };

  const openAllFloatingPanels = () => {
    setShowFloatingList(true);
    setShowFloatingChart(true);
    // Reset positions for floating layout
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('resetFloatingPositions'));
    }, 100);
  };

  const handleHighlightInList = (node) => {
    setHighlightedNode(node);
    bringToFront('detail');
    // Clear highlight after 3 seconds
    setTimeout(() => setHighlightedNode(null), 3000);
  };

  // Check Flask availability on mount
 useEffect(() => {
  const checkFlask = async () => {
    // ✅ clear cached value each time so status can flip from false -> true
    resetFlaskAvailability();
    const available = await checkFlaskAvailability();
    setFlaskAvailable(available);
  };

  checkFlask();

  // Re-check every 10 seconds (faster feedback while developing)
  const interval = setInterval(checkFlask, 10000);
  return () => clearInterval(interval);
}, []);


  const handleRetryFlaskCheck = async () => {
    resetFlaskAvailability();
    const available = await checkFlaskAvailability();
    setFlaskAvailable(available);
  };


  return (
    <>
      <Head>
        <title>Data Pipeline Admin</title>
        <meta name="description" content="Data Pipeline Administration Interface" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={`min-h-screen bg-gray-900 light:bg-yellow-50 ${listPosition === 'floating' ? 'overflow-auto' : ''}`} style={listPosition === 'floating' ? { height: '100vh' } : {}}>
        {/* Flask Availability Banner - only render after mount to avoid hydration mismatch */}
        {/* Flask Status Banner - only render after mount to avoid hydration mismatch */}
{mounted && (
  (() => {
    const isRemote =
      typeof window !== 'undefined' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1';

    // Text variations
    const checkingText = `Checking Flask on ${flaskUrl} (port ${flaskPort})...`;
    const connectedText = `Connected to Flask on ${flaskUrl} (port ${flaskPort})`;
    const notConnectedLocalText = `Flask is not reachable at ${flaskUrl} (port ${flaskPort})`;
    const notConnectedRemoteText = `This hosted page can't reach your local Flask (${flaskUrl}, port ${flaskPort}). Run the admin UI locally to connect.`;

    // Styles
    const baseClass =
      "border-b px-6 py-3 flex items-center justify-between relative z-50";
    const greenClass = "bg-green-500/15 border-green-500/40";
    const orangeClass = "bg-orange-500/20 border-orange-500/50";
    const grayClass = "bg-gray-500/10 border-gray-500/30";

    if (flaskAvailable === null) {
      return (
        <div className={`${baseClass} ${grayClass}`}>
          <div className="flex items-center gap-3">
            <span className="text-gray-300">⏳</span>
            <span className="text-gray-200 light:text-gray-800">
              {checkingText}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRetryFlaskCheck}
              className="text-sm px-3 py-1 bg-gray-500/20 hover:bg-gray-500/30 rounded border border-gray-500/30 text-gray-200 light:text-gray-800"
            >
              Re-check
            </button>
          </div>
        </div>
      );
    }

    if (flaskAvailable === true) {
      return (
        <div className={`${baseClass} ${greenClass}`}>
          <div className="flex items-center gap-3">
            <span className="text-green-300">✅</span>
            <span className="text-green-200 light:text-green-800">
              {connectedText}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRetryFlaskCheck}
              className="text-sm px-3 py-1 bg-green-500/20 hover:bg-green-500/30 rounded border border-green-500/30 text-green-100 light:text-green-800"
            >
              Re-check
            </button>
          </div>
        </div>
      );
    }

    // flaskAvailable === false
    return (
      <div className={`${baseClass} ${orangeClass}`}>
        <div className="flex items-center gap-3">
          <span className="text-orange-400">⚠️</span>
          <span className="text-orange-300 light:text-orange-700">
            {isRemote ? notConnectedRemoteText : notConnectedLocalText}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRetryFlaskCheck}
            className="text-sm px-3 py-1 bg-orange-500/30 hover:bg-orange-500/50 rounded border border-orange-500/50 text-orange-200 light:text-orange-800"
          >
            Retry Check
          </button>

          {/* Local activation link (this is what you shared: localhost:8887/data-pipeline/flask/) */}
          <a
            href="http://localhost:8887/data-pipeline/flask/"
            target="_blank"
            rel="noreferrer"
            className="text-sm px-3 py-1 bg-blue-500/30 hover:bg-blue-500/50 rounded border border-blue-500/50 text-blue-200 light:text-blue-800"
          >
            Activate Flask Server
          </a>
        </div>
      </div>
    );
  })()
)}

        
        {/* Top Bar */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 light:border-gray-400 relative z-50">
          <div className="flex gap-2">
            <button
              onClick={() => setListPosition('column')}
              className={`btn text-sm px-3 py-2 ${listPosition === 'column' ? 'btn-primary' : ''}`}
              title="Column Layout"
            >
              ▦
            </button>
            <button
              onClick={() => {
                setListPosition('full-width');
                setShowFloatingList(true);
              }}
              className={`btn text-sm px-3 py-2 ${listPosition === 'full-width' ? 'btn-primary' : ''}`}
              title="Full Width Layout"
            >
              ▬
            </button>
            <button
              onClick={() => {
                setListPosition('floating');
                setShowFloatingList(true);
                setShowFloatingChart(true);
                // Reset positions for floating layout
                window.dispatchEvent(new CustomEvent('resetFloatingPositions'));
              }}
              className={`btn text-sm px-3 py-2 ${listPosition === 'floating' ? 'btn-primary' : ''}`}
              title="Floating Layout"
            >
              ⧉
            </button>
          </div>
          
          <DarkModeToggle />
        </div>

        {/* Main Layout */}
        <div className={`flex ${listPosition === 'floating' ? 'h-auto min-h-[calc(100vh-81px)]' : 'h-[calc(100vh-81px)]'}`}>
          {/* Column Layout */}
          {listPosition === 'column' && (
            <div className="w-[30%] border-r border-gray-700 light:border-gray-400 p-6 overflow-y-auto">
              <NodesList 
                onNodeSelect={handleNodeSelect}
                onNodeClick={() => bringToFront('detail')}
                highlightedNode={highlightedNode}
                onHighlightReceived={setSelectedNode}
                className="h-auto"
              />
            </div>
          )}

          {/* Main Content Area */}
          <div className={`flex-1 ${listPosition === 'column' ? 'w-[70%]' : 'w-full'}`}>
            <div className="h-full">
              {/* Flow Chart - only show when not in floating mode */}
              {listPosition !== 'floating' && (
                <div className="h-full p-6">
                  <FlowChart 
                    className="h-full" 
                    onNodeSelect={handleNodeSelect}
                    isFloating={false}
                    onHighlightInList={handleHighlightInList}
                  />
                  
                  {/* Full Width List - now floating */}
                </div>
              )}
              
              {/* Empty state for floating mode */}
              {listPosition === 'floating' && (
                <div className="h-full flex items-center justify-center p-6">
                  <div className="text-center">
                    <button 
                      onClick={openAllFloatingPanels}
                      className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center light:bg-gray-300 hover:bg-gray-600 light:hover:bg-gray-400 transition-colors duration-200 cursor-pointer"
                    >
                      <span className="text-2xl">⧉</span>
                    </button>
                    <h3 className="text-lg font-medium text-gray-100 mb-2 light:text-gray-900">Floating Mode Active</h3>
                    <p className="text-muted">Click the icon above to open floating panels</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Floating List Popup */}
        {(listPosition === 'floating' || listPosition === 'full-width') && showFloatingList && (
          <div 
            className="fixed inset-0 pointer-events-none"
            id="listPopup"
            style={{ zIndex: panelZIndex.list }}
          >
            <div className="pointer-events-auto">
              <DraggableModal 
                onClose={() => setShowFloatingList(false)}
                onNodeSelect={(node) => {
                  handleNodeSelect(node);
                }}
                onFocus={() => bringToFront('list')}
                onNodeClick={() => bringToFront('detail')}
                highlightedNode={highlightedNode}
                onHighlightReceived={setSelectedNode}
                hideTitle={listPosition === 'floating'}
              />
            </div>
          </div>
        )}

        {/* Floating Chart Popup */}
        {(listPosition === 'floating' || listPosition === 'full-width') && showFloatingChart && (
          <div 
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: panelZIndex.chart }}
          >
            <div className="pointer-events-auto">
              <DraggableFlowChart
                onNodeSelect={handleNodeSelect}
                onClose={() => setShowFloatingChart(false)}
                onFocus={() => bringToFront('chart')}
                isFullWidth={listPosition === 'full-width'}
                hideTitle={listPosition === 'floating'}
                onHighlightInList={handleHighlightInList}
              />
            </div>
          </div>
        )}

        {/* Floating Detail Panel */}
        {showFloatingDetail && selectedNode && (
          <div 
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: panelZIndex.detail }}
          >
            <div className="pointer-events-auto">
              <FloatingDetailPanel
                node={selectedNode}
                onClose={() => setShowFloatingDetail(false)}
                onUpdateNode={handleUpdateNode}
                onRunNode={handleRunNode}
                onFocus={() => bringToFront('detail')}
                flaskAvailable={flaskAvailable}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}