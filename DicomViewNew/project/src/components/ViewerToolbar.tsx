import React, { useState, useRef, useEffect } from 'react';
import { 
  ZoomIn, ZoomOut, Move, Maximize2, RotateCcw, RotateCw, Layout, Contrast, 
  Ruler, Download, FlipHorizontal, FlipVertical, TextCursorInput, Play, 
  RefreshCw, Save, Info, Box, Grid3x3, Eye, Printer, Circle, Square, 
  MoreHorizontal, Grid2X2, Layers, Crop, Scroll, Share2 as Share, 
  Move as Crosshair, ChevronRight as Forward, ChevronLeft as Back, Plus, 
  Minus, ArrowRight, Pentagon, MousePointer, ArrowDownRight, Pencil, 
  LineChart, X, Search, ArrowUpDown, Activity, Brain, Spline as Spine, 
  Ruler as RulerIcon, Mail, FileImage, Image
} from 'lucide-react';

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  isActive?: boolean;
  disabled?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ 
  icon, 
  label, 
  onClick, 
  isActive = false,
  disabled = false
}) => (
  <button
    className={`flex flex-col items-center p-2 rounded transition-colors min-w-[60px] ${
      isActive 
        ? 'bg-blue-600 text-white' 
        : disabled
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
    }`}
    title={label}
    onClick={onClick}
    disabled={disabled}
  >
    <div className="text-current">{icon}</div>
    <span className="text-xs mt-1 text-current">{label}</span>
  </button>
);

interface ViewerToolbarProps {
  activeTool: string;
  onToolChange: (toolName: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onPan: () => void;
  onFit: () => void;
  onRotate: (direction: 'cw' | 'ccw') => void;
  onFlipHorizontal: () => void;
  onFlipVertical: () => void;
  onWindowLevel: () => void;
  onReset: () => void;
  onInvertColors: () => void;
  onFullScreen: () => void;
  onNextImage: () => void;
  onPrevImage: () => void;
  layout: string;
  onLayoutChange: (layout: string) => void;
  currentImageIndex: number;
  totalImages: number;
  onClearMeasurements?: () => void;
  onPlayCine?: () => void;
  onPrintImage?: () => void;
  onAnnotate?: () => void;
  onShare?: () => void;
  onExport?: () => void;
}

export const ViewerToolbar: React.FC<ViewerToolbarProps> = ({
  activeTool,
  onToolChange,
  onZoomIn,
  onZoomOut,
  onPan,
  onFit,
  onRotate,
  onFlipHorizontal,
  onFlipVertical,
  onWindowLevel,
  onReset,
  onInvertColors,
  onFullScreen,
  onNextImage,
  onPrevImage,
  layout,
  onLayoutChange,
  currentImageIndex,
  totalImages,
  onClearMeasurements,
  onPlayCine,
  onPrintImage,
  onAnnotate,
  onShare,
  onExport
}) => {
  const [showMoreTools, setShowMoreTools] = useState(false);
  const [showLayoutDropdown, setShowLayoutDropdown] = useState(false);
  const [showZoomDropdown, setShowZoomDropdown] = useState(false);
  const [showMeasureDropdown, setShowMeasureDropdown] = useState(false);
  const [showAnnotateDropdown, setShowAnnotateDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const layoutDropdownRef = useRef<HTMLDivElement>(null);
  const zoomDropdownRef = useRef<HTMLDivElement>(null);
  const measureDropdownRef = useRef<HTMLDivElement>(null);
  const annotateDropdownRef = useRef<HTMLDivElement>(null);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const moreToolsRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (layoutDropdownRef.current && !layoutDropdownRef.current.contains(event.target as Node)) {
        setShowLayoutDropdown(false);
      }
      if (zoomDropdownRef.current && !zoomDropdownRef.current.contains(event.target as Node)) {
        setShowZoomDropdown(false);
      }
      if (measureDropdownRef.current && !measureDropdownRef.current.contains(event.target as Node)) {
        setShowMeasureDropdown(false);
      }
      if (annotateDropdownRef.current && !annotateDropdownRef.current.contains(event.target as Node)) {
        setShowAnnotateDropdown(false);
      }
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setShowExportDropdown(false);
      }
      if (moreToolsRef.current && !moreToolsRef.current.contains(event.target as Node)) {
        setShowMoreTools(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const layouts = [
    { value: '1x1', icon: <Grid2X2 size={16} />, label: '1x1' },
    { value: '1x2', icon: <Grid2X2 size={16} />, label: '1x2' },
    { value: '2x1', icon: <Grid2X2 size={16} />, label: '2x1' },
    { value: '2x2', icon: <Grid2X2 size={16} />, label: '2x2' },
    { value: '2x3', icon: <Grid2X2 size={16} />, label: '2x3' },
    { value: '3x2', icon: <Grid2X2 size={16} />, label: '3x2' },
    { value: '3x3', icon: <Grid2X2 size={16} />, label: '3x3' }
  ];

  const measureTools = [
    { label: 'Line', icon: <Ruler size={16} />, tool: 'Length' },
    { label: 'Ellipse', icon: <Circle size={16} />, tool: 'EllipticalRoi' },
    { label: 'Rectangle', icon: <Square size={16} />, tool: 'RectangleRoi' },
    { label: 'Area', icon: <Pentagon size={16} />, tool: 'FreehandRoi' },
    { label: 'Cobb Angle', icon: <X size={16} />, tool: 'CobbAngle' },
    { label: 'Height Difference', icon: <ArrowUpDown size={16} />, tool: 'Bidirectional' },
    { label: 'Angle', icon: <ArrowDownRight size={16} />, tool: 'Angle' },
    { label: 'Arrow', icon: <ArrowRight size={16} />, tool: 'ArrowAnnotate' },
    { label: 'Point', icon: <Crosshair size={16} />, tool: 'Probe' }
  ];

  const annotateTools = [
    { label: 'Text', icon: <TextCursorInput size={16} />, tool: 'TextMarker' },
    { label: 'Arrow', icon: <ArrowRight size={16} />, tool: 'ArrowAnnotate' },
    { label: 'Freehand', icon: <Pencil size={16} />, tool: 'FreehandRoi' }
  ];

  const exportFormats = [
    { label: 'JPEG', icon: <FileImage size={16} />, format: 'jpeg' },
    { label: 'PNG', icon: <Image size={16} />, format: 'png' },
    { label: 'DICOM', icon: <FileImage size={16} />, format: 'dicom' },
    { label: 'PDF', icon: <FileImage size={16} />, format: 'pdf' }
  ];

  return (
    <div className="bg-white shadow-md p-2 flex flex-col gap-2 relative z-10">
      {/* Primary Tools Row */}
      <div className="flex gap-2 items-center overflow-x-auto pb-1">
        <ToolbarButton 
          icon={<Back size={20} />} 
          label="Previous" 
          onClick={onPrevImage}
          disabled={currentImageIndex <= 0}
        />
        <ToolbarButton 
          icon={<Forward size={20} />} 
          label="Next" 
          onClick={onNextImage}
          disabled={currentImageIndex >= totalImages - 1}
        />
        
        <div className="h-8 border-l border-gray-300 mx-1"></div>
        
        <ToolbarButton 
          icon={<Move size={20} />} 
          label="Pan" 
          onClick={() => {
            onPan();
            onToolChange('Pan');
          }}
          isActive={activeTool === 'Pan'}
        />
        
        <div className="relative" ref={zoomDropdownRef}>
          <ToolbarButton
            icon={<ZoomIn size={20} />}
            label="Zoom"
            onClick={() => {
              setShowZoomDropdown(!showZoomDropdown);
              onToolChange('Zoom');
            }}
            isActive={showZoomDropdown || activeTool === 'Zoom'}
          />
          {showZoomDropdown && (
            <div className="fixed left-1/2 -translate-x-1/2 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <button
                className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 flex items-center"
                onClick={() => {
                  onZoomIn();
                  setShowZoomDropdown(false);
                }}
              >
                <ZoomIn size={16} className="mr-2" />
                Zoom In
              </button>
              <button
                className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 flex items-center"
                onClick={() => {
                  onZoomOut();
                  setShowZoomDropdown(false);
                }}
              >
                <ZoomOut size={16} className="mr-2" />
                Zoom Out
              </button>
              <button
                className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 flex items-center"
                onClick={() => {
                  onFit();
                  setShowZoomDropdown(false);
                }}
              >
                <Maximize2 size={16} className="mr-2" />
                Fit to Screen
              </button>
            </div>
          )}
        </div>

        <ToolbarButton 
          icon={<Search size={20} />} 
          label="Magnify" 
          onClick={() => onToolChange('Magnify')}
          isActive={activeTool === 'Magnify'}
        />

        <ToolbarButton 
          icon={<Contrast size={20} />} 
          label="WW/WC" 
          onClick={() => {
            onWindowLevel();
            onToolChange('Wwwc');
          }}
          isActive={activeTool === 'Wwwc'}
        />

        <div className="relative" ref={measureDropdownRef}>
          <ToolbarButton
            icon={<Ruler size={20} />}
            label="Measure"
            onClick={() => setShowMeasureDropdown(!showMeasureDropdown)}
            isActive={showMeasureDropdown || measureTools.some(tool => tool.tool === activeTool)}
          />
          {showMeasureDropdown && (
            <div className="fixed left-1/2 -translate-x-1/2 mt-2 w-[480px] bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="grid grid-cols-3 gap-2 p-3">
                {measureTools.map((tool) => (
                  <button
                    key={tool.tool}
                    className={`flex items-center px-3 py-2 rounded text-sm ${
                      activeTool === tool.tool 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      onToolChange(tool.tool);
                      setShowMeasureDropdown(false);
                    }}
                  >
                    {tool.icon}
                    <span className="ml-2">{tool.label}</span>
                  </button>
                ))}
              </div>
              {onClearMeasurements && (
                <div className="border-t border-gray-200 p-3">
                  <button
                    className="w-full px-3 py-2 text-sm text-center text-red-600 hover:bg-red-50 rounded border border-red-200"
                    onClick={() => {
                      onClearMeasurements();
                      setShowMeasureDropdown(false);
                    }}
                  >
                    Clear All Measurements
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="relative" ref={annotateDropdownRef}>
          <ToolbarButton
            icon={<Pencil size={20} />}
            label="Annotate"
            onClick={() => {
              setShowAnnotateDropdown(!showAnnotateDropdown);
              if (onAnnotate) onAnnotate();
            }}
            isActive={showAnnotateDropdown || annotateTools.some(tool => tool.tool === activeTool)}
          />
          {showAnnotateDropdown && (
            <div className="fixed left-1/2 -translate-x-1/2 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              {annotateTools.map((tool) => (
                <button
                  key={tool.tool}
                  className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-100 flex items-center ${
                    activeTool === tool.tool ? 'bg-blue-100 text-blue-700' : ''
                  }`}
                  onClick={() => {
                    onToolChange(tool.tool);
                    setShowAnnotateDropdown(false);
                  }}
                >
                  {tool.icon}
                  <span className="ml-2">{tool.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative" ref={layoutDropdownRef}>
          <ToolbarButton
            icon={<Layout size={20} />}
            label="Layout"
            onClick={() => setShowLayoutDropdown(!showLayoutDropdown)}
            isActive={showLayoutDropdown}
          />
          {showLayoutDropdown && (
            <div className="fixed left-1/2 -translate-x-1/2 mt-2 w-[320px] bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="grid grid-cols-2 gap-2 p-3">
                {layouts.map((layoutOption) => (
                  <button
                    key={layoutOption.value}
                    className={`flex items-center px-3 py-2 rounded text-sm ${
                      layout === layoutOption.value 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      onLayoutChange(layoutOption.value);
                      setShowLayoutDropdown(false);
                    }}
                  >
                    {layoutOption.icon}
                    <span className="ml-2">{layoutOption.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-8 border-l border-gray-300 mx-1"></div>

        <ToolbarButton 
          icon={<RotateCcw size={20} />} 
          label="Rotate L" 
          onClick={() => onRotate('ccw')}
        />
        <ToolbarButton 
          icon={<RotateCw size={20} />} 
          label="Rotate R" 
          onClick={() => onRotate('cw')}
        />
        <ToolbarButton 
          icon={<FlipHorizontal size={20} />} 
          label="Flip H" 
          onClick={onFlipHorizontal}
        />
        <ToolbarButton 
          icon={<FlipVertical size={20} />} 
          label="Flip V" 
          onClick={onFlipVertical}
        />

        <div className="h-8 border-l border-gray-300 mx-1"></div>

        <ToolbarButton 
          icon={<RefreshCw size={20} />} 
          label="Reset" 
          onClick={onReset}
        />

        <ToolbarButton 
          icon={<Maximize2 size={20} />} 
          label="Fullscreen" 
          onClick={onFullScreen}
        />

        <div className="relative" ref={exportDropdownRef}>
          <ToolbarButton
            icon={<Download size={20} />}
            label="Export"
            onClick={() => setShowExportDropdown(!showExportDropdown)}
            isActive={showExportDropdown}
          />
          {showExportDropdown && (
            <div className="fixed left-1/2 -translate-x-1/2 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              {exportFormats.map((format) => (
                <button
                  key={format.format}
                  className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 flex items-center"
                  onClick={() => {
                    if (onExport) onExport();
                    setShowExportDropdown(false);
                  }}
                >
                  {format.icon}
                  <span className="ml-2">{format.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          ref={moreToolsRef}
          className={`flex flex-col items-center p-2 rounded transition-colors min-w-[60px] ${
            showMoreTools ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
          title="More Tools"
          onClick={() => setShowMoreTools(!showMoreTools)}
        >
          <div className="text-current"><MoreHorizontal size={20} /></div>
          <span className="text-xs mt-1 text-current">More</span>
        </button>
      </div>

      {/* Secondary Tools Row (shown when More is clicked) */}
      {showMoreTools && (
        <div className="flex gap-2 items-center overflow-x-auto border-t border-gray-200 pt-2">
          <ToolbarButton 
            icon={<Play size={20} />} 
            label="Cine" 
            onClick={onPlayCine}
          />
          <ToolbarButton 
            icon={<Printer size={20} />} 
            label="Print" 
            onClick={onPrintImage}
          />
          <ToolbarButton 
            icon={<Share size={20} />} 
            label="Share" 
            onClick={onShare}
          />
          <ToolbarButton 
            icon={<Contrast size={20} />} 
            label="Invert" 
            onClick={onInvertColors}
          />
          <ToolbarButton icon={<Box size={20} />} label="3D" />
          <ToolbarButton icon={<Layers size={20} />} label="MPR" />
          <ToolbarButton icon={<Eye size={20} />} label="Overlay" />
          <ToolbarButton icon={<Info size={20} />} label="Info" />
        </div>
      )}

      <div className="flex items-center justify-center text-xs text-gray-600 bg-gray-50 py-1 px-2 rounded">
        <span>Image: {currentImageIndex + 1} / {totalImages}</span>
      </div>
    </div>
  );
};