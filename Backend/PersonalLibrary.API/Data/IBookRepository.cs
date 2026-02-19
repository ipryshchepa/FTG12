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
