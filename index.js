let books; // Store the fetched books globally
let filteredBooks = []; // Store the filtered books based on search or genre
let selectedGenre = ""; // To store the selected genre
let currentPage = 1; // Track the current page
const itemsPerPage = 8; // Number of items to display per page
const cardContainer = document.getElementById("card-container"); // Book cards container
const searchInput = document.querySelector(".search-input"); // Search input field
const selectedGenreText = document.getElementById("selectedGenreText"); // Display selected genres in the button
const genreSelect = document.getElementById("genreSelect"); // Genre select dropdown

// Fetch books from the API
async function fetchBooks() {
  const response = await fetch(`https://gutendex.com/books`);
  return await response.json();
}

// Get the current whitelist from local storage
function getWhitelist() {
  return JSON.parse(localStorage.getItem("whitelistBooks")) || [];
}

// Save the whitelist to local storage
function saveWhitelist(whitelist) {
  localStorage.setItem("whitelistBooks", JSON.stringify(whitelist));
}

// Toggle book in whitelist
function toggleWhitelist(button, bookId) {
  const whitelist = getWhitelist();
  const index = whitelist.indexOf(bookId);

  // Add or remove from whitelist
  if (index === -1) {
    whitelist.push(bookId);
  } else {
    whitelist.splice(index, 1);
  }

  saveWhitelist(whitelist); // Save updated whitelist
  updateWhitelistButton(button, bookId); // Update the button color
}

// Update the whitelist button color based on whether the book is whitelisted
function updateWhitelistButton(button, bookId) {
  const whitelist = getWhitelist();

  if (whitelist.includes(bookId)) {
    button.classList.add("whitelisted"); // Add red color class
  } else {
    button.classList.remove("whitelisted"); // Remove red color class
  }
}

// Populate the genre select dropdown dynamically with unique bookshelves (genres)
function populateDropdown(uniqueBookshelves) {
  genreSelect.innerHTML = '<option value="">Select a genre</option>'; // Clear previous options
  uniqueBookshelves.forEach((genre) => {
    const option = document.createElement("option");
    option.value = genre;
    option.textContent = genre;
    genreSelect.appendChild(option);
  });
}

// Create card for each book
function createCard(book) {
  const id = book?.id;
  const image = book?.formats["image/jpeg"];
  const title = book?.title;
  const author = book?.authors[0]?.name;
  const genre = book?.bookshelves
    .map((item) => item.replace("Browsing: ", ""))
    .join(", ");

  const card = document.createElement("div");
  card.classList.add("card");

  card.innerHTML = `
    <div class="card-img-container">
      <img src="${image}" alt="${title}" class="card-img" />
      <button class="whitelist-btn" onclick="toggleWhitelist(this, ${id})">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>
    </div>
    <div class="card-content">
      <h3 class="card-title">${title}</h3>
      <p class="card-author">${author}</p>
      <span class="card-genre">${genre}</span>
      <button class="detail-btn" data-id="${id}">View Details</button>
    </div>
  `;

  // Attach click event listener for the 'View Details' button
  const detailsBtn = card.querySelector(".detail-btn");
  detailsBtn.addEventListener("click", () => goToDetailsPage(id));

  // Update the whitelist button state (red color if the book is whitelisted)
  const whitelistButton = card.querySelector(".whitelist-btn");
  updateWhitelistButton(whitelistButton, id);

  return card;
}

// Display books with pagination
function displayBooks(books, cardContainer, itemsPerPage, page = 1) {
  cardContainer.innerHTML = ""; // Clear previous cards

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = page * itemsPerPage;
  const booksToDisplay = books.slice(startIndex, endIndex);

  booksToDisplay.forEach((book, index) => {
    const card = createCard(book);
    card.style.animationDelay = `${index * 0.1}s`; // Add delay for each card
    cardContainer.appendChild(card);
  });

  updatePaginationButtons(books.length);
}

// Update pagination button states based on the current page
function updatePaginationButtons(totalItems) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages || totalItems <= itemsPerPage;
}

// Pagination control
function paginate(direction) {
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);

  if (direction === "next" && currentPage < totalPages) {
    currentPage++;
  } else if (direction === "prev" && currentPage > 1) {
    currentPage--;
  }

  displayBooks(filteredBooks, cardContainer, itemsPerPage, currentPage);
}

// Filter books by search term (title) and selected genre
function filterBooks() {
  const searchTerm = searchInput.value.toLowerCase();
  selectedGenre = genreSelect.value;

  filteredBooks = books.results.filter((book) => {
    const titleMatches = book.title.toLowerCase().includes(searchTerm);
    const genreMatches =
      !selectedGenre ||
      book.bookshelves.some(
        (shelf) => shelf.replace("Browsing: ", "") === selectedGenre
      );
    return titleMatches && genreMatches;
  });

  currentPage = 1; // Reset to the first page
  displayBooks(filteredBooks, cardContainer, itemsPerPage, currentPage);
  selectedGenreText.innerText = selectedGenre ? `: ${selectedGenre}` : ""; // Update selected genre text
}

// Sending data between pages
function goToDetailsPage(bookId) {
  window.location.href = `details.html?id=${bookId}`;
}

// Initialize the page
document.addEventListener("DOMContentLoaded", async () => {
  toggleSpinner(true);
  books = await fetchBooks(); // Fetch books
  toggleSpinner(false);

  // Extract unique bookshelves (genres)
  let allBookshelves = books.results.flatMap((result) => result.bookshelves);
  let uniqueBookshelves = [...new Set(allBookshelves)].map((item) =>
    item.replace("Browsing: ", "")
  );

  // Populate the dropdown with unique genres
  populateDropdown(uniqueBookshelves);

  // Display the initial set of books
  filteredBooks = books.results; // Start with all books
  displayBooks(filteredBooks, cardContainer, itemsPerPage, currentPage);

  // Pagination button event listeners
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  prevBtn.addEventListener("click", () => paginate("prev"));
  nextBtn.addEventListener("click", () => paginate("next"));

  // Search input event listener
  searchInput.addEventListener("input", filterBooks); // Trigger filter on input change
});

// Show whitelisted books on the whitelist page
function displayWhitelistedBooks() {
  const whitelist = getWhitelist();
  const whitelistedBooks = books.results.filter((book) =>
    whitelist.includes(book.id)
  );

  cardContainer.innerHTML = ""; // Clear previous cards
  whitelistedBooks.forEach((book) => {
    const card = createCard(book);
    cardContainer.appendChild(card);
  });

  updatePaginationButtons(whitelistedBooks.length); // Update pagination
}
