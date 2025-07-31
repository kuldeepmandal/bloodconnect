// Main JavaScript file for BloodConnect

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    // Initialize page-specific functionality
    initializePageFunctions();
    
    // Check if user is logged in for protected pages
    checkAuthStatus();

    // Add event listener for logout button (if it exists on the page)
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default link behavior

            // Directly navigate to the logout PHP script
            // This relies on backend/logout.php performing a header redirect to index.html
            window.location.href = 'backend/logout.php';
        });
    }
});

// Initialize page-specific functions
function initializePageFunctions() {
    const currentPage = window.location.pathname.split('/').pop();
    
    switch(currentPage) {
        case 'register.html':
            initializeRegisterForm();
            break;
        case 'login.html':
            initializeLoginForm();
            break;
        case 'dashboard.html':
            initializeDashboard();
            break;
        case 'search.html':
            initializeSearchPage();
            break;
        case 'request.html':
            initializeRequestForm();
            break;
        default:
            // Home page or other pages
            break;
    }
}

// Utility function to show alert messages
function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;

    const main = document.querySelector('main');
    if (main) {
        main.insertBefore(alert, main.firstChild);
        
        // Auto-remove alert after 5 seconds
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }
}

// Utility function to submit forms via Fetch API
function submitForm(form) {
    const formData = new FormData(form);
    
    fetch(form.action, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert(data.message, 'success');
            if (data.redirect) {
                setTimeout(() => {
                    window.location.href = data.redirect;
                }, 1500); // Redirect after 1.5 seconds
            }
        } else {
            showAlert(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showAlert('An error occurred. Please try again.', 'error');
    });
}

// Register Form Functions
function initializeRegisterForm() {
    const form = document.getElementById('registerForm');
    if (form) {
        form.addEventListener('submit', handleRegisterSubmit);
    }
}

function handleRegisterSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    // Password validation
    if (password !== confirmPassword) {
        showAlert('Passwords do not match.', 'error');
        return; // Stop execution if passwords don't match
    }

    if (password.length < 6) {
        showAlert('Password must be at least 6 characters long.', 'error');
        return;
    }

    // Call the utility function to submit the form via fetch
    submitForm(e.target);
}

// Login Form Functions
function initializeLoginForm() {
    const form = document.getElementById('loginForm');
    if (form) {
        form.addEventListener('submit', handleLoginSubmit);
    }
}

function handleLoginSubmit(e) {
    e.preventDefault(); 
    submitForm(e.target);
}

// Dashboard Functions
function initializeDashboard() {
    loadUserProfile();

    // Event listener to open the Update Donation Date modal
    const updateDonationModalBtn = document.getElementById('updateDonationModalBtn');
    if (updateDonationModalBtn) {
        updateDonationModalBtn.addEventListener('click', openDonationModal);
    }

    // Event listener for the Update Donation Form submission
    const updateDonationForm = document.getElementById('updateDonationForm');
    if (updateDonationForm) {
        updateDonationForm.addEventListener('submit', handleUpdateDonationSubmit);
    }

    // Note: Edit Profile functionality is currently skipped per user request.
    // The HTML for it is present, but its JS handlers are not fully implemented here.
    // const editProfileBtn = document.querySelector('.dashboard-card .btn-secondary');
    // if (editProfileBtn) {
    //     editProfileBtn.addEventListener('click', editProfile);
    // }

    // const updateProfileForm = document.getElementById('updateProfileForm');
    // if (updateProfileForm) {
    //     updateProfileForm.addEventListener('submit', handleUpdateProfileSubmit);
    // }
}

function loadUserProfile() {
    fetch('backend/get_user_profile.php')
        .then(response => response.json())
        .then(data => {
            const userProfileDiv = document.getElementById('userProfile');
            if (data.success && data.user) {
                const user = data.user;
                userProfileDiv.innerHTML = `
                    <p><strong>Name:</strong> ${user.fullName}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Phone:</strong> ${user.phone}</p>
                    <p><strong>Age:</strong> ${user.age}</p>
                    <p><strong>Blood Type:</strong> ${user.bloodType}</p>
                    <p><strong>City:</strong> ${user.city}</p>
                    <p><strong>Address:</strong> ${user.address}</p>
                    <p><strong>Last Donation:</strong> ${user.lastDonationDate ? user.lastDonationDate : 'N/A'}</p>
                `;
                // Optionally pre-fill the donation date in the modal if available
                if (user.lastDonationDate) {
                    document.getElementById('newLastDonation').value = user.lastDonationDate;
                }
            } else {
                userProfileDiv.innerHTML = '<p>Could not load profile data.</p>';
                showAlert('Failed to load user profile.', 'error');
            }
        })
        .catch(error => {
            console.error('Error loading user profile:', error);
            showAlert('Error connecting to server for profile data.', 'error');
        });
}

// Function to open the donation update modal
function openDonationModal() {
    openModal('updateDonationModal');
}

// Function to handle the submission of the donation update form
function handleUpdateDonationSubmit(e) {
    e.preventDefault();
    const form = e.target;
    
    submitForm(form)
    .then(() => {
        // After submitForm handles the success/error alert, and if successful:
        closeModal('updateDonationModal'); // Close the modal
        loadUserProfile(); // Reload profile to show updated donation date
    })
    .catch(error => {
        console.error('Error handling donation update submit:', error);
        showAlert('An error occurred during donation update.', 'error');
    });
}

// Placeholder functions for profile update (not implemented yet)
function editProfile() { /* Not implemented yet */ }
function handleUpdateProfileSubmit(e) { /* Not implemented yet */ }


// Search Page Functions
function initializeSearchPage() {
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearchFormSubmit);
    }
}

function handleSearchFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const searchResultsDiv = document.getElementById('searchResults');
    showSpinner('searchResults'); // Show spinner while loading

    fetch('backend/search_donors.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.donors.length > 0) {
            searchResultsDiv.innerHTML = ''; // Clear previous results
            data.donors.forEach(donor => {
                const donorCard = document.createElement('div');
                donorCard.className = 'donor-card';
                donorCard.innerHTML = `
                    <div class="donor-info">
                        <p><strong>Name:</strong> ${donor.full_name}</p>
                        <p><strong>Blood Type:</strong> ${donor.blood_type}</p>
                        <p><strong>City:</strong> ${donor.city}</p>
                        <p><strong>Address:</strong> ${donor.address}</p>
                        <p><strong>Phone:</strong> ${donor.phone}</p>
                        <p><strong>Last Donation:</strong> ${donor.last_donation_date ? donor.last_donation_date : 'N/A'}</p>
                    </div>
                    <!-- Contact button is removed as per request -->
                `;
                searchResultsDiv.appendChild(donorCard);
            });
            showAlert('Search completed.', 'success');
        } else if (data.success && data.donors.length === 0) {
            searchResultsDiv.innerHTML = '<p>No donors found matching your criteria.</p>';
            showAlert('No donors found.', 'info');
        } else {
            searchResultsDiv.innerHTML = '<p>Error searching for donors.</p>';
            showAlert(data.message || 'Error searching for donors.', 'error');
        }
    })
    .catch(error => {
        console.error('Search error:', error);
        searchResultsDiv.innerHTML = '<p>An error occurred while searching.</p>';
        showAlert('Error connecting to server for search.', 'error');
    });
}

// Request Blood Functions
function initializeRequestForm() {
    const requestForm = document.getElementById('requestForm');
    if (requestForm) {
        requestForm.addEventListener('submit', handleRequestSubmit);
    }
}

function handleRequestSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    fetch('backend/request_blood.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert(data.message, 'success');
            e.target.reset(); // Clear the form
        } else {
            showAlert(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Request error:', error);
        showAlert('An error occurred during blood request.', 'error');
    });
}

// Modals Functionality
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Close modals when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });
}

// Placeholder for spinner (add CSS for .spinner)
function showSpinner(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div class="spinner"></div>'; // You'll need CSS for .spinner
    }
}

function contactDonor(donorId) {
    // This function can be expanded to show contact details or send a message
    showAlert('Contact information will be provided after verification. Donor ID: ' + donorId, 'info');
}

// Authentication Check
function checkAuthStatus() {
    // Check if user is logged in for protected pages
    const protectedPages = ['dashboard.html']; // Add other protected pages here
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage)) {
        fetch('backend/check_auth.php')
            .then(response => response.json())
            .then(data => {
                // As per previous instruction, check_auth.php always returns authenticated: true
                // If you re-implement actual authentication, this logic would change.
                if (!data.authenticated) {
                    window.location.href = 'login.html'; // Redirect to login if not authenticated
                }
            })
            .catch(error => {
                console.error('Auth check error:', error);
                // Optionally show an error message or redirect even on fetch error
                window.location.href = 'login.html'; 
            });
    }
}