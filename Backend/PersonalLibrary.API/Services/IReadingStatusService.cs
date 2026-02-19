using PersonalLibrary.API.DTOs;

namespace PersonalLibrary.API.Services;

/// <summary>
/// Service interface for reading status business logic operations.
/// </summary>
public interface IReadingStatusService
{
    /// <summary>
    /// Creates or updates a reading status for a book.
    /// </summary>
    /// <param name="bookId">The book identifier.</param>
    /// <param name="statusDto">The reading status data.</param>
    Task CreateOrUpdateReadingStatusAsync(Guid bookId, ReadingStatusDto statusDto);

    /// <summary>
    /// Deletes a reading status for a book.
    /// </summary>
    /// <param name="bookId">The book identifier.</param>
    Task DeleteReadingStatusAsync(Guid bookId);
}
