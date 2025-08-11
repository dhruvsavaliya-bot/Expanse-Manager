import React, { useState, useEffect, useContext, useRef } from 'react';
import { UserContext } from '../../contexts/UserContext'; 
import './ReportPage.css';


const ReportPage = () => {
  const { loggedInUser } = useContext(UserContext);

  const [reportTitle, setReportTitle] = useState('');
  const [reportContent, setReportContent] = useState([]); 
  const [currentText, setCurrentText] = useState(''); 
  const [savedReports, setSavedReports] = useState([]);
  const [editingReportId, setEditingReportId] = useState(null);
  const fileInputRef = useRef(null);

  const STORAGE_KEY = 'customUserReports';

  // Load reports from localStorage on component
  useEffect(() => {
    if (loggedInUser) {
      const storedReports = localStorage.getItem(`${STORAGE_KEY}_${loggedInUser.id}`);
      if (storedReports) {
        setSavedReports(JSON.parse(storedReports));
      }
    }
  }, [loggedInUser]);

  // Save reports to localStorage whenever savedReports changes
  useEffect(() => {
    if (loggedInUser && savedReports.length > 0) {
      localStorage.setItem(`${STORAGE_KEY}_${loggedInUser.id}`, JSON.stringify(savedReports));
    } else if (loggedInUser && savedReports.length === 0) {
      // Clear storage if all reports for the user are deleted
      localStorage.removeItem(`${STORAGE_KEY}_${loggedInUser.id}`);
    }
  }, [savedReports, loggedInUser]);

  const handleSaveReport = () => {
    if (!loggedInUser) {
      alert("Please log in to save reports.");
      return;
    }
    if (!reportTitle.trim() || reportContent.length === 0) {
      alert("Please enter a title and add some content (text or images) for the report.");
      return;
    }

    const now = new Date().toISOString();
    let updatedReports;

    if (editingReportId) {
      // Update existing report
      updatedReports = savedReports.map(report =>
        report.id === editingReportId
          ? { ...report, title: reportTitle, content: reportContent, lastModified: now }
          : report
      );
    } else {
      // Add new report
      const newReport = {
        id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, 
        userId: loggedInUser.id,
        title: reportTitle,
        content: reportContent,
        createdDate: now,
        lastModified: now,
      };
      updatedReports = [...savedReports, newReport];
    }
    setSavedReports(updatedReports);
    alert(editingReportId ? "Report updated successfully!" : "Report saved successfully!");
    handleNewReport(); 
  };

  const handleNewReport = () => {
    setReportTitle('');
    setReportContent([]);
    setCurrentText('');
    setEditingReportId(null);
    console.log("Cleared editor for new report.");
  };

  const loadReportForEditing = (reportId) => {
    const reportToEdit = savedReports.find(report => report.id === reportId);
    if (reportToEdit) {
      setReportTitle(reportToEdit.title);
      // Handle both old string content and new array content
      if (typeof reportToEdit.content === 'string') {
        setReportContent([{ type: 'text', value: reportToEdit.content, id: `text_${Date.now()}` }]);
      } else {
        setReportContent(reportToEdit.content || []);
      }
      setCurrentText(''); 
      setEditingReportId(reportToEdit.id);
    }
  };

  const handleDeleteReport = (reportId) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      const updatedReports = savedReports.filter(report => report.id !== reportId);
      setSavedReports(updatedReports);
      if (editingReportId === reportId) { 
        handleNewReport();
      }
      alert("Report deleted.");
    }
  };

  const handleAddText = () => {
    if (!currentText.trim()) return;
    setReportContent([...reportContent, { type: 'text', value: currentText, id: `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }]);
    setCurrentText('');
  };

  const handleImageSelected = (event) => {
    const file = event.target.files[0];
    console.log("Image selected:", file); 
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log("FileReader result (base64):", reader.result ? reader.result.substring(0, 100) + "..." : "null"); // Log a snippet of the base64 string
        const newImageBlock = { type: 'image', src: reader.result, id: `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` };
        console.log("New image block:", newImageBlock);
        console.log("reportContent before adding image:", reportContent);
        setReportContent(prevContent => {
          const updatedContent = [...prevContent, newImageBlock];
          console.log("reportContent after adding image (inside setReportContent):", updatedContent);
          return updatedContent;
        });
      };
      reader.onerror = (error) => {
        console.error("FileReader error:", error);
      };
      reader.readAsDataURL(file);
    } else {
      console.log("No file selected or file selection was cancelled.");
    }
  };

  // Function to allow removing a content block
  const handleRemoveBlock = (blockId) => {
    setReportContent(reportContent.filter(block => block.id !== blockId));
  };

  const handleDownloadReport = () => {
    if (!reportTitle.trim() && reportContent.length === 0) {
      alert("Please create some content before downloading.");
      return;
    }

    let reportHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${reportTitle || 'Report'}</title>
        <style>
          body { font-family: sans-serif; margin: 20px; }
          h1 { color: #333; }
          p { white-space: pre-wrap; margin-bottom: 10px; }
          img { max-width: 100%; height: auto; display: block; margin-bottom: 10px; border: 1px solid #eee; }
          .report-block { margin-bottom: 15px; padding: 10px; border: 1px solid #f0f0f0; }
        </style>
      </head>
      <body>
        <h1>${reportTitle || 'Report'}</h1>
    `;

    reportContent.forEach(block => {
      reportHtml += '<div class="report-block">';
      if (block.type === 'text') {
        reportHtml += `<p>${block.value.replace(/</g, "<").replace(/>/g, ">")}</p>`;
      } else if (block.type === 'image' && block.src) {
        reportHtml += `<img src="${block.src}" alt="Report Image">`;
      }
      reportHtml += '</div>';
    });

    reportHtml += `
      </body>
      </html>
    `;

    const blob = new Blob([reportHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(reportTitle || 'report').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert("Report download initiated as an HTML file.");
  };


  return (
    <div className="report-page-container custom-report-editor">
      <h1>Create Your Report</h1>

      <div className="report-actions">
        <button onClick={handleNewReport} className="btn btn-secondary">New Report</button>
        <button onClick={handleSaveReport} className="btn btn-primary" style={{ marginRight: '10px' }}>Save Report</button>
        <button onClick={handleDownloadReport} className="btn btn-success">Download Report</button>
      </div>

      <div className="form-group">
        <label htmlFor="reportTitle">Report Title:</label>
        <input
          type="text"
          id="reportTitle"
          className="form-control"
          value={reportTitle}
          onChange={(e) => setReportTitle(e.target.value)}
          placeholder="Enter report title"
        />
      </div>

      {/* Input area for text */}
      <div className="form-group">
        <label htmlFor="currentText">Add Text Content:</label>
        <textarea
          id="currentText"
          className="form-control"
          value={currentText}
          onChange={(e) => setCurrentText(e.target.value)}
          placeholder="Type text here..."
          rows="5"
          style={{ backgroundColor: '#fff', color: '#000', width: '100%' }}
        />
        <button onClick={handleAddText} className="btn btn-info btn-sm mt-2">Add Text to Report</button>
      </div>

      {/* Input for image upload */}
      <div className="form-group">
        <label htmlFor="imageUploadButton">Add Image:</label>
        <input
          type="file"
          id="imageUpload"
          ref={fileInputRef}
          className="hidden-file-input" 
          accept="image/*"
          onChange={handleImageSelected}
          style={{ display: 'none' }} 
        />
        <button
          id="imageUploadButton"
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          className="btn btn-success btn-sm" 
        >
          Choose Image
        </button>
      </div>

      {/* Display area for report content blocks */}
      <div className="report-content-display mt-3">
        <h2>Report Preview</h2>
        {reportContent.length === 0 && <p>Your report content will appear here.</p>}
        {reportContent.map((block, index) => {
          console.log(`Rendering block ${index}:`, block); 
          if (block.type === 'image') {
            console.log(`Image block src:`, block.src ? block.src.substring(0, 100) + "..." : "null");
          }
          return (
            <div key={block.id || `block-${index}`} className="report-block" style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd' }}>
              {block.type === 'text' && <p style={{ whiteSpace: 'pre-wrap' }}>{block.value}</p>}
              {block.type === 'image' && block.src && <img src={block.src} alt="Report Content" style={{ maxWidth: '100%', maxHeight: '300px', display: 'block' }} />}
              {block.type === 'image' && !block.src && <p style={{color: 'red'}}>Image source is missing!</p>}
              <button onClick={() => handleRemoveBlock(block.id)} className="btn btn-danger btn-xs mt-1">Remove</button>
            </div>
          );
        })}
      </div>

      <div className="saved-reports-section mt-5">
        <h2>Saved Reports</h2>
        {savedReports.length > 0 ? (
          <ul>
            {savedReports.map(report => (
              <li key={report.id} onClick={() => loadReportForEditing(report.id)}>
                <div>
                  <strong>{report.title}</strong>
                  <br />
                  <small>Last Modified: {new Date(report.lastModified).toLocaleString()}</small>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteReport(report.id);
                  }}
                  className="btn btn-danger btn-sm"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No custom reports saved yet.</p>
        )}
      </div>
    </div>
  );
};

export default ReportPage;