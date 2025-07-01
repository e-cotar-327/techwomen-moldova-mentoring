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

document.getElementById('ctaBtn').onclick = function (event) {
    event.preventDefault();
    showProfileModal();
};

function showProfileModal() {
    const modal = createModalElement();
    document.body.appendChild(modal);
    modal.style.display = 'flex';

    const form = modal.querySelector('#form');
    const nameInput = form.elements['name'];
    const nameError = form.querySelector('#nameError');

    nameInput.addEventListener('input', () => {
        if (nameInput.value.trim() !== '') {
            nameError.textContent = '';
            nameInput.classList.remove('invalid');
        }
    });

    setupOtherDomainToggle(form);
    toggleDomainVisibility(form);

    // References
    const emojiPicker = document.getElementById('emojiPicker');
    const avatarInput = document.getElementById('avatarInput');
    const selectedAvatar = document.getElementById('selectedAvatar');

    setupEmojiPicker(emojiPicker, avatarInput, selectedAvatar);

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const isValid = validateForm(form);
        if (isValid) {
            // form.submit();
        }
    });
}

function createModalElement() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
    
    <div class="modal-backdrop" onclick="this.parentElement.remove()"></div>
    <div class="modal-content">
        <h2>📝 Contact Form </h2>

        <div class="modal-body">
            <form id="form" name="contact" method="POST" data-netlify="true" novalidate>
                <p>
                    <label for="name">
                        Your Name: <span class="required-asterisk">*</span><br/>
                        <input type="text" id="name" />
                        <div id="nameError" class="error-message"></div>
                    </label>
                </p>

                <p>
                    <label>
                        Your Role:
                        <span class="required-asterisk">*</span>
                    </label>
                    <br />
                    <label>
                        <input
                            type="radio"
                            name="role"
                            value="mentor"
                            required
                        />
                        Mentor
                    </label>
                    <br />
                    <label>
                        <input type="radio" name="role" value="mentee" />
                        Mentee
                    </label>
                    <div id="roleError" class="error-message"></div>
                </p>
                <p>
                    <label>
                        Years of Participation:
                        <span class="required-asterisk">*</span>
                    </label>
                    <label>
                        <br />
                        <input
                            type="checkbox"
                            name="year"
                            value="2021"
                            required
                        />
                        2021
                    </label>
                    <br />
                    <label>
                        <input type="checkbox" name="year" value="2022" />
                        2022
                    </label>
                    <br />
                    <label>
                        <input type="checkbox" name="year" value="2023" />
                        2023
                    </label>
                    <br />
                    <label>
                        <input type="checkbox" name="year" value="2024" />
                        2024
                    </label>
                    <br />
                    <label>
                        <input type="checkbox" name="year" value="2025" />
                        2025
                    </label>
                    <br />
                    <div id="yearError" class="error-message"></div>
                </p>
                <div id="domainContainer" style="display:none">
                    <p>
                        <label for="domain">
                            Domain <span class="required-asterisk">*</span>
                        </label>
                        <br />
                        <select id="domain" name="domain" required>
                            <option value="">
                                -- Please select a domain --
                            </option>
                            <option value="frontend">Front-End</option>
                            <option value="backend">Back-End</option>
                            <option value="data">Data</option>
                            <option value="ai">AI</option>
                            <option value="other">Other</option>
                        </select>
                        <div id="domainError" class="error-message"></div>
                    </p>
                    <p id="otherDomainContainer" style="display: none">
                        <label for="otherDomainContainer">
                            Specify your domain:
                            <br />
                            <textarea
                                id="otherDomainText"
                                name="otherDomainText"
                                rows="3"
                                cols="3"
                            ></textarea>
                            <div
                                id="otherDomainError"
                                class="error-message"
                            ></div>
                        </label>
                    </p>
                </div>
                <p>
                    <label for="email">
                        Email: <span class="required-asterisk">*</span>
                    </label>
                    <br />
                    <input type="email" id="email" name="email" required />
                    <div id="emailError" class="error-message"></div>
                </p>

                <p>
                    <label for="linkedin">LinkedIn:</label>
                    <br />
                    <input
                        type="url"
                        id="linkedin"
                        name="linkedin"
                        placeholder="https://linkedin.com/in/yourprofile"
                    />
                    <div id="linkedinError" class="error-message"></div>

                    <p>
                        <label>
                            Choose your avatar:
                            <span class="required-asterisk">*</span>
                        </label>
                        <br />
                        <div id="avatarError" class="error-message"></div>
                        <div id="emojiPicker"></div>
                        <input
                            style="display:none"
                            name="avatar"
                            id="avatarInput"
                            required
                        />
                        <small>
                            We'll use this emoji as the avatar for your profile.
                        </small>
                    </p>
                </p>
                <p>
                    <button type="submit">Send</button>
                </p>
            </form>
        </div>
    </div>
`;
    return modal;
}

function validateForm(form) {
    return [
        validateName,
        validateRole,
        validateYears,
        validateDomain,
        validateEmail,
        validateLinkedin,
        validateAvatar,
        validateOtherDomain,
    ]
        .map((validate) => validate(form))
        .every((result) => result);
}

// optional__todo__: add `onChange` event listeners on inputs (on submit)?
function validateName(form) {
    const nameInput = form.elements['name'];
    const nameError = form.querySelector('#nameError');

    if (!nameInput.value.trim()) {
        nameError.textContent = 'Please enter your name.';
        nameInput.classList.add('invalid');
    } else {
        nameError.textContent = '';
        nameInput.classList.remove('invalid');
    }

    return false;
}

function validateRole(form) {
    const roleInputs = Array.from(form.querySelectorAll('input[name="role"]'));
    const roleError = form.querySelector('#roleError');

    let roleSelected = roleInputs.some((input) => input.checked);

    if (!roleSelected) {
        roleError.textContent = 'Please select your role.';
        isValid = false;
    } else {
        roleError.textContent = '';
    }
    return isValid;
}

function validateYears(form) {
    const yearsInputs = Array.from(form.querySelectorAll('input[name="year"]'));
    const yearError = form.querySelector('#yearError');

    let atLeastOneChecked = yearsInputs.some((input) => input.checked);

    if (!atLeastOneChecked) {
        yearError.textContent = 'Please select at least one year.';
        isValid = false;
    } else {
        yearError.textContent = '';
    }
    return isValid;
}
// Only for mentor role
function validateDomain(form) {
    const domainSelect = form.elements['domain'];
    const domainError = form.querySelector('#domainError');
    let isValid = true;

    if (!domainSelect.value) {
        domainError.textContent = 'Please select a domain.';
        domainSelect.classList.add('invalid');
        isValid = false;
    } else {
        domainError.textContent = '';
        domainSelect.classList.remove('invalid');
    }
    return isValid;
}

// Only for mentor role
function validateOtherDomain(form) {
    const domainSelect = form.elements['domain'];
    const otherDomainText = form.elements['otherDomainText'];
    const otherDomainError = form.querySelector('#otherDomainError');
    isValid = true;

    if (domainSelect.value === 'other') {
        if (!otherDomainText.value.trim()) {
            otherDomainError.textContent = 'Please specify your domain.';
            otherDomainText.classList.add('invalid');
            isValid = false;
        } else {
            otherDomainError.textContent = '';
            otherDomainText.classList.remove('invalid');
        }
    } else {
        otherDomainError.textContent = '';
        otherDomainText.classList.remove('invalid');
    }
    return isValid;
}

function validateEmail(form) {
    const emailInput = form.elements['email'];
    const emailError = form.querySelector('#emailError');
    let isValid = true;

    if (!emailInput.value.trim()) {
        emailError.textContent = 'Please enter your email.';
        emailInput.classList.add('invalid');
        isValid = false;
    } else if (!emailInput.checkValidity()) {
        emailError.textContent = 'Please enter a valid email address.';
        emailInput.classList.add('invalid');
        isValid = false;
    } else {
        emailError.textContent = '';
        emailInput.classList.remove('invalid');
    }
    return isValid;
}

function validateLinkedin(form) {
    const linkedinInput = form.elements['linkedin'];
    const linkedinError = form.querySelector('#linkedinError');
    let isValid = true;

    if (linkedinInput.value.trim() !== '') {
        if (!linkedinInput.checkValidity()) {
            linkedinError.textContent = 'Please enter a valid URL.';
            linkedinInput.classList.add('invalid');
            isValid = false;
        } else {
            linkedinError.textContent = '';
            linkedinInput.classList.remove('invalid');
        }
    } else {
        linkedinError.textContent = '';
        linkedinInput.classList.remove('invalid');
    }
    return isValid;
}

function setupEmojiPicker(emojiPicker, avatarInput, selectedAvatar) {
    // Whitelist of allowed avatar emojis
    const allowedAvatars = ['👩‍💻', '👨‍💻', '🧑‍🎓', '👩‍🏫', '👨‍🏫', '🧑‍🔬', '👩‍🔬', '👩‍🚀'];

    // Generate emoji buttons from whitelist
    allowedAvatars.forEach((emoji) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = emoji;
        btn.classList.add('emoji-button');
        emojiPicker.appendChild(btn);

        // Handle emoji selection
        btn.addEventListener('click', () => {
            emojiPicker.querySelectorAll('.emoji-button').forEach((b) => {
                b.classList.remove('selected');
            });

            btn.classList.add('selected');

            avatarInput.value = emoji;

            if (selectedAvatar) {
                selectedAvatar.textContent = emoji;
            }
        });
    });
}

function validateAvatar(form) {
    const avatarInput = form.elements['avatar'];
    const avatarError = form.querySelector('#avatarError');
    let isValid = true;

    if (!avatarInput.value.trim()) {
        avatarError.textContent = 'Please choose an avatar.';
        isValid = false;
    } else {
        avatarError.textContent = '';
    }
    return isValid;
}

function toggleDomainVisibility(form) {
    const domainContainer = form.querySelector('#domainContainer');
    const roleInputs = Array.from(form.querySelectorAll('input[name="role"]'));
    const otherDomainContainer = form.querySelector('#otherDomainContainer');

    function updateVisibility() {
        const isMentorSelected = roleInputs.some(
            (input) => input.checked && input.value === 'mentor'
        );

        if (isMentorSelected) {
            domainContainer.style.display = 'block';
            form.elements['domain'].setAttribute('required', 'required');
        } else {
            domainContainer.style.display = 'none';
            form.elements['domain'].removeAttribute('required');

            form.elements['domain'].value = '';
            otherDomainContainer.style.display = 'none';
            form.elements['otherDomainText'].removeAttribute('required');
            form.elements['otherDomainText'].value = '';
        }
    }

    roleInputs.forEach((input) => {
        input.addEventListener('change', updateVisibility);
    });

    updateVisibility();
}

function setupOtherDomainToggle(form) {
    const domainSelect = form.elements['domain'];
    const otherDomainContainer = form.querySelector('#otherDomainContainer');

    domainSelect.addEventListener('change', () => {
        if (domainSelect.value === 'other') {
            otherDomainContainer.style.display = 'block';
            form.elements['otherDomainText'].setAttribute(
                'required',
                'required'
            );
        } else {
            otherDomainContainer.style.display = 'none';
            form.elements['otherDomainText'].remove('required');
            form.elements['otherDomainText'].value = '';
        }
    });
}
