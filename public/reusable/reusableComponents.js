function setActiveNavLink() {
    const currentPage = location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('.nav-link');

    links.forEach((link) => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        }
    });
}
// Show reusable components
const loadComponent = (selector, file, callback) => {
    fetch(file)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to load ${file}`);
            }
            return response.text();
        })
        .then((data) => {
            document.querySelector(selector).innerHTML = data;
            if (callback) callback();
        })
        .catch((error) => console.error(error));
};

window.addEventListener('DOMContentLoaded', () => {
    loadComponent('#navbar', 'reusable/navbar.html', setActiveNavLink);
    loadComponent('#footer', 'reusable/footer.html');
});
