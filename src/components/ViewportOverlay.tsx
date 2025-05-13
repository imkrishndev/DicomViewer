import React, { useState } from 'react';
import { Info, Edit, X } from 'lucide-react';

interface ViewportOverlayProps {
  metadata: {
    patientName: string;
    patientId: string;
    studyDate: string;
    modality: string;
    seriesNumber: string;
    instanceNumber: string;
  };
  viewport: {
    voi: {
      windowWidth: number;
      windowCenter: number;
    };
    scale: number;
    rotation: number;
    hflip: boolean;
    vflip: boolean;
  };
  currentImageIndex: number;
  totalImages: number;
  onWindowLevelChange: (windowWidth: number, windowCenter: number) => void;
}

export const ViewportOverlay: React.FC<ViewportOverlayProps> = ({
  metadata,
  viewport,
  currentImageIndex,
  totalImages,
  onWindowLevelChange
}) => {
  const [showPatientInfo, setShowPatientInfo] = useState(false);
  const [isEditingWindowLevel, setIsEditingWindowLevel] = useState(false);
  const [windowWidth, setWindowWidth] = useState(viewport.voi.windowWidth);
  const [windowCenter, setWindowCenter] = useState(viewport.voi.windowCenter);

  const handleInfoToggle = () => {
    setShowPatientInfo(!showPatientInfo);
  };

  const handleWindowLevelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onWindowLevelChange(windowWidth, windowCenter);
    setIsEditingWindowLevel(false);
  };

  const toggleWindowLevelEdit = () => {
    if (!isEditingWindowLevel) {
      setWindowWidth(viewport.voi.windowWidth);
      setWindowCenter(viewport.voi.windowCenter);
    }
    setIsEditingWindowLevel(!isEditingWindowLevel);
  };

  return (
    <>
      {/* Top-left: Patient Info */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm flex items-center">
        <button
          onClick={handleInfoToggle}
          className="mr-2 hover:text-blue-300 focus:outline-none"
          title="Toggle Patient Information"
        >
          <Info size={16} />
        </button>
        <span>{metadata.patientName}</span>
      </div>

      {/* Bottom-left: Image Info */}
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
        <div>
          {metadata.modality} • Image: {currentImageIndex + 1}/{totalImages}
        </div>
      </div>

      {/* Bottom-right: Window/Level */}
      <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
        <div className="flex items-center">
          <span className="mr-1">WW/WC: {viewport.voi.windowWidth.toFixed(0)}/{viewport.voi.windowCenter.toFixed(0)}</span>
          <button
            onClick={toggleWindowLevelEdit}
            className="ml-2 hover:text-blue-300 focus:outline-none"
            title="Edit Window/Level"
          >
            <Edit size={14} />
          </button>
        </div>
        <div>Zoom: {(viewport.scale * 100).toFixed(0)}%</div>
      </div>

      {/* Top-right: Orientation Markers */}
      <div className="absolute top-2 right-2 font-bold text-lg text-white">
        <div className="absolute top-12 left-2 transform -translate-x-1/2">{viewport.vflip ? 'P' : 'A'}</div>
        <div className="absolute bottom-12 left-2 transform -translate-x-1/2">{viewport.vflip ? 'A' : 'P'}</div>
        <div className="absolute top-2 left-12 transform -translate-y-1/2">{viewport.hflip ? 'R' : 'L'}</div>
        <div className="absolute top-2 right-12 transform -translate-y-1/2">{viewport.hflip ? 'L' : 'R'}</div>
      </div>

      {/* Patient Info Modal */}
      {showPatientInfo && (
        <div className="absolute top-12 left-2 bg-gray-800 bg-opacity-95 text-white p-4 rounded-lg shadow-lg z-10 max-w-xs">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold">Patient Information</h3>
            <button
              onClick={() => setShowPatientInfo(false)}
              className="text-gray-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
          <div className="space-y-1 text-sm">
            <div><span className="font-semibold">Name:</span> {metadata.patientName}</div>
            <div><span className="font-semibold">ID:</span> {metadata.patientId}</div>
            <div><span className="font-semibold">Study Date:</span> {metadata.studyDate}</div>
            <div><span className="font-semibold">Modality:</span> {metadata.modality}</div>
            <div><span className="font-semibold">Series:</span> {metadata.seriesNumber || 'N/A'}</div>
            <div><span className="font-semibold">Instance:</span> {metadata.instanceNumber || 'N/A'}</div>
          </div>
        </div>
      )}

      {/* Window/Level Edit */}
      {isEditingWindowLevel && (
        <div className="absolute bottom-12 right-2 bg-gray-800 bg-opacity-95 text-white p-4 rounded-lg shadow-lg z-10">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold">Edit Window/Level</h3>
            <button
              onClick={() => setIsEditingWindowLevel(false)}
              className="text-gray-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleWindowLevelSubmit} className="space-y-3">
            <div>
              <label className="block text-xs mb-1">Window Width</label>
              <input
                type="number"
                value={windowWidth}
                onChange={(e) => setWindowWidth(Number(e.target.value))}
                className="bg-gray-700 text-white px-2 py-1 rounded w-full"
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Window Center</label>
              <input
                type="number"
                value={windowCenter}
                onChange={(e) => setWindowCenter(Number(e.target.value))}
                className="bg-gray-700 text-white px-2 py-1 rounded w-full"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
              >
                Apply
              </button>
            </div>
          </form>
          <div className="mt-2 text-xs text-gray-400">
            <strong>Presets:</strong>
            <div className="grid grid-cols-2 gap-1 mt-1">
              <button 
                className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
                onClick={() => {
                  setWindowWidth(400);
                  setWindowCenter(40);
                }}
              >
                CT Soft Tissue
              </button>
              <button 
                className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
                onClick={() => {
                  setWindowWidth(1500);
                  setWindowCenter(-500);
                }}
              >
                CT Lung
              </button>
              <button 
                className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
                onClick={() => {
                  setWindowWidth(2500);
                  setWindowCenter(500);
                }}
              >
                CT Bone
              </button>
              <button 
                className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
                onClick={() => {
                  setWindowWidth(400);
                  setWindowCenter(80);
                }}
              >
                CT Brain
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};