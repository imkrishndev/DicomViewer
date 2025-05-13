import * as cornerstone from 'cornerstone-core';

export class CinePlayer {
  private element: HTMLElement;
  private imageIds: string[];
  private isPlaying: boolean = false;
  private playIntervalId: number | null = null;
  private currentIndex: number = 0;
  private frameRate: number = 10;
  private frameChangeCallback: ((index: number) => void) | null = null;
  
  constructor(element: HTMLElement, imageIds: string[]) {
    this.element = element;
    this.imageIds = imageIds;
  }
  
  public play(): void {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    this.playIntervalId = window.setInterval(() => {
      this.nextFrame();
    }, 1000 / this.frameRate);
  }
  
  public pause(): void {
    if (!this.isPlaying) return;
    
    this.isPlaying = false;
    if (this.playIntervalId !== null) {
      window.clearInterval(this.playIntervalId);
      this.playIntervalId = null;
    }
  }
  
  public toggle(): boolean {
    if (this.isPlaying) {
      this.pause();
      return false;
    } else {
      this.play();
      return true;
    }
  }
  
  public nextFrame(): void {
    this.currentIndex = (this.currentIndex + 1) % this.imageIds.length;
    this.showImage(this.currentIndex);
  }
  
  public previousFrame(): void {
    this.currentIndex = (this.currentIndex - 1 + this.imageIds.length) % this.imageIds.length;
    this.showImage(this.currentIndex);
  }
  
  public setFrameRate(frameRate: number): void {
    this.frameRate = frameRate;
    
    if (this.isPlaying) {
      this.pause();
      this.play();
    }
  }
  
  public setFrameChangeCallback(callback: (index: number) => void): void {
    this.frameChangeCallback = callback;
  }
  
  private async showImage(index: number): Promise<void> {
    try {
      const image = await cornerstone.loadImage(this.imageIds[index]);
      cornerstone.displayImage(this.element, image);
      
      if (this.frameChangeCallback) {
        this.frameChangeCallback(index);
      }
    } catch (error) {
      console.error('Error loading image during cine:', error);
    }
  }
  
  public dispose(): void {
    this.pause();
  }
}

export const printImage = (element: HTMLElement, metadata: any): void => {
  const canvas = element.querySelector('canvas');
  if (!canvas) return;
  
  // Create a new window
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print images');
    return;
  }
  
  // Generate the print content HTML
  const dataUrl = canvas.toDataURL('image/png');
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>DICOM Print - ${metadata.patientName}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
        }
        .header {
          border-bottom: 1px solid #ccc;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .image-container {
          text-align: center;
          margin: 20px 0;
        }
        img {
          max-width: 100%;
          height: auto;
          border: 1px solid #ddd;
        }
        .metadata {
          font-size: 12px;
          margin-top: 20px;
          border-top: 1px solid #ccc;
          padding-top: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        td {
          padding: 4px;
          border-bottom: 1px solid #eee;
        }
        td:first-child {
          font-weight: bold;
          width: 150px;
        }
        @media print {
          @page {
            size: auto;
            margin: 10mm;
          }
          body {
            padding: 0;
          }
          button {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>DICOM Image</h1>
        <button onclick="window.print();" style="padding: 8px 16px;">Print</button>
        <button onclick="window.close();" style="padding: 8px 16px; margin-left: 10px;">Close</button>
      </div>
      
      <div class="image-container">
        <img src="${dataUrl}" alt="DICOM Image" />
      </div>
      
      <div class="metadata">
        <h3>Image Information</h3>
        <table>
          <tr><td>Patient Name:</td><td>${metadata.patientName}</td></tr>
          <tr><td>Patient ID:</td><td>${metadata.patientId}</td></tr>
          <tr><td>Study Date:</td><td>${metadata.studyDate}</td></tr>
          <tr><td>Modality:</td><td>${metadata.modality}</td></tr>
          <tr><td>Series Number:</td><td>${metadata.seriesNumber || 'N/A'}</td></tr>
          <tr><td>Instance Number:</td><td>${metadata.instanceNumber || 'N/A'}</td></tr>
          <tr><td>Print Date:</td><td>${new Date().toLocaleString()}</td></tr>
        </table>
      </div>
    </body>
    </html>
  `);
  
  printWindow.document.close();
};

export const exportImage = (element: HTMLElement, format = 'png', filename = 'dicom-image.png'): void => {
  const canvas = element.querySelector('canvas');
  if (!canvas) return;
  
  let imageType = 'image/png';
  let fileExtension = '.png';
  
  switch (format.toLowerCase()) {
    case 'jpeg':
    case 'jpg':
      imageType = 'image/jpeg';
      fileExtension = '.jpg';
      break;
    case 'png':
      imageType = 'image/png';
      fileExtension = '.png';
      break;
    default:
      console.warn(`Unsupported format: ${format}, defaulting to PNG`);
  }
  
  // Make sure filename has the correct extension
  if (!filename.endsWith(fileExtension)) {
    filename = filename.replace(/\.[^/.]+$/, '') + fileExtension;
  }
  
  // Create a download link
  const dataUrl = canvas.toDataURL(imageType);
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.click();
};