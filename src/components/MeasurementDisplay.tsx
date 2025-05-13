import React from 'react';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneTools from 'cornerstone-tools';

interface MeasurementDisplayProps {
  element: HTMLElement;
  activeTool: string;
  measurements: Record<string, any[]>;
}

export const MeasurementDisplay: React.FC<MeasurementDisplayProps> = ({
  element,
  activeTool,
  measurements
}) => {
  const formatMeasurement = (measurement: any, toolName: string): string => {
    switch (toolName) {
      case 'Length':
        return `Length: ${measurement.length?.toFixed(2)} mm`;
      case 'Angle':
        return `Angle: ${measurement.angle?.toFixed(2)}°`;
      case 'RectangleRoi':
        return `Area: ${measurement.area?.toFixed(2)} mm²`;
      case 'EllipticalRoi':
        return `Area: ${measurement.area?.toFixed(2)} mm²`;
      case 'Probe':
        return `HU: ${measurement.huValue?.toFixed(2)}`;
      case 'TextMarker':
        return measurement.text || '';
      default:
        return '';
    }
  };

  return (
    <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg max-w-xs">
      <h3 className="text-lg font-semibold mb-2">Measurements</h3>
      {Object.entries(measurements).map(([toolName, toolMeasurements]) => (
        toolMeasurements.length > 0 && (
          <div key={toolName} className="mb-2">
            <h4 className="text-sm font-medium text-gray-300">{toolName}</h4>
            <ul className="list-none">
              {toolMeasurements.map((measurement, index) => (
                <li key={index} className="text-sm">
                  {formatMeasurement(measurement, toolName)}
                </li>
              ))}
            </ul>
          </div>
        )
      ))}
    </div>
  );
};