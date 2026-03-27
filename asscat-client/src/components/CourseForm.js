import React, { useState } from 'react';
import axios from 'axios';

function CourseForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deptId, setDeptId] = useState('');
  const [uploaderId, setUploaderId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await axios.post('http://localhost:8080/courses', {
        title,
        description,
        dept_id: parseInt(deptId, 10), // Ensure it's an integer
        uploader_id: parseInt(uploaderId, 10), // Ensure it's an integer
      });

      if (response.data.status === 201) {
        setMessage(response.data.messages.success + ` (ID: ${response.data.course_id})`);
        setTitle('');
        setDescription('');
        setDeptId('');
        setUploaderId('');
      } else {
        setError('An unexpected success response occurred.');
      }
    } catch (err) {
      if (err.response) {
        console.error('Server Error:', err.response.data);
        if (err.response.data.messages) {
          const validationErrors = Object.values(err.response.data.messages).join(', ');
          setError(`Validation Failed: ${validationErrors}`);
        } else {
          setError(err.response.data.message || 'An error occurred on the server.');
        }
      } else if (err.request) {
        console.error('Network Error:', err.request);
        setError('Network Error: No response from server. Is the backend running?');
      } else {
        console.error('Axios Error:', err.message);
        setError('An unexpected error occurred while sending the request.');
      }
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2>Create New Course</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="title" style={{ display: 'block', marginBottom: '5px' }}>Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="description" style={{ display: 'block', marginBottom: '5px' }}>Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd' }}
          ></textarea>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="deptId" style={{ display: 'block', marginBottom: '5px' }}>Department ID:</label>
          <input
            type="number"
            id="deptId"
            value={deptId}
            onChange={(e) => setDeptId(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="uploaderId" style={{ display: 'block', marginBottom: '5px' }}>Uploader ID:</label>
          <input
            type="number"
            id="uploaderId"
            value={uploaderId}
            onChange={(e) => setUploaderId(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Create Course</button>
      </form>
      {message && <p style={{ color: 'green', marginTop: '15px' }}>{message}</p>}
      {error && <p style={{ color: 'red', marginTop: '15px' }}>{error}</p>}
    </div>
  );
}

export default CourseForm;