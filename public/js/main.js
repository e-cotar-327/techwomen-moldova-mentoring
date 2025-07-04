// TechWomen Moldova - Main JavaScript

console.log('TechWomen Moldova website loaded!');

// Simple navigation active state
document.addEventListener('DOMContentLoaded', function () {
    const currentPage =
        window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});

//Toogle mentors/mentees containers

if (window.location.pathname.includes('mentors-mentees.html')) {
    const mentorsBtn = document.querySelector('.mentors-btn');
    const menteesBtn = document.querySelector('.mentees-btn');
    const mentorsContainer = document.querySelector('.mentors');
    const menteesContainer = document.querySelector('.mentees');

    const showMentorsContainer = () => {
        mentorsContainer.classList.remove('hidden');
        menteesContainer.classList.add('hidden');
        mentorsBtn.classList.add('active');
        menteesBtn.classList.remove('active');
    };
    const showMenteesContainer = () => {
        menteesContainer.classList.remove('hidden');
        mentorsContainer.classList.add('hidden');
        mentorsBtn.classList.remove('active');
        menteesBtn.classList.add('active');
    };

    mentorsBtn.addEventListener('click', showMentorsContainer);
    menteesBtn.addEventListener('click', showMenteesContainer);
}
