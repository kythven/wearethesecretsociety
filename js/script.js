// Main JavaScript file (for index.html)

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
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

    // Handle form submission
    joinForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Get form values
        const name = document.getElementById('userName').value.trim();
        const email = document.getElementById('userEmail').value.trim();
        
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

        // Get the Formspree URL from the form action
        const formAction = joinForm.getAttribute('action');
        
        // Submit to Formspree
        console.log('Submitting to:', formAction);
        
        fetch(formAction, {
            method: 'POST',
            headers: { 'Accept': 'application/json' },
            body: new FormData(joinForm)
        })
        .then(response => {
            console.log('Response status:', response.status);
            if (response.ok) {
                console.log('Form submitted to Formspree:', { name, email });
                alert(`Thank you for joining us, ${name}! Your information has been saved.`);
                closeModal();
            } else {
                return response.json().then(data => {
                    throw new Error(data.error || 'Form submission failed');
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            // Check if running from file://
            if (window.location.protocol === 'file:') {
                alert('Error: Cannot submit from file://. Please run a local server.\n\nRun: python -m http.server 8000\nThen open: http://localhost:8000');
            } else {
                alert('There was an error submitting the form. Please try again.\n\nError: ' + error.message);
            }
        });
    });
});

