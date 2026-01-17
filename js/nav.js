// Navigation functionality (shared across pages)

document.addEventListener('DOMContentLoaded', function() {
    const burgerMenu = document.getElementById('burgerMenu');
    const navLinks = document.getElementById('navLinks');
    
    if (!burgerMenu || !navLinks) return;
    
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
});

