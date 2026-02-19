using PersonalLibrary.API.Models;

namespace PersonalLibrary.API.Data;

/// <summary>
/// Repository interface for reading status data access operations.
/// </summary>
public interface IReadingStatusRepository
{
    /// <summary>
    /// Retrieves a reading status by book identifier.
    /// </summary>
    /// <param name="bookId">The book identifier.</param>
    /// <returns>The reading status entity, or null if not found.</returns>
    Task<ReadingStatus?> GetByBookIdAsync(Guid bookId);

    /// <summary>
    /// Creates a new reading status in the database.
    /// </summary>
    /// <param name="status">The reading status entity to create.</param>
    /// <returns>The created reading status entity.</returns>
    Task<ReadingStatus> CreateAsync(ReadingStatus status);

    /// <summary>
    /// Updates an existing reading status in the database.
    /// </summary>
    /// <param name="status">The reading status entity to update.</param>
    Task UpdateAsync(ReadingStatus status);

    /// <summary>
    /// Deletes a reading status by book identifier.
    /// </summary>
    /// <param name="bookId">The book identifier.</param>
    Task DeleteByBookIdAsync(Guid bookId);
}
