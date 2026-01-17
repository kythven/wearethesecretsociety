// Main JavaScript file

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const burgerMenu = document.getElementById('burgerMenu');
    const navLinks = document.getElementById('navLinks');
    
    // Toggle burger menu
    burgerMenu.addEventListener('click', function() {
        burgerMenu.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
    
    // Close menu when clicking on a link
    const links = navLinks.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', function() {
            burgerMenu.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideNav = navLinks.contains(event.target);
        const isClickOnBurger = burgerMenu.contains(event.target);
        
        if (!isClickInsideNav && !isClickOnBurger && navLinks.classList.contains('active')) {
            burgerMenu.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });

    // Modal functionality
    const joinButton = document.getElementById('joinButton');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');
    const cancelButton = document.getElementById('cancelButton');
    const joinForm = document.getElementById('joinForm');

    // Open modal when "Join us" button is clicked
    joinButton.addEventListener('click', function() {
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    });

    // Close modal functions
    function closeModal() {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
        joinForm.reset(); // Reset form when closing
    }

    modalClose.addEventListener('click', closeModal);
    cancelButton.addEventListener('click', closeModal);

    // Close modal when clicking outside the modal content
    modalOverlay.addEventListener('click', function(event) {
        if (event.target === modalOverlay) {
            closeModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modalOverlay.classList.contains('active')) {
            closeModal();
        }
    });

    // Function to get all stored submissions from localStorage
    function getStoredSubmissions() {
        const stored = localStorage.getItem('formSubmissions');
        return stored ? JSON.parse(stored) : [];
    }

    // Function to save submission to localStorage
    function saveSubmission(name, email, events) {
        const submissions = getStoredSubmissions();
        const newSubmission = {
            id: Date.now(),
            name: name,
            email: email,
            events: events || [],
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString()
        };
        submissions.push(newSubmission);
        localStorage.setItem('formSubmissions', JSON.stringify(submissions));
        return submissions;
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

    // Download button functionality
    const downloadButton = document.getElementById('downloadButton');
    
    // Show download button if there are existing submissions
    function updateDownloadButton() {
        const submissions = getStoredSubmissions();
        if (submissions.length > 0) {
            downloadButton.style.display = 'block';
        } else {
            downloadButton.style.display = 'none';
        }
    }

    downloadButton.addEventListener('click', function() {
        const submissions = getStoredSubmissions();
        if (submissions.length === 0) {
            alert('No submissions to download yet.');
            return;
        }
        downloadCSV(submissions);
    });

    // Check for existing submissions on page load
    updateDownloadButton();

    // Handle form submission
    joinForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Get form values
        const name = document.getElementById('userName').value.trim();
        const email = document.getElementById('userEmail').value.trim();
        const checkedEvents = Array.from(document.querySelectorAll('input[name="event"]:checked')).map(cb => cb.value);
        
        // Basic validation
        if (!name || !email) {
            alert('Please fill in all required fields.');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }

        // Save submission
        const allSubmissions = saveSubmission(name, email, checkedEvents);
        
        // Automatically download updated CSV file
        downloadCSV(allSubmissions);
        
        // Show download button if it wasn't visible
        updateDownloadButton();
        
        console.log('Form submitted and saved:', { name, email, events: checkedEvents });
        alert(`Thank you for joining us, ${name}! Your information has been saved.`);
        
        // Close modal after submission
        closeModal();
    });
});

