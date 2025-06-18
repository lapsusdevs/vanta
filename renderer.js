console.log('Renderer process started');

window.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('nav ul li a');
    const sections = document.querySelectorAll('.content-section');

    links.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();

            // Remove active class from all links and sections
            links.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            // Add active class to the clicked link
            link.classList.add('active');

            // Show the corresponding section
            const sectionId = link.getAttribute('data-section');
            const activeSection = document.getElementById(sectionId);
            if (activeSection) {
                activeSection.classList.add('active');
            }
            console.log(`Navigating to ${sectionId}`);
        });
    });

    // Ensure the initial active section is displayed
    const initialActiveLink = document.querySelector('nav ul li a.active');
    if (initialActiveLink) {
        const initialSectionId = initialActiveLink.getAttribute('data-section');
        const initialActiveSection = document.getElementById(initialSectionId);
        if (initialActiveSection) {
            initialActiveSection.classList.add('active');
        }
    } else {
        // Default to dashboard if no active link is set
        document.getElementById('dashboard')?.classList.add('active');
        document.querySelector('nav ul li a[data-section="dashboard"]')?.classList.add('active');
    }
});
