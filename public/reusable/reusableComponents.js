const loadComponent = (selector, file) => {
    fetch(file)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to load ${file}`);
            }
            return response.text();
        })
        .then((data) => {
            document.querySelector(selector).innerHTML = data;
        })
        .catch((error) => console.error(error));
};

window.addEventListener('DOMContentLoaded', () => {
    loadComponent('#navbar', 'reusable/navbar.html');
    loadComponent('#footer', 'reusable/footer.html');
});
