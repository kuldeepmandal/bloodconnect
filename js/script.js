// Main JavaScript file for BloodConnect

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    // Initialize page-specific functionality
    initializePageFunctions();
    
    // Check if user is logged in for protected pages
    checkAuthStatus();

    // Add event listener for logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
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
            loadDashboardCharts();
            loadBloodRequests();
            break;
        case 'profile.html':
            initializeProfilePage();
            break;
        case 'search.html':
            initializeSearchPage();
            break;
        case 'request.html':
            initializeRequestForm();
            break;
        default:
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
        
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }
}

// Utility function to submit forms via Fetch API
function submitForm(form) {
    const formData = new FormData(form);
    
    return fetch(form.action, {
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
                }, 1500);
            }
        } else {
            showAlert(data.message, 'error');
        }
        return data;
    })
    .catch(error => {
        console.error('Error:', error);
        showAlert('An error occurred. Please try again.', 'error');
        return { success: false, message: 'An error occurred.' };
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
    
    if (password !== confirmPassword) {
        showAlert('Passwords do not match.', 'error');
        return;
    }

    if (password.length < 6) {
        showAlert('Password must be at least 6 characters long.', 'error');
        return;
    }

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
    loadBloodRequests();
    loadDashboardCharts();
}

// NEW: Function to fetch dashboard data and render charts
function loadDashboardCharts() {
    fetch('backend/get_dashboard_data.php')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.bloodTypeCounts.length > 0) {
                const labels = data.bloodTypeCounts.map(item => item.blood_type);
                const counts = data.bloodTypeCounts.map(item => item.count);

                const existingChart = Chart.getChart('bloodTypeChart');
                if (existingChart) {
                    existingChart.destroy();
                }

                const ctx = document.getElementById('bloodTypeChart').getContext('2d');
                new Chart(ctx, {
                    type: 'pie', // You can change this to 'bar' for a bar chart
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Available Donors',
                            data: counts,
                            backgroundColor: [
                                '#8b0000', // Dark Red
                                '#a00000', // Slightly lighter Red
                                '#b22222', // Firebrick
                                '#dc143c', // Crimson
                                '#ff6384', // Pinkish Red
                                '#ff9999', // Light Red
                                '#ffb6c1', // Light Pink
                                '#ffe4e1'  // Misty Rose
                            ],
                            hoverOffset: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            title: {
                                display: false,
                                text: 'Available Donors Chart'
                            }
                        }
                    }
                });
            }
        })
        .catch(error => {
            console.error('Error loading dashboard charts:', error);
        });
}


function loadBloodRequests() {
    const bloodRequestsDiv = document.getElementById('bloodRequests');
    if (!bloodRequestsDiv) return;

    bloodRequestsDiv.innerHTML = '<p>Loading blood requests...</p>';

    fetch('backend/get_blood_requests.php')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.requests.length > 0) {
                bloodRequestsDiv.innerHTML = '';
                data.requests.forEach(request => {
                    const requestCard = document.createElement('div');
                    requestCard.className = 'request-card';
                    requestCard.innerHTML = `
                        <h4>Blood Needed: ${request.blood_type}</h4>
                        <p><strong>Patient:</strong> ${request.patient_name}</p>
                        <p><strong>Urgency:</strong> <span class="urgency-${request.urgency_level}">${request.urgency_level}</span></p>
                        <p><strong>Units:</strong> ${request.units_needed}</p>
                        <p><strong>Hospital:</strong> ${request.hospital_name}, ${request.hospital_address}</p>
                        <p><strong>Contact:</strong> ${request.contact_person} (${request.contact_phone})</p>
                        <p class="request-date">Requested On: ${request.request_date}</p>
                    `;
                    bloodRequestsDiv.appendChild(requestCard);
                });
            } else if (data.success && data.requests.length === 0) {
                bloodRequestsDiv.innerHTML = '<p>No blood requests have been posted yet.</p>';
            } else {
                bloodRequestsDiv.innerHTML = `<p>${data.message || 'Error loading blood requests.'}</p>`;
            }
        })
        .catch(error => {
            console.error('Error loading blood requests:', error);
            bloodRequestsDiv.innerHTML = '<p>Error connecting to server for blood requests.</p>';
        });
}


// NEW: Function to initialize the new profile page
function initializeProfilePage() {
    loadUserProfile();

    const editProfileBtn = document.getElementById('editProfileBtn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', editProfile);
    }

    const updateProfileForm = document.getElementById('updateProfileForm');
    if (updateProfileForm) {
        updateProfileForm.addEventListener('submit', handleUpdateProfileSubmit);
    }
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

function editProfile() {
    fetch('backend/get_user_profile.php')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.user) {
                const user = data.user;
                document.getElementById('editFullName').value = user.fullName;
                document.getElementById('editEmail').value = user.email;
                document.getElementById('editPhone').value = user.phone;
                document.getElementById('editAge').value = user.age;
                document.getElementById('editBloodType').value = user.bloodType;
                document.getElementById('editCity').value = user.city;
                document.getElementById('editAddress').value = user.address;
                document.getElementById('editLastDonation').value = user.lastDonationDate;
                openModal('editProfileModal');
            } else {
                showAlert('Could not load profile for editing.', 'error');
            }
        })
        .catch(error => {
            console.error('Error loading profile for edit:', error);
            showAlert('Error loading profile data.', 'error');
        });
}

function handleUpdateProfileSubmit(e) {
    e.preventDefault();
    const form = e.target;
    
    submitForm(form)
    .then(data => {
        if (data.success) {
            closeModal('editProfileModal');
            loadUserProfile();
        }
    })
    .catch(error => {
        console.error('Error handling profile update submit:', error);
        showAlert('An error occurred during profile update.', 'error');
    });
}


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
    showSpinner('searchResults');

    fetch('backend/search_donors.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.donors.length > 0) {
            searchResultsDiv.innerHTML = '';
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

    submitForm(e.target)
    .then(data => {
        if (data.success) {
            e.target.reset(); // Clear the form
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
        element.innerHTML = '<div class="spinner"></div>';
    }
}

function contactDonor(donorId) {
    showAlert('Contact information will be provided after verification. Donor ID: ' + donorId, 'info');
}

// Authentication Check
function checkAuthStatus() {
    const protectedPages = ['dashboard.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage)) {
        fetch('backend/check_auth.php')
            .then(response => response.json())
            .then(data => {
                if (!data.authenticated) {
                    window.location.href = 'login.html';
                }
            })
            .catch(error => {
                console.error('Auth check error:', error);
                window.location.href = 'login.html'; 
            });
    }
}