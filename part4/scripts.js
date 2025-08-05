/* HBNB Part 4 - Task 2: Index Page (Corrected according to specs)
   Conformité 100% avec les spécifications Holberton
*/

// ===== API CONFIGURATION =====
const API_BASE_URL = 'http://127.0.0.1:5000';
const API_ENDPOINTS = {
    login: '/api/v1/auth/login',
    places: '/api/v1/places',
    place_details: '/api/v1/places', // + /{id}
    reviews: '/api/v1/reviews'
};

// ===== COOKIE UTILITIES =====
function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [key, value] = cookie.trim().split('=');
        if (key === name) return value;
    }
    return null;
}

function setCookie(name, value) {
    document.cookie = `${name}=${value}; path=/`;
}

function deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

// ===== AUTHENTICATION CHECK (Conforme aux specs) =====
function checkAuthentication() {
    const token = getCookie('token');
    const loginLink = document.getElementById('login-link');
    
    if (loginLink) {
        if (!token) {
            // Pas de token → afficher le lien login
            loginLink.style.display = 'block';
        } else {
            // Token présent → cacher le lien login
            loginLink.style.display = 'none';
            // Fetch places data if the user is authenticated
            fetchPlaces(token);
        }
    }
    
    return token;
}

// ===== URL PARAMETER EXTRACTION =====
function getPlaceIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// ===== TASK 1: LOGIN FUNCTION =====
async function loginUser(email, password) {
    try {
        console.log('Attempting login for:', email);
        
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.login}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Login successful! Token:', data.access_token);
            
            // Store token in COOKIE (not localStorage)
            setCookie('token', data.access_token);
            
            alert('Login successful!');
            window.location.href = 'index.html';
            
        } else {
            console.error('Login failed:', data.error || data.message);
            alert('Login failed: ' + (data.error || data.message || 'Invalid credentials'));
        }
        
    } catch (error) {
        console.error('Network error:', error);
        alert('Login failed: Network error');
    }
}

// ===== TASK 2: FETCH AND DISPLAY PLACES (Conforme aux specs) =====
async function fetchPlaces(token) {
    try {
        const headers = { 'Content-Type': 'application/json' };
        
        // Include the token in the Authorization header if available
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.places}/`, {
            method: 'GET',
            headers: headers
        });

        if (response.ok) {
            const places = await response.json();
            console.log('Places fetched:', places.length);
            displayPlaces(places);
        } else {
            console.error('Failed to fetch places:', response.status);
            // Si pas de places, afficher un message
            const placesContainer = document.getElementById('places-list');
            if (placesContainer) {
                placesContainer.innerHTML = '<p>No places available at the moment.</p>';
            }
        }
        
    } catch (error) {
        console.error('Fetch places error:', error);
        const placesContainer = document.getElementById('places-list');
        if (placesContainer) {
            placesContainer.innerHTML = '<p>Error loading places. Please try again later.</p>';
        }
    }
}

// ===== POPULATE PLACES LIST (Conforme aux specs) =====
function displayPlaces(places) {
    const placesContainer = document.getElementById('places-list');
    if (!placesContainer) return;

    // Clear the current content of the places list
    placesContainer.innerHTML = '';

    if (places.length === 0) {
        placesContainer.innerHTML = '<p>No places available at the moment.</p>';
        return;
    }

    // Iterate over the places data
    places.forEach(place => {
        // For each place, create a div element and set its content
        const placeCard = document.createElement('div');
        placeCard.className = 'place-card';
        
        // Set price attribute for filtering
        placeCard.setAttribute('data-price', place.price || place.price_per_night || 0);
        
        placeCard.innerHTML = `
            <h3>${place.title || place.name || 'Unnamed Place'}</h3>
            <p class="price">$${place.price || place.price_per_night || 0} per night</p>
            <p class="description">${place.description || 'No description available'}</p>
            <button class="details-button" onclick="viewPlaceDetails('${place.id}')">
                View Details
            </button>
        `;
        
        // Append the created element to the places list
        placesContainer.appendChild(placeCard);
    });
}

function viewPlaceDetails(placeId) {
    window.location.href = `place.html?id=${placeId}`;
}

// ===== IMPLEMENT CLIENT-SIDE FILTERING (Conforme aux specs) =====
function filterPlacesByPrice(maxPrice) {
    const placeCards = document.querySelectorAll('.place-card');
    
    placeCards.forEach(card => {
        const price = parseFloat(card.getAttribute('data-price'));
        
        if (maxPrice === 'all' || price <= parseFloat(maxPrice)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// ===== TASK 3: FETCH PLACE DETAILS =====
async function fetchPlaceDetails(token, placeId) {
    try {
        const headers = { 'Content-Type': 'application/json' };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.place_details}/${placeId}`, {
            method: 'GET',
            headers: headers
        });

        if (response.ok) {
            const place = await response.json();
            console.log('Place details fetched:', place.title || place.name);
            displayPlaceDetails(place);
        } else {
            console.error('Failed to fetch place details:', response.status);
        }
        
    } catch (error) {
        console.error('Fetch place details error:', error);
    }
}

function displayPlaceDetails(place) {
    const placeDetailsContainer = document.querySelector('.place-info');
    if (!placeDetailsContainer) return;

    placeDetailsContainer.innerHTML = `
        <h1>${place.title || place.name || 'Unnamed Place'}</h1>
        <p class="host"><strong>Host:</strong> ${place.owner || place.host || 'Unknown'}</p>
        <p class="price"><strong>Price:</strong> $${place.price || place.price_per_night || 0} per night</p>
        <p class="description">${place.description || 'No description available'}</p>
        <div class="amenities">
            <h3>Amenities:</h3>
            <p>${place.amenities && place.amenities.length > 0 ? place.amenities.join(', ') : 'None listed'}</p>
        </div>
    `;

    // Display reviews if they exist
    if (place.reviews && place.reviews.length > 0) {
        displayReviews(place.reviews);
    }
}

function displayReviews(reviews) {
    const reviewsContainer = document.getElementById('reviews');
    if (!reviewsContainer) return;

    // Keep the h2 title
    reviewsContainer.innerHTML = '<h2>Reviews</h2>';

    reviews.forEach(review => {
        const reviewCard = document.createElement('div');
        reviewCard.className = 'review-card';
        
        reviewCard.innerHTML = `
            <p class="comment">"${review.text || review.comment || 'No comment'}"</p>
            <p class="user"><strong>By:</strong> ${review.user_name || review.user || 'Anonymous'}</p>
            <p class="rating"><strong>Rating:</strong> ${review.rating || 'No rating'}/5</p>
        `;
        
        reviewsContainer.appendChild(reviewCard);
    });
}

// ===== TASK 4: SUBMIT REVIEW =====
async function submitReview(token, placeId, reviewText, rating) {
    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.reviews}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                place_id: placeId,
                text: reviewText,
                rating: parseInt(rating)
            })
        });

        if (response.ok) {
            console.log('Review submitted successfully');
            alert('Review submitted successfully!');
            location.reload();
        } else {
            const data = await response.json();
            console.error('Failed to submit review:', data);
            alert('Failed to submit review: ' + (data.error || data.message || 'Unknown error'));
        }
        
    } catch (error) {
        console.error('Submit review error:', error);
        alert('Failed to submit review: Network error');
    }
}

// ===== MAIN INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();
    console.log('Current page:', currentPage);
    
    // ===== LOGIN PAGE =====
    if (currentPage === 'login.html') {
        console.log('Initializing login page');
        
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            console.log('Login form found');
            
            loginForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                console.log('Form submitted');
                
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                
                console.log('Email:', email);
                console.log('Password length:', password.length);
                
                if (!email || !password) {
                    alert('Please fill in all fields');
                    return;
                }
                
                await loginUser(email, password);
            });
        } else {
            console.error('Login form not found!');
        }
    }
    
    // ===== INDEX PAGE (Conforme aux specs) =====
    else if (currentPage === 'index.html' || currentPage === '') {
        console.log('Initializing index page');
        
        // Check user authentication (conforme aux specs)
        checkAuthentication();
        
        // Si pas de token, on peut quand même essayer de fetch les places (optionnel)
        const token = getCookie('token');
        if (!token) {
            // Même sans authentification, essayer de récupérer les places
            fetchPlaces(null);
        }
        
        // Implement client-side filtering (conforme aux specs)
        const priceFilter = document.getElementById('price-filter');
        if (priceFilter) {
            priceFilter.addEventListener('change', (event) => {
                // Get the selected price value
                const selectedPrice = event.target.value;
                console.log('Price filter changed to:', selectedPrice);
                // Filter places based on the selected price
                filterPlacesByPrice(selectedPrice);
            });
        }
    }
    
    // ===== PLACE DETAILS PAGE =====
    else if (currentPage === 'place.html') {
        console.log('Initializing place details page');
        
        const token = checkAuthentication();
        const placeId = getPlaceIdFromURL();
        
        if (placeId) {
            console.log('Place ID from URL:', placeId);
            fetchPlaceDetails(token, placeId);
        } else {
            console.error('No place ID in URL');
        }
        
        // Show/hide add review link based on authentication
        const addReviewLink = document.getElementById('add-review-link');
        if (addReviewLink) {
            if (token) {
                addReviewLink.style.display = 'block';
                
                // Update link with place ID
                const addReviewBtn = document.getElementById('add-review-btn');
                if (addReviewBtn && placeId) {
                    addReviewBtn.href = `add_review.html?id=${placeId}`;
                }
            } else {
                addReviewLink.style.display = 'none';
            }
        }
    }
    
    // ===== ADD REVIEW PAGE =====
    else if (currentPage === 'add_review.html') {
        console.log('Initializing add review page');
        
        const token = checkAuthentication();
        
        // Redirect if not authenticated
        if (!token) {
            alert('Please login first');
            window.location.href = 'login.html';
            return;
        }
        
        const placeId = getPlaceIdFromURL();
        const reviewForm = document.getElementById('review-form');
        
        if (reviewForm) {
            reviewForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                
                const reviewText = document.getElementById('review-text').value;
                const rating = document.getElementById('rating').value;
                
                if (!reviewText || !rating) {
                    alert('Please fill in all fields');
                    return;
                }
                
                await submitReview(token, placeId, reviewText, rating);
            });
        }
    }
});