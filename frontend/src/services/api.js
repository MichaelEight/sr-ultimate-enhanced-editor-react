// src/services/api.js
export const uploadFile = async (formData) => {
    console.log('Sending upload request...'); // Log before sending request
    const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
        console.error('Upload error:', data.error); // Log upload error
        throw new Error(data.error);
    }
    console.log('Upload response:', data); // Log successful response
    return data;
};

export const exportFile = async (scenarioName, structure) => {
    const response = await fetch('http://localhost:5000/export', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            scenario_name: scenarioName,
            structure: structure,
        }),
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
    }

    return await response.blob();
};
