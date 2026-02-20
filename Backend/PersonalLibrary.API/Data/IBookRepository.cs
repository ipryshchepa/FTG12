using PersonalLibrary.API.DTOs;
using PersonalLibrary.API.Models;

namespace PersonalLibrary.API.Data;

/// <summary>
/// Repository interface for book data access operations.
/// </summary>
public interface IBookRepository
{
    /// <summary>
    /// Retrieves all books with related entities as flattened DTOs.
    /// </summary>
    /// <returns>List of book details with flattened related data.</returns>
    Task<List<BookDetailsDto>> GetAllAsync();

    /// <summary>
    /// Retrieves a paginated and sorted list of books with related entities.
    /// </summary>
    /// <param name="page">The page number (1-based).</param>
    /// <param name="pageSize">The number of items per page.</param>
    /// <param name="sortBy">The field to sort by.</param>
    /// <param name="sortDirection">The sort direction ('asc' or 'desc').</param>
    /// <returns>Paginated response with book details and pagination info.</returns>
    Task<PaginatedResponse<BookDetailsDto>> GetAllPaginatedAsync(int page, int pageSize, string sortBy, string sortDirection);

    /// <summary>
    /// Retrieves a single book by its identifier with all related entities.
    /// </summary>
    /// <param name="id">The book identifier.</param>
    /// <returns>Book details with flattened related data, or null if not found.</returns>
    Task<BookDetailsDto?> GetByIdAsync(Guid id);

    /// <summary>
    /// Creates a new book in the database.
    /// </summary>
    /// <param name="book">The book entity to create.</param>
    /// <returns>The created book entity.</returns>
    Task<Book> CreateAsync(Book book);

    /// <summary>
    /// Updates an existing book in the database.
    /// </summary>
    /// <param name="book">The book entity to update.</param>
    Task UpdateAsync(Book book);

    /// <summary>
    /// Deletes a book from the database.
    /// </summary>
    /// <param name="id">The identifier of the book to delete.</param>
    Task DeleteAsync(Guid id);
}
