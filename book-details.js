// Get the book ID from the URL
const urlParams = new URLSearchParams(window.location.search);
const bookId = urlParams.get("id");

// Example function to fetch book details (replace with actual API call)
async function fetchBookDetails(bookId) {
  try {
    // Fetching the book details from the Gutenberg API
    toggleSpinner(true);
    const response = await fetch(`https://gutendex.com/books/${bookId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    toggleSpinner(false);
    const book = await response.json();
    return book;
  } catch (error) {
    console.error("Error fetching book details:", error);
    return null; // In case of error, return null
  }
}

// Populate the detail page with the fetched book data
function populateBookDetails(book) {
  if (!book) {
    // If no book data is fetched, show an error or placeholder
    document.body.innerHTML = "<p>Error loading book details.</p>";
    return;
  }

  // Update the book cover
  const bookCover = document.querySelector(".book-header img");
  bookCover.src = book.formats["image/jpeg"] || "default-cover.jpg"; // Use a default image if cover is missing
  bookCover.alt = book.title || "Book Cover";

  // Update the book title
  const bookTitle = document.querySelector(".book-title");
  bookTitle.textContent = book.title || "Untitled";

  // Update the author name and years
  const authorName = document.querySelector(".author-name");
  const authorYears = document.querySelector(".author-years");
  const authors = book.authors[0] || {
    name: "Unknown Author",
    birth_year: "Unknown",
    death_year: "Unknown",
  };
  authorName.textContent = `${authors.name}`;
  authorYears.textContent = `(${authors.birth_year} - ${authors.death_year})`;

  // Update download count
  const downloadCount = document.querySelector(".download-count");
  downloadCount.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
    ${
      book.download_count ? book.download_count.toLocaleString() : "Unknown"
    } Downloads`;

  // Update subjects (check if book has subjects)
  const subjectsContainer = document.querySelector(".section .tags-container");
  subjectsContainer.innerHTML = ""; // Clear existing subjects
  if (book.subjects && book.subjects.length > 0) {
    book.subjects.forEach((subject) => {
      const subjectTag = document.createElement("span");
      subjectTag.classList.add("tag");
      subjectTag.textContent = subject;
      subjectsContainer.appendChild(subjectTag);
    });
  } else {
    const noSubjectsTag = document.createElement("span");
    noSubjectsTag.classList.add("tag");
    noSubjectsTag.textContent = "No subjects available";
    subjectsContainer.appendChild(noSubjectsTag);
  }

  // Update bookshelves (check if book has bookshelves)
  const bookshelvesContainer = document
    .querySelectorAll(".section")[1]
    .querySelector(".tags-container");
  bookshelvesContainer.innerHTML = ""; // Clear existing bookshelves
  if (book.bookshelves && book.bookshelves.length > 0) {
    book.bookshelves.forEach((bookshelf) => {
      const shelfTag = document.createElement("span");
      shelfTag.classList.add("tag");
      shelfTag.textContent = bookshelf;
      bookshelvesContainer.appendChild(shelfTag);
    });
  } else {
    const noBookshelvesTag = document.createElement("span");
    noBookshelvesTag.classList.add("tag");
    noBookshelvesTag.textContent = "No bookshelves available";
    bookshelvesContainer.appendChild(noBookshelvesTag);
  }

  // Update available formats (check if book has formats)
  const formatsGrid = document.querySelector(".formats-grid");
  formatsGrid.innerHTML = ""; // Clear existing formats
  if (book.formats) {
    Object.keys(book.formats).forEach((formatKey) => {
      const formatUrl = book.formats[formatKey];
      const formatLink = document.createElement("a");
      formatLink.href = formatUrl;
      formatLink.classList.add("format-link");
      formatLink.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
          <polyline points="13 2 13 9 20 9"></polyline>
        </svg>
        ${formatKey}`;
      formatsGrid.appendChild(formatLink);
    });
  } else {
    const noFormatsTag = document.createElement("span");
    noFormatsTag.classList.add("tag");
    noFormatsTag.textContent = "No formats available";
    formatsGrid.appendChild(noFormatsTag);
  }
}

// Fetch and populate the page
fetchBookDetails(bookId)
  .then((book) => populateBookDetails(book))
  .catch((error) => console.error("Error fetching book details:", error));
