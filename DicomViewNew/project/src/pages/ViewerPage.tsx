import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneTools from 'cornerstone-tools';
import * as cornerstoneMath from 'cornerstone-math';
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import dicomParser from 'dicom-parser';
import Hammer from 'hammerjs';
import { ViewerToolbar } from '../components/ViewerToolbar';
import { ViewportOverlay } from '../components/ViewportOverlay';
import { MeasurementDisplay } from '../components/MeasurementDisplay';
import { useViewerStore } from '../store/viewerStore';
import { printImage, exportImage, CinePlayer } from '../utils/measurementTools';

// Initialize external dependencies
cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.Hammer = Hammer;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;

cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

export const ViewerPage: React.FC = () => {
  const location = useLocation();
  const studyData = location.state;
  const viewerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [layout, setLayout] = useState<string>('1x1');
  const [activeTool, setActiveTool] = useState<string>('Pan');
  const [imageIds, setImageIds] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [metadata, setMetadata] = useState<any>(null);
  const [viewport, setViewport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [measurements, setMeasurements] = useState<Record<string, any[]>>({});
  const [gridDimensions, setGridDimensions] = useState({ rows: 1, cols: 1 });
  const [isCinePlaying, setIsCinePlaying] = useState(false);
  const [cineSpeed, setCineSpeed] = useState(10); // frames per second
  const cinePlayerRef = useRef<CinePlayer | null>(null);
  const [showCineControls, setShowCineControls] = useState(false);

  const { setTool } = useViewerStore();

  useEffect(() => {
    // Parse layout string to get dimensions
    const [rows, cols] = layout.split('x').map(Number);
    setGridDimensions({ rows, cols });
    
    // Initialize refs array based on grid size
    viewerRefs.current = Array(rows * cols).fill(null);
  }, [layout]);

  useEffect(() => {
    const initializeViewers = async () => {
      try {
        setIsLoading(true);

        // Initialize cornerstone tools
        cornerstoneTools.init({
          showSVGCursors: true,
        });

        // Configure webWorker
        const config = {
          webWorkerPath: '/cornerstoneWADOImageLoaderWebWorker.js',
          taskConfiguration: {
            decodeTask: {
              codecsPath: '/cornerstoneWADOImageLoaderCodecs.js'
            }
          }
        };
        cornerstoneWADOImageLoader.webWorkerManager.initialize(config);

        // Enable all viewer elements
        viewerRefs.current.forEach((ref, index) => {
          if (ref) {
            cornerstone.enable(ref);
          }
        });

        // Add tools
        const tools = [
          { name: 'Pan', func: cornerstoneTools.PanTool },
          { name: 'Zoom', func: cornerstoneTools.ZoomTool },
          { name: 'Wwwc', func: cornerstoneTools.WwwcTool },
          { name: 'Length', func: cornerstoneTools.LengthTool },
          { name: 'Angle', func: cornerstoneTools.AngleTool },
          { name: 'CobbAngle', func: cornerstoneTools.CobbAngleTool },
          { name: 'RectangleRoi', func: cornerstoneTools.RectangleRoiTool },
          { name: 'EllipticalRoi', func: cornerstoneTools.EllipticalRoiTool },
          { name: 'FreehandRoi', func: cornerstoneTools.FreehandRoiTool },
          { name: 'Probe', func: cornerstoneTools.ProbeTool },
          { name: 'TextMarker', func: cornerstoneTools.TextMarkerTool },
          { name: 'ArrowAnnotate', func: cornerstoneTools.ArrowAnnotateTool },
          { name: 'Bidirectional', func: cornerstoneTools.BidirectionalTool },
          { name: 'Magnify', func: cornerstoneTools.MagnifyTool }
        ];

        tools.forEach(tool => {
          cornerstoneTools.addTool(tool.func);
        });

        // Generate multiple image IDs for demo purposes
        const baseImageUrl = studyData?.imageUrl || 'wadouri:https://raw.githubusercontent.com/cornerstonejs/cornerstoneWADOImageLoader/master/testImages/CT2_J2KR';
        
        // For demo, we'll create an array of the same image ID to simulate a series
        const demoImageIds = Array(10).fill(baseImageUrl);
        setImageIds(demoImageIds);

        // Load and display image in all viewers
        const image = await cornerstone.loadImage(demoImageIds[0]);
        viewerRefs.current.forEach((ref, index) => {
          if (ref) {
            cornerstone.displayImage(ref, image);
          }
        });

        // Initialize Cine player
        if (viewerRefs.current[0]) {
          cinePlayerRef.current = new CinePlayer(viewerRefs.current[0], demoImageIds);
          cinePlayerRef.current.setFrameChangeCallback((index) => {
            setCurrentImageIndex(index);
          });
        }

        // Set default tool
        handleToolChange('Pan');

        // Add element resize listener
        const handleResize = () => {
          viewerRefs.current.forEach(ref => {
            if (ref && cornerstone.getEnabledElement(ref)) {
              cornerstone.resize(ref);
            }
          });
        };

        window.addEventListener('resize', handleResize);

        // Add element interaction events to all viewers
        viewerRefs.current.forEach(ref => {
          if (ref) {
            ref.addEventListener('cornerstoneimagerendered', onImageRendered);
            ref.addEventListener('cornerstonetoolsmeasurementcompleted', onMeasurementComplete);
            ref.addEventListener('cornerstonetoolsmeasurementmodified', onMeasurementModified);
            ref.addEventListener('cornerstonetoolsmeasurementremoved', onMeasurementRemoved);
          }
        });

      } catch (error) {
        console.error('Error initializing viewer:', error);
        setError('Failed to initialize the DICOM viewer. Please try refreshing the page.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeViewers();

    return () => {
      // Clean up
      if (cinePlayerRef.current) {
        cinePlayerRef.current.dispose();
      }
      
      viewerRefs.current.forEach(ref => {
        if (ref) {
          ref.removeEventListener('cornerstoneimagerendered', onImageRendered);
          ref.removeEventListener('cornerstonetoolsmeasurementcompleted', onMeasurementComplete);
          ref.removeEventListener('cornerstonetoolsmeasurementmodified', onMeasurementModified);
          ref.removeEventListener('cornerstonetoolsmeasurementremoved', onMeasurementRemoved);
          cornerstone.disable(ref);
        }
      });
    };
  }, [gridDimensions]);

  const onImageRendered = (event: any) => {
    const eventDetail = event.detail;
    const element = eventDetail.element;
    const newViewport = cornerstone.getViewport(element);
    setViewport(newViewport);

    const imageId = eventDetail.image.imageId;
    const meta = {
      patientName: studyData?.patientName || 'Anonymous',
      patientId: studyData?.patientId || '',
      studyDate: studyData?.studyDate || '',
      modality: studyData?.modality || '',
      seriesNumber: cornerstone.metaData.get('generalSeriesModule', imageId)?.seriesNumber || '',
      instanceNumber: cornerstone.metaData.get('generalImageModule', imageId)?.instanceNumber || '',
    };
    setMetadata(meta);
  };

  const onMeasurementComplete = () => updateMeasurements();
  const onMeasurementModified = () => updateMeasurements();
  const onMeasurementRemoved = () => updateMeasurements();

  const updateMeasurements = () => {
    if (!viewerRefs.current[0]) return;

    const toolNames = [
      'Length', 'Angle', 'CobbAngle', 'RectangleRoi', 'EllipticalRoi',
      'FreehandRoi', 'ArrowAnnotate', 'Bidirectional', 'Probe', 'TextMarker'
    ];

    const newMeasurements: Record<string, any[]> = {};
    toolNames.forEach(toolName => {
      const toolState = cornerstoneTools.getToolState(viewerRefs.current[0], toolName);
      if (toolState && toolState.data && toolState.data.length > 0) {
        newMeasurements[toolName] = toolState.data;
      }
    });

    setMeasurements(newMeasurements);
  };

  const handleToolChange = (toolName: string) => {
    viewerRefs.current.forEach(ref => {
      if (!ref) return;

      // Deactivate all tools
      const toolNames = [
        'Pan', 'Zoom', 'Wwwc', 'Length', 'Angle', 'CobbAngle',
        'RectangleRoi', 'EllipticalRoi', 'FreehandRoi', 'Probe',
        'TextMarker', 'ArrowAnnotate', 'Bidirectional', 'Magnify'
      ];

      toolNames.forEach(tool => {
        cornerstoneTools.setToolPassive(tool);
      });

      // Activate the selected tool
      cornerstoneTools.setToolActive(toolName, { mouseButtonMask: 1 });
    });

    setActiveTool(toolName);
    setTool(toolName.toLowerCase());
  };

  const handleScroll = (direction: 'next' | 'prev') => {
    if (direction === 'next' && currentImageIndex < imageIds.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
      loadImage(currentImageIndex + 1);
    } else if (direction === 'prev' && currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
      loadImage(currentImageIndex - 1);
    }
  };

  const loadImage = async (index: number) => {
    try {
      const image = await cornerstone.loadImage(imageIds[index]);
      viewerRefs.current.forEach(ref => {
        if (ref) {
          cornerstone.displayImage(ref, image);
        }
      });
    } catch (error) {
      console.error('Error loading image:', error);
    }
  };

  const handleReset = () => {
    viewerRefs.current.forEach(ref => {
      if (!ref) return;
      
      const defaultViewport = cornerstone.getDefaultViewport(ref, undefined);
      if (defaultViewport) {
        defaultViewport.voi = {
          windowWidth: 400,
          windowCenter: 40
        };
        cornerstone.setViewport(ref, defaultViewport);
        cornerstone.updateImage(ref);
        setViewport(defaultViewport);
      }
    });
  };

  const handleWindowLevelChange = (windowWidth: number, windowCenter: number) => {
    viewerRefs.current.forEach(ref => {
      if (!ref) return;
      
      const newViewport = cornerstone.getViewport(ref);
      newViewport.voi.windowWidth = windowWidth;
      newViewport.voi.windowCenter = windowCenter;
      
      cornerstone.setViewport(ref, newViewport);
      cornerstone.updateImage(ref);
      setViewport({...newViewport});
    });
  };

  const handleZoom = (scale: number) => {
    viewerRefs.current.forEach(ref => {
      if (!ref) return;
      
      const newViewport = cornerstone.getViewport(ref);
      newViewport.scale = scale;
      
      cornerstone.setViewport(ref, newViewport);
      cornerstone.updateImage(ref);
      setViewport({...newViewport});
    });
  };

  const handleRotate = (direction: 'cw' | 'ccw') => {
    viewerRefs.current.forEach(ref => {
      if (!ref) return;
      
      const newViewport = cornerstone.getViewport(ref);
      newViewport.rotation += direction === 'cw' ? 90 : -90;
      
      cornerstone.setViewport(ref, newViewport);
      cornerstone.updateImage(ref);
      setViewport({...newViewport});
    });
  };

  const handleFlipHorizontal = () => {
    viewerRefs.current.forEach(ref => {
      if (!ref) return;
      
      const newViewport = cornerstone.getViewport(ref);
      newViewport.hflip = !newViewport.hflip;
      
      cornerstone.setViewport(ref, newViewport);
      cornerstone.updateImage(ref);
      setViewport({...newViewport});
    });
  };

  const handleFlipVertical = () => {
    viewerRefs.current.forEach(ref => {
      if (!ref) return;
      
      const newViewport = cornerstone.getViewport(ref);
      newViewport.vflip = !newViewport.vflip;
      
      cornerstone.setViewport(ref, newViewport);
      cornerstone.updateImage(ref);
      setViewport({...newViewport});
    });
  };

  const handleInvertColors = () => {
    viewerRefs.current.forEach(ref => {
      if (!ref) return;
      
      const newViewport = cornerstone.getViewport(ref);
      newViewport.invert = !newViewport.invert;
      
      cornerstone.setViewport(ref, newViewport);
      cornerstone.updateImage(ref);
      setViewport({...newViewport});
    });
  };

  const handleClearMeasurements = () => {
    viewerRefs.current.forEach(ref => {
      if (!ref) return;
      
      const toolNames = [
        'Length', 'Angle', 'CobbAngle', 'RectangleRoi', 'EllipticalRoi',
        'FreehandRoi', 'ArrowAnnotate', 'Bidirectional', 'Probe', 'TextMarker'
      ];
      
      toolNames.forEach(toolName => {
        cornerstoneTools.clearToolState(ref, toolName);
      });
      
      cornerstone.updateImage(ref);
    });
    
    setMeasurements({});
  };

  const handleToggleCine = () => {
    if (cinePlayerRef.current) {
      const isPlaying = cinePlayerRef.current.toggle();
      setIsCinePlaying(isPlaying);
      setShowCineControls(true);
    }
  };

  const handleCineSpeedChange = (newSpeed: number) => {
    setCineSpeed(newSpeed);
    if (cinePlayerRef.current) {
      cinePlayerRef.current.setFrameRate(newSpeed);
    }
  };

  const handlePrint = () => {
    if (viewerRefs.current[0] && metadata) {
      printImage(viewerRefs.current[0], metadata);
    }
  };

  const handleExport = () => {
    if (viewerRefs.current[0]) {
      exportImage(viewerRefs.current[0], 'png', `${metadata?.patientName}-${Date.now()}.png`);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <header className="bg-gray-800 text-white">
        <div className="max-w-full px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold">DICOM Viewer</h1>
            {isLoading && (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-400 mr-2"></div>
                <span className="text-sm text-blue-300">Loading...</span>
              </div>
            )}
          </div>
          <Link to="/search" className="flex items-center px-3 py-1 text-sm hover:bg-gray-700 rounded transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Search
          </Link>
        </div>
      </header>

      <ViewerToolbar
        activeTool={activeTool}
        onToolChange={handleToolChange}
        onZoomIn={() => handleZoom((viewport?.scale || 1) * 1.2)}
        onZoomOut={() => handleZoom((viewport?.scale || 1) * 0.8)}
        onPan={() => handleToolChange('Pan')}
        onFit={() => handleZoom(1)}
        onRotate={handleRotate}
        onFlipHorizontal={handleFlipHorizontal}
        onFlipVertical={handleFlipVertical}
        onWindowLevel={() => handleToolChange('Wwwc')}
        onReset={handleReset}
        onInvertColors={handleInvertColors}
        onFullScreen={() => document.documentElement.requestFullscreen()}
        onNextImage={() => handleScroll('next')}
        onPrevImage={() => handleScroll('prev')}
        layout={layout}
        onLayoutChange={setLayout}
        currentImageIndex={currentImageIndex}
        totalImages={imageIds.length}
        onClearMeasurements={handleClearMeasurements}
        onPlayCine={handleToggleCine}
        onPrintImage={handlePrint}
        onAnnotate={() => handleToolChange('TextMarker')}
        onShare={() => undefined} // Handled via modal in the toolbar
        onExport={handleExport}
      />

      <div className="flex-1 relative bg-black overflow-hidden">
        <div 
          className="w-full h-full grid gap-1 bg-gray-900"
          style={{
            gridTemplateColumns: `repeat(${gridDimensions.cols}, 1fr)`,
            gridTemplateRows: `repeat(${gridDimensions.rows}, 1fr)`
          }}
        >
          {Array.from({ length: gridDimensions.rows * gridDimensions.cols }).map((_, index) => (
            <div
              key={index}
              ref={el => viewerRefs.current[index] = el}
              className="bg-black"
            />
          ))}
        </div>
        
        {metadata && viewport && (
          <ViewportOverlay
            metadata={metadata}
            viewport={viewport}
            currentImageIndex={currentImageIndex}
            totalImages={imageIds.length}
            onWindowLevelChange={handleWindowLevelChange}
          />
        )}

        {viewerRefs.current[0] && Object.keys(measurements).length > 0 && (
          <MeasurementDisplay
            element={viewerRefs.current[0]}
            activeTool={activeTool}
            measurements={measurements}
          />
        )}

        {/* Cine Controls */}
        {showCineControls && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 rounded-lg p-3 flex items-center space-x-4 z-10">
            <button 
              className="text-white hover:text-blue-300"
              onClick={() => handleScroll('prev')}
              disabled={currentImageIndex <= 0}
            >
              <SkipBack size={20} />
            </button>
            
            <button 
              className="text-white hover:text-blue-300"
              onClick={handleToggleCine}
            >
              {isCinePlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            
            <button 
              className="text-white hover:text-blue-300"
              onClick={() => handleScroll('next')}
              disabled={currentImageIndex >= imageIds.length - 1}
            >
              <SkipForward size={20} />
            </button>
            
            <div className="flex items-center space-x-2">
              <span className="text-white text-sm">Speed:</span>
              <input
                type="range"
                min="1"
                max="30"
                value={cineSpeed}
                onChange={(e) => handleCineSpeedChange(parseInt(e.target.value))}
                className="w-24"
              />
              <span className="text-white text-sm">{cineSpeed} fps</span>
            </div>
            
            <button 
              className="text-white hover:text-red-300 ml-2"
              onClick={() => setShowCineControls(false)}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-400  mb-2"></div>
              <div className="text-white text-lg">Loading DICOM image...</div>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-red-900 text-white p-4 rounded-lg max-w-md">
              <h3 className="text-lg font-bold mb-2">Error</h3>
              <p>{error}</p>
              <button 
                className="mt-4 bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded"
                onClick={() => setError(null)}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};