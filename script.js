
document.getElementById('search-form').addEventListener('submit', handleSearch);

document.getElementById('sort-rating').addEventListener('click', handleSort);


/**
 * Searches for books using the Google Books API based on the given query and type.

 * @description
 * This function allows users to search for books using the Google Books API.
 * It performs the following actions:
 * 1. Uses the query and type parameters to construct the API request. Make sure to include a query parameter to limit the results to a maximum of 10 books.
 * 2. Fetches data from the Google Books API.
 * 3. Processes the API response to extract relevant book information.
 * 4. Returns an array of book objects with the following properties:
 *    - title: The book's title
 *    - author_name: The name of the author(s)
 *    - isbn: The book's ISBN
 *    - cover_i: Cover image
 *    - ebook_access: Information about ebook availability
 *    - first_publish_year: Year of first publication
 *    - ratings_sortable: Book ratings information
 */
async function searchBooks(query, type) {
    const apiKey = 'AIzaSyBreD8tr9R3YxBEIbm-6YaH68TNTZZegzk';
    const maxResults = 10;
    let searchType;

    switch (type) {
        case 'title':
            searchType = `intitle:${query}`;
            break;
        case 'author':
            searchType = `inauthor:${query}`;
            break;
        case 'isbn':
            searchType = `isbn:${query}`;
            break;
        default:
            throw new Error('Invalid search type');
    }

    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${searchType}&maxResults=${maxResults}&key=${apiKey}`);
    const data = await response.json();

    return data.items.map(item => ({
        title: item.volumeInfo.title,
        author_name:item.volumeInfo.authors.join(', '),
        isbn: item.volumeInfo.industryIdentifiers ? item.volumeInfo.industryIdentifiers[0].identifier : 'Unknown',
        cover_i: item.volumeInfo.imageLinks ? item.volumeInfo.imageLinks.thumbnail : 'No Image',
        ebook_access: item.accessInfo.epub.isAvailable ? 'Available' : 'Not Available',
        first_publish_year: item.volumeInfo.publishedDate ? new Date(item.volumeInfo.publishedDate).getFullYear() : 'Unknown',
        ratings_sortable: item.volumeInfo.averageRating || 0
    }));
}


/**
* Takes in a list of books and updates the UI accordingly.
*
* @description
* This function takes an array of book objects and creates a visual representation
* of each book as a list item (<li>) within an unordered list (<ul>). 
* It performs the following actions:
* 
* 1. Targets the unordered list with the id 'book-list'.
* 2. Clears the inner HTML of the list.
* 3. For each book in the 'books' array, creates an <li> element containing:
*    - The book's title within an element that has a class of `title-element`
*    - The book's author within an element that has a class of `author-element`
*    - The book's cover image within an element that has a class of `cover-element`
*    - The book’s rating within an element that has a class of `rating-element`
*    - The book’s e-book access value within an element that has a class of `ebook-element`
*    Note: The order and specific layout of this information is flexible 
*    and determined by the developer.
* 4. Appends each created <li> element to the 'book-list' <ul>.
* 5. Ensures that the 'selected-book' element is not visible.
*/
function displayBookList(books) {
    const bookListElement = document.getElementById('book-list');
    bookListElement.innerHTML = ''; 

    books.forEach(book => {
        const bookItem = document.createElement('li');
        bookItem.classList.add('book-item');
        
        bookItem.innerHTML = `
            <div class="title-element">${book.title}</div>
            <div class="author-element">Author: ${book.author_name}</div>
            <div class="cover-element">
                <img src="${book.cover_i}" alt="${book.title} Cover"/>
            </div>
            <div class="rating-element">Rating: ${book.ratings_sortable}</div>
            <div class="ebook-element">E-book: ${book.ebook_access}</div>
        `;

        bookItem.addEventListener('click', () => displaySingleBook(book));
        bookListElement.appendChild(bookItem);
    });

    document.getElementById('selected-book').style.display = 'none';
}

/**
 * Handles the search form submission and updates the UI with search results.
 * @description
 * This function is triggered when the user submits the search form with id 'search-form'.
 *
 * It performs the following actions:
 * 1. Prevents the default form submission behavior.
 * 2. Retrieves the search query from the textbox input.
 * 3. Gets the selected search type (title, ISBN, or author) from the 'search-type' select element.
 * 4. Calls the searchBooks() function with the query and search type.
 * 5. Waits for the searchBooks() function to return results from the Google Books API.
 * 6. Passes the returned book data to the displayBookList() function to update the UI.
 * 7. Handles any errors that may occur during the search process.
 */
async function handleSearch(event) {
    event.preventDefault();
    
    const query = document.getElementById('search-input').value;
    const type = document.getElementById('search-type').value;
    
        const books = await searchBooks(query, type);
        displayBookList(books);
}


/**
 * Displays detailed information about a single book when it's clicked.
 * 
 * @description
 * This function is triggered when a user clicks on a book in the list.
 * It updates the UI to show detailed information about the selected book.
 * 
 * The function performs the following actions:
 * 1. Hides the unordered list element with id 'book-list'.
 * 2. Makes the element with id 'selected-book' visible.
 * 3. Populates the 'selected-book' element with the following book details:
 *    - Title
 *    - Author
 *    - First publish year
 *    - Cover image
 *    - ISBN
 *    - Ebook access value
 *    - Rating
 */
function displaySingleBook(book) {
    const selectedBookElement = document.getElementById('selected-book');
    
    document.getElementById('book-title').textContent = book.title;
    document.getElementById('book-author').textContent = `Author: ${book.author_name}`;
    document.getElementById('book-first-publish-year').textContent = `First Publish Year: ${book.first_publish_year}`;
    document.getElementById('book-isbn').textContent = `ISBN: ${book.isbn}`;
    document.getElementById('book-ebook-access').textContent = `E-book Access: ${book.ebook_access}`;
    document.getElementById('book-rating').textContent = `Rating: ${book.ratings_sortable}`;
    document.getElementById('book-cover').src = book.cover_i;
    
    document.getElementById('book-list').style.display = 'none';
    selectedBookElement.style.display = 'block';
}



/**
 * Filters the displayed book list to show only e-books when the checkbox is checked.
 * 
 * @description
 * This function ensures that when the checkbox with id 'ebook-filter' is checked, the related search results only display books that are available as e-books.
 * 
 * The function performs the following actions:
 * 1. Checks the state of the 'ebook-filter' checkbox.
 * 2. If checked:
 *    - Filters the current list of books to include only those that are borrowable as e-books.
 *    - Updates the displayed book list with the filtered results.
 * 3. If unchecked:
 *    - Displays the full list of search results without filtering.
 * 
 */
function handleFilter() {
    const isChecked = document.getElementById('ebook-filter').checked;
    const allBooks = Array.from(document.querySelectorAll('#book-list > li'));

    allBooks.forEach(bookItem => {
    
        const ebookElement = bookItem.querySelector('.ebook-element');
    
        const ebookStatus = ebookElement ? ebookElement.textContent.trim() : '';

        if (isChecked && ebookStatus !== 'E-book: Available') {
            bookItem.style.display = 'none';
        } else {
            bookItem.style.display = 'block';
        }
    });
}



/**
 * Sorts the displayed book list by rating in descending order when the button is clicked.
 * 
 * 
 * @description
 * This function is triggered when the user clicks on the button with the id 'sort-rating'.
 * It sorts the currently displayed list of books based on their ratings.
 * 
 * The function performs the following actions:
 * 1. Sorts the current list of books by their ratings in descending order (highest to lowest).
 * 2. If any rating is non-numeric, such as "undefined" or "unknown", the book's rating must be changed to "0" instead.
 * 3. Updates the displayed book list with the sorted results.
 * 
 */
function handleSort() {
    const bookListElement = document.getElementById('book-list');
    const books = Array.from(bookListElement.querySelectorAll('.book-item'));

    books.sort((a, b) => {
        const ratingA = parseFloat(a.querySelector('.rating-element').textContent.replace('Rating: ', '') || '0');
        const ratingB = parseFloat(b.querySelector('.rating-element').textContent.replace('Rating: ', '') || '0');
        return ratingB - ratingA;
    });

    bookListElement.innerHTML = '';
    books.forEach(book => bookListElement.appendChild(book));
}
document.getElementById('back-to-list').addEventListener('click', () => {
    document.getElementById('book-list').style.display = 'block';
});

document.getElementById('ebook-filter').addEventListener('change', handleFilter);
