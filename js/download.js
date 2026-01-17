// Download page functionality

document.addEventListener('DOMContentLoaded', function() {
    // Function to get all stored submissions from localStorage
    function getStoredSubmissions() {
        const stored = localStorage.getItem('formSubmissions');
        return stored ? JSON.parse(stored) : [];
    }

    // Function to convert data to CSV format
    function convertToCSV(data) {
        if (data.length === 0) {
            return 'Name,Email,Events,Date,Time\n';
        }

        const headers = ['Name', 'Email', 'Events', 'Date', 'Time'];
        const csvRows = [headers.join(',')];

        data.forEach(submission => {
            const events = submission.events && submission.events.length > 0 
                ? submission.events.join('; ') 
                : 'None';
            const row = [
                `"${submission.name}"`,
                `"${submission.email}"`,
                `"${events}"`,
                `"${submission.date}"`,
                `"${submission.time}"`
            ];
            csvRows.push(row.join(','));
        });

        return csvRows.join('\n');
    }

    // Function to download CSV file
    function downloadCSV(data, filename = 'form_submissions.csv') {
        const csv = convertToCSV(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Update submission count display
    function updateSubmissionCount() {
        const submissions = getStoredSubmissions();
        const countElement = document.getElementById('submissionCount');
        const downloadButton = document.getElementById('downloadButton');
        
        if (countElement) {
            if (submissions.length === 0) {
                countElement.textContent = 'No submissions yet.';
                countElement.style.color = '#ccc';
            } else {
                countElement.textContent = `Total submissions: ${submissions.length}`;
                countElement.style.color = '#fff';
            }
        }
        
        if (downloadButton) {
            downloadButton.disabled = submissions.length === 0;
        }
    }

    // Download button functionality
    const downloadButton = document.getElementById('downloadButton');
    
    if (downloadButton) {
        downloadButton.addEventListener('click', function() {
            const submissions = getStoredSubmissions();
            if (submissions.length === 0) {
                alert('No submissions to download yet.');
                return;
            }
            downloadCSV(submissions);
        });
    }

    // Update count on page load
    updateSubmissionCount();
});

