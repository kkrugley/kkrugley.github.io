document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    // !! SECURITY WARNING: Exposing API keys directly in client-side code is insecure.
    // !! This key can be stolen. Use a backend proxy for production applications.
    const API_KEY = "AIzaSyAkxHPnsKcmb74mq9Wcp3j5aPXHCgZffEE"; // Your Gemini API Key
    const API_BASE_URL = "https://generativelanguage.googleapis.com"; // Base URL
    const API_MODEL = "gemini-2.0-flash"; // Model being used
    const API_URL = `${API_BASE_URL}/v1beta/models/${API_MODEL}:generateContent?key=${API_KEY}`;
    const PLACEHOLDER_IMAGE_URL = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNocR-yJmC93piN_QOHWcw9cjfhSpUOgZ6lg&s'; // Placeholder

    // --- DOM Elements ---
    const searchForm = document.getElementById('search-form');
    const resultsArea = document.getElementById('results-area');
    const contentWrapper = document.querySelector('.content-wrapper');
    const dateInput = document.getElementById('release-date');
    const genreSelect = document.getElementById('genre-select');
    const searchButton = document.getElementById('search-button');
    const backButton = document.getElementById('back-button');
    const loadingIndicator = document.getElementById('loading');
    const resultsContent = document.getElementById('results-content');
    const apiErrorDisplay = document.getElementById('api-error');
    const searchErrorDisplay = document.getElementById('search-error');
    const noResultsDisplay = document.getElementById('no-results');
    const resultsHeading = document.getElementById('results-heading');

    const carouselElement = document.getElementById('vinylCarousel');
    const carouselInner = document.getElementById('carousel-inner');
    const carouselIndicators = document.getElementById('carousel-indicators');
    const buyButton = document.getElementById('buy-button');

    let bootstrapCarousel = null;
    let currentAlbums = [];

    // --- Functions ---

    function showSearchForm() {
        resultsArea.classList.add('d-none');
        resultsArea.classList.remove('slide-in');
        searchForm.classList.remove('slide-out');
        searchForm.classList.remove('d-none');
        contentWrapper.classList.remove('results-visible');
        apiErrorDisplay.classList.add('d-none');
        searchErrorDisplay.classList.add('d-none');
        if (bootstrapCarousel) {
            bootstrapCarousel.dispose();
            bootstrapCarousel = null;
        }
        carouselInner.innerHTML = '';
        carouselIndicators.innerHTML = '';
    }

    function showResultsArea() {
        searchErrorDisplay.classList.add('d-none');
        searchForm.classList.add('slide-out');
        resultsArea.classList.remove('d-none');
        setTimeout(() => {
             resultsArea.classList.add('slide-in');
             contentWrapper.classList.add('results-visible');
        }, 50);
    }

    async function fetchVinylData(date, genre) {
        loadingIndicator.classList.remove('d-none');
        resultsContent.classList.add('d-none');
        apiErrorDisplay.classList.add('d-none');
        noResultsDisplay.classList.add('d-none');
        buyButton.classList.add('d-none');

        // --- Modified Gemini Prompt - Asking for Image URL ---
        const prompt = `List vinyl albums released in the genre "${genre}" exactly on the date ${date} (YYYY-MM-DD format).
        For each album found, provide the title, the main artist, and if possible, a publicly accessible URL for the cover art image.
        Format the response strictly as a JSON array of objects. Each object must have three keys: "title" (string), "artist" (string), and "imageUrl" (string, or null if no image URL is found).
        Example: [{"title": "Example Album Title", "artist": "Example Artist", "imageUrl": "https://example.com/image.jpg"}, {"title": "Another Album", "artist": "Another Band", "imageUrl": null}]
        If no albums are found for that exact date and genre, return an empty JSON array: [].
        Do not include any introductory text, explanations, or markdown formatting. Only provide the JSON array.`;

        console.log("Attempting to fetch from:", API_URL); // Log the URL being used
        console.log("Request Body:", JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })); // Log the body

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                    // Optional: Add safety settings if needed
                    // safetySettings: [
                    //   { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
                    //   // Add other categories as needed
                    // ],
                }),
            });

            // Log status and status text regardless of ok status
            console.log(`API Response Status: ${response.status} ${response.statusText}`);

            if (!response.ok) {
                // Try to get more details from the response body if available
                let errorBody = "Could not read error body.";
                try {
                    errorBody = await response.text(); // Read as text first
                    console.error("API Error Response Body:", errorBody);
                     // Try to parse as JSON for structured error message
                    const errorJson = JSON.parse(errorBody);
                    if(errorJson.error && errorJson.error.message) {
                        errorBody = errorJson.error.message;
                    }
                } catch (e) {
                     console.error("Could not parse error response body:", e);
                }
                // Specific check for 404
                if (response.status === 404) {
                     throw new Error(`API Error: 404 Not Found. Please check:\n1. API URL is correct (${API_URL}).\n2. API Key is valid and active.\n3. 'Generative Language API' is enabled in your Google Cloud project.\n4. Project billing is enabled.\n\nRaw error: ${errorBody}`);
                } else {
                    throw new Error(`API Error: ${response.status} ${response.statusText}. ${errorBody}`);
                }
            }

            const data = await response.json();
            console.log("API Raw Response Data:", data);

            // --- Process Response ---
            let jsonString = null;
            if (data.candidates && data.candidates.length > 0 &&
                data.candidates[0].content && data.candidates[0].content.parts &&
                data.candidates[0].content.parts.length > 0) {
                jsonString = data.candidates[0].content.parts[0].text;
            } else if (data.promptFeedback && data.promptFeedback.blockReason) {
                 // Handle cases where the prompt was blocked
                 console.error("Prompt blocked:", data.promptFeedback);
                 throw new Error(`Request blocked by API safety filters. Reason: ${data.promptFeedback.blockReason}`);
            } else {
                console.error("No valid candidates found in API response structure:", data);
                throw new Error("Received an unexpected response structure from AI.");
            }

            if (!jsonString) {
                 console.error("No text content found in API response part.");
                 throw new Error("Received empty response part from AI.");
            }

            // Clean the string (remove potential markdown backticks and whitespace)
            jsonString = jsonString.replace(/^```json\s*|```$/g, '').trim();

            // Attempt to parse the extracted text as JSON
            try {
                currentAlbums = JSON.parse(jsonString);
                if (!Array.isArray(currentAlbums)) {
                     console.error("Parsed data is not an array:", currentAlbums);
                     throw new Error("AI response was not a valid JSON array.");
                }
                // Further validation: Check if objects have expected keys (optional but good)
                if (currentAlbums.length > 0 && (typeof currentAlbums[0].title === 'undefined' || typeof currentAlbums[0].artist === 'undefined' || typeof currentAlbums[0].imageUrl === 'undefined')) {
                     console.warn("Parsed array objects might not have the expected keys (title, artist, imageUrl). Received:", currentAlbums[0]);
                     // Decide if this is a critical error or just a warning
                     // throw new Error("AI response JSON structure is missing expected keys.");
                 }

                 populateCarousel(currentAlbums, date, genre);

            } catch (parseError) {
                console.error("Failed to parse JSON from Gemini response:", parseError);
                console.error("Received text string:", jsonString);
                throw new Error("AI response was not in the expected JSON format. Check the console for the received text.");
            }

        } catch (error) {
            console.error("Error during fetch or processing:", error);
            // Display a more user-friendly error, especially for the 404 case.
             if (error.message.includes("404 Not Found")) {
                 apiErrorDisplay.innerHTML = `<b>API Error (404 Not Found):</b> Could not reach the API endpoint.<br>Please verify your API key and Google Cloud project setup (API enabled, billing enabled). Check the developer console (F12) for more technical details.`;
             } else {
                  apiErrorDisplay.textContent = `An error occurred: ${error.message}. Please try again later or check the console.`;
             }
            apiErrorDisplay.classList.remove('d-none');
            resultsContent.classList.add('d-none'); // Ensure results content is hidden on error
        } finally {
            loadingIndicator.classList.add('d-none');
        }
    }

    function populateCarousel(albums, date, genre) {
        carouselInner.innerHTML = '';
        carouselIndicators.innerHTML = '';
        buyButton.classList.add('d-none');
        noResultsDisplay.classList.add('d-none');

        if (albums && albums.length > 0) {
            resultsHeading.textContent = `Found Releases for ${genre} on ${date}`;
            albums.forEach((album, index) => {
                const isActive = index === 0;
                const carouselItem = document.createElement('div');
                carouselItem.className = `carousel-item ${isActive ? 'active' : ''}`;
                carouselItem.dataset.title = album.title || 'Unknown Title'; // Store title for buy button
                carouselItem.dataset.artist = album.artist || 'Unknown Artist';

                const img = document.createElement('img');
                // Use imageUrl from Gemini if valid, otherwise use placeholder
                img.src = (album.imageUrl && typeof album.imageUrl === 'string' && album.imageUrl.startsWith('http'))
                            ? album.imageUrl
                            : PLACEHOLDER_IMAGE_URL;
                img.alt = `Cover art for ${album.title || 'album'} by ${album.artist || 'artist'}`;
                img.className = 'd-block w-auto'; // Maintain aspect ratio, prevent stretching

                // Add error handling for the image itself
                img.onerror = function() {
                    console.warn(`Failed to load image for ${album.title}: ${this.src}. Falling back to placeholder.`);
                    this.src = PLACEHOLDER_IMAGE_URL; // Set to placeholder if the provided URL fails
                    this.onerror = null; // Prevent infinite loop if placeholder also fails
                };


                const caption = document.createElement('div');
                caption.className = 'carousel-caption d-none d-md-block';
                caption.innerHTML = `<h5>${album.title || 'Unknown Title'}</h5><p>${album.artist || 'Unknown Artist'}</p>`;

                carouselItem.appendChild(img);
                carouselItem.appendChild(caption);
                carouselInner.appendChild(carouselItem);

                const indicatorButton = document.createElement('button');
                indicatorButton.type = 'button';
                indicatorButton.dataset.bsTarget = '#vinylCarousel';
                indicatorButton.dataset.bsSlideTo = index.toString();
                indicatorButton.setAttribute('aria-label', `Slide ${index + 1}: ${album.title || 'Unknown'}`);
                if (isActive) {
                    indicatorButton.className = 'active';
                    indicatorButton.setAttribute('aria-current', 'true');
                }
                carouselIndicators.appendChild(indicatorButton);
            });

            resultsContent.classList.remove('d-none');

            if (bootstrapCarousel) {
                 bootstrapCarousel.dispose();
            }
            // Only initialize if there are items
            if(albums.length > 0){
                bootstrapCarousel = new bootstrap.Carousel(carouselElement);
                 // Update and show the buy button for the first item
                 updateBuyButton(albums[0].title);
            }


        } else {
            resultsHeading.textContent = `No Releases Found for ${genre} on ${date}`;
            noResultsDisplay.classList.remove('d-none');
            resultsContent.classList.remove('d-none');
        }
    }

    function updateBuyButton(title) {
        if (title && title !== 'Unknown Title') {
            const query = encodeURIComponent(`${title} vinyl buy`);
            buyButton.href = `https://www.google.com/search?q=${query}`;
            buyButton.classList.remove('d-none');
        } else {
            buyButton.classList.add('d-none');
        }
    }

    // --- Event Listeners ---

    searchButton.addEventListener('click', () => {
        const selectedDate = dateInput.value;
        const selectedGenre = genreSelect.value;

        if (!selectedDate || !selectedGenre) {
            searchErrorDisplay.classList.remove('d-none');
            return;
        } else {
             searchErrorDisplay.classList.add('d-none');
        }

        showResultsArea();
        fetchVinylData(selectedDate, selectedGenre);
    });

    backButton.addEventListener('click', showSearchForm);

    carouselElement.addEventListener('slid.bs.carousel', (event) => {
        const activeItem = carouselInner.querySelector('.carousel-item.active');
        if (activeItem && activeItem.dataset.title) {
             updateBuyButton(activeItem.dataset.title);
        } else {
            buyButton.classList.add('d-none');
        }
    });

}); // End DOMContentLoaded