using PersonalLibrary.API.DTOs;

namespace PersonalLibrary.API.Services;

/// <summary>
/// Service interface for book business logic operations.
/// </summary>
public interface IBookService
{
    /// <summary>
    /// Retrieves all books with related entities.
    /// </summary>
    /// <returns>List of book details.</returns>
    Task<List<BookDetailsDto>> GetAllBooksAsync();

    /// <summary>
    /// Retrieves a paginated and sorted list of books with related entities.
    /// </summary>
    /// <param name="page">The page number (1-based).</param>
    /// <param name="pageSize">The number of items per page.</param>
    /// <param name="sortBy">The field to sort by.</param>
    /// <param name="sortDirection">The sort direction ('asc' or 'desc').</param>
    /// <returns>Paginated response with book details and pagination info.</returns>
    Task<PaginatedResponse<BookDetailsDto>> GetAllBooksPaginatedAsync(int page, int pageSize, string sortBy, string sortDirection);

    /// <summary>
    /// Retrieves a single book by its identifier.
    /// </summary>
    /// <param name="id">The book identifier.</param>
    /// <returns>Book details, or null if not found.</returns>
    Task<BookDetailsDto?> GetBookByIdAsync(Guid id);

    /// <summary>
    /// Creates a new book.
    /// </summary>
    /// <param name="bookDto">The book data to create.</param>
    /// <returns>The created book details.</returns>
    Task<BookDetailsDto> CreateBookAsync(BookDto bookDto);

    /// <summary>
    /// Updates an existing book.
    /// </summary>
    /// <param name="id">The book identifier.</param>
    /// <param name="bookDto">The updated book data.</param>
    Task UpdateBookAsync(Guid id, BookDto bookDto);

    /// <summary>
    /// Deletes a book.
    /// </summary>
    /// <param name="id">The book identifier.</param>
    Task DeleteBookAsync(Guid id);
}
