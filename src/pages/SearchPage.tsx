import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, Layout, Upload, X, File } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SearchFormData {
  patientId: string;
  patientName: string;
  studyDateFrom: string;
  studyDateTo: string;
  accessionNumber: string;
  modality: string;
}

interface StudyData {
  patientName: string;
  patientId: string;
  studyDate: string;
  modality: string;
  description: string;
  accessionNumber: string;
  imageUrl: string;
}

interface UploadFormData {
  patientName: string;
  patientId: string;
  studyDate: string;
  modality: string;
  accessionNumber: string;
  file: File | null;
}

const initialFormData: SearchFormData = {
  patientId: '',
  patientName: '',
  studyDateFrom: '',
  studyDateTo: '',
  accessionNumber: '',
  modality: '',
};

const initialUploadFormData: UploadFormData = {
  patientName: '',
  patientId: '',
  studyDate: new Date().toISOString().split('T')[0],
  modality: 'CT',
  accessionNumber: '',
  file: null,
};

const sampleStudies: StudyData[] = [
  {
    patientName: "John Doe",
    patientId: "PT0001",
    studyDate: "2024-03-15",
    modality: "CT",
    description: "Chest CT With Contrast",
    accessionNumber: "ACC123456",
    imageUrl: "wadouri:https://raw.githubusercontent.com/cornerstonejs/cornerstoneWADOImageLoader/master/testImages/CT1_J2KR"
  },
  {
    patientName: "Jane Smith",
    patientId: "PT0002",
    studyDate: "2024-03-14",
    modality: "MR",
    description: "Brain MRI Without Contrast",
    accessionNumber: "ACC123457",
    imageUrl: "wadouri:https://raw.githubusercontent.com/cornerstonejs/cornerstoneWADOImageLoader/master/testImages/MR-MONO2-12-shoulder"
  },
  {
    patientName: "Robert Johnson",
    patientId: "PT0003",
    studyDate: "2024-03-13",
    modality: "XR",
    description: "Chest X-Ray PA and Lateral",
    accessionNumber: "ACC123458",
    imageUrl: "wadouri:https://raw.githubusercontent.com/cornerstonejs/cornerstoneWADOImageLoader/master/testImages/CT2_J2KR"
  },
  {
    patientName: "Maria Garcia",
    patientId: "PT0004",
    studyDate: "2024-03-12",
    modality: "US",
    description: "Abdominal Ultrasound",
    accessionNumber: "ACC123459",
    imageUrl: "wadouri:https://raw.githubusercontent.com/cornerstonejs/cornerstoneWADOImageLoader/master/testImages/CT2_J2KR"
  },
  {
    patientName: "William Brown",
    patientId: "PT0005",
    studyDate: "2024-03-11",
    modality: "NM",
    description: "Nuclear Medicine Bone Scan",
    accessionNumber: "ACC123460",
    imageUrl: "wadouri:https://raw.githubusercontent.com/cornerstonejs/cornerstoneWADOImageLoader/master/testImages/CT2_J2KR"
  }
];

export const SearchPage: React.FC = () => {
  const [formData, setFormData] = useState<SearchFormData>(initialFormData);
  const [filteredStudies, setFilteredStudies] = useState<StudyData[]>(sampleStudies);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFormData, setUploadFormData] = useState<UploadFormData>(initialUploadFormData);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUploadInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUploadFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadFormData(prev => ({ ...prev, file: e.target.files![0] }));
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const filtered = sampleStudies.filter(study => {
      return (
        (!formData.patientId || study.patientId.toLowerCase().includes(formData.patientId.toLowerCase())) &&
        (!formData.patientName || study.patientName.toLowerCase().includes(formData.patientName.toLowerCase())) &&
        (!formData.modality || study.modality === formData.modality) &&
        (!formData.accessionNumber || study.accessionNumber.toLowerCase().includes(formData.accessionNumber.toLowerCase())) &&
        (!formData.studyDateFrom || new Date(study.studyDate) >= new Date(formData.studyDateFrom)) &&
        (!formData.studyDateTo || new Date(study.studyDate) <= new Date(formData.studyDateTo))
      );
    });
    setFilteredStudies(filtered);
  };

  const handleStudyClick = (study: StudyData) => {
    navigate('/viewer', { 
      state: { 
        patientName: study.patientName,
        patientId: study.patientId,
        studyDate: study.studyDate,
        modality: study.modality,
        accessionNumber: study.accessionNumber,
        imageUrl: study.imageUrl
      } 
    });
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    setIsUploading(true);
    
    // Validate form data
    if (!uploadFormData.patientName) {
      setUploadError("Patient name is required");
      setIsUploading(false);
      return;
    }
    
    if (!uploadFormData.patientId) {
      setUploadError("Patient ID is required");
      setIsUploading(false);
      return;
    }
    
    if (!uploadFormData.file) {
      setUploadError("Please select a file to upload");
      setIsUploading(false);
      return;
    }
    
    // In a real application, you would upload the file to a server here
    // For this demo, we'll simulate a successful upload
    setTimeout(() => {
      // Create a new study record
      const newStudy: StudyData = {
        patientName: uploadFormData.patientName,
        patientId: uploadFormData.patientId,
        studyDate: uploadFormData.studyDate,
        modality: uploadFormData.modality,
        description: `${uploadFormData.modality} Study`,
        accessionNumber: uploadFormData.accessionNumber || `ACC${Math.floor(Math.random() * 1000000)}`,
        // In a real app, this would be the URL of the uploaded file
        imageUrl: "wadouri:https://raw.githubusercontent.com/cornerstonejs/cornerstoneWADOImageLoader/master/testImages/CT2_J2KR"
      };
      
      // Add the new study to the list and reset the form
      setFilteredStudies([newStudy, ...filteredStudies]);
      setUploadFormData(initialUploadFormData);
      setIsUploading(false);
      setShowUploadModal(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Layout className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">DICOM Viewer</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Modality
            </button>
            <div className="flex items-center border-l border-gray-300 pl-4">
              <span className="text-sm text-gray-700 mr-3">
                {user?.name || user?.employeeId}
              </span>
              <button
                onClick={logout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Patient ID</label>
                  <input
                    type="text"
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Patient Name</label>
                  <input
                    type="text"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Study Date From</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="date"
                      name="studyDateFrom"
                      value={formData.studyDateFrom}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Study Date To</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="date"
                      name="studyDateTo"
                      value={formData.studyDateTo}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Accession Number</label>
                  <input
                    type="text"
                    name="accessionNumber"
                    value={formData.accessionNumber}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Modality</label>
                  <select
                    name="modality"
                    value={formData.modality}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">All</option>
                    <option value="CT">CT</option>
                    <option value="MR">MR</option>
                    <option value="XR">XR</option>
                    <option value="US">US</option>
                    <option value="NM">NM</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </button>
              </div>
            </form>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Study Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modality
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Accession #
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudies.map((study, index) => (
                  <tr 
                    key={index} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors" 
                    onClick={() => handleStudyClick(study)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {study.patientName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {study.patientId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {study.studyDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {study.modality}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {study.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {study.accessionNumber}
                    </td>
                  </tr>
                ))}
                {filteredStudies.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                      No studies found. Try adjusting your search criteria or upload a new study.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Upload Modality Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Upload Modality</h3>
                  <button
                    type="button"
                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={() => setShowUploadModal(false)}
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                {uploadError && (
                  <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
                    {uploadError}
                  </div>
                )}
                
                <form onSubmit={handleUploadSubmit} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="patientName" className="block text-sm font-medium text-gray-700">
                      Patient Name*
                    </label>
                    <input
                      type="text"
                      id="patientName"
                      name="patientName"
                      required
                      value={uploadFormData.patientName}
                      onChange={handleUploadInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="patientId" className="block text-sm font-medium text-gray-700">
                      Patient ID*
                    </label>
                    <input
                      type="text"
                      id="patientId"
                      name="patientId"
                      required
                      value={uploadFormData.patientId}
                      onChange={handleUploadInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="studyDate" className="block text-sm font-medium text-gray-700">
                      Study Date
                    </label>
                    <input
                      type="date"
                      id="studyDate"
                      name="studyDate"
                      value={uploadFormData.studyDate}
                      onChange={handleUploadInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="modality" className="block text-sm font-medium text-gray-700">
                      Modality
                    </label>
                    <select
                      id="modality"
                      name="modality"
                      value={uploadFormData.modality}
                      onChange={handleUploadInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="CT">CT</option>
                      <option value="MR">MR</option>
                      <option value="XR">XR</option>
                      <option value="US">US</option>
                      <option value="NM">NM</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="accessionNumber" className="block text-sm font-medium text-gray-700">
                      Accession Number
                    </label>
                    <input
                      type="text"
                      id="accessionNumber"
                      name="accessionNumber"
                      value={uploadFormData.accessionNumber}
                      onChange={handleUploadInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      File Upload*
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        {uploadFormData.file ? (
                          <div className="flex flex-col items-center">
                            <File className="h-12 w-12 text-gray-400" />
                            <p className="text-sm text-gray-700 mt-2">{uploadFormData.file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(uploadFormData.file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <button
                              type="button"
                              onClick={() => setUploadFormData(prev => ({ ...prev, file: null }))}
                              className="mt-2 text-sm text-red-600 hover:text-red-500"
                            >
                              Remove file
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                              <label
                                htmlFor="file-upload"
                                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                              >
                                <span>Upload a file</span>
                                <input
                                  id="file-upload"
                                  name="file-upload"
                                  type="file"
                                  className="sr-only"
                                  accept=".dcm,.jpg,.jpeg,.png"
                                  onChange={handleFileChange}
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              DICOM, PNG, JPG up to 10MB
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-5 sm:mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowUploadModal(false)}
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUploading || !uploadFormData.file}
                      className={`inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                        ${(isUploading || !uploadFormData.file) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isUploading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Uploading...
                        </>
                      ) : 'Upload'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};