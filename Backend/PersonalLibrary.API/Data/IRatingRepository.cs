using PersonalLibrary.API.Models;

namespace PersonalLibrary.API.Data;

/// <summary>
/// Repository interface for rating data access operations.
/// </summary>
public interface IRatingRepository
{
    /// <summary>
    /// Retrieves a rating by book identifier.
    /// </summary>
    /// <param name="bookId">The book identifier.</param>
    /// <returns>The rating entity, or null if not found.</returns>
    Task<Rating?> GetByBookIdAsync(Guid bookId);

    /// <summary>
    /// Creates a new rating in the database.
    /// </summary>
    /// <param name="rating">The rating entity to create.</param>
    /// <returns>The created rating entity.</returns>
    Task<Rating> CreateAsync(Rating rating);

    /// <summary>
    /// Updates an existing rating in the database.
    /// </summary>
    /// <param name="rating">The rating entity to update.</param>
    Task UpdateAsync(Rating rating);

    /// <summary>
    /// Deletes a rating by book identifier.
    /// </summary>
    /// <param name="bookId">The book identifier.</param>
    Task DeleteByBookIdAsync(Guid bookId);
}
