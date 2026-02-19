using PersonalLibrary.API.DTOs;

namespace PersonalLibrary.API.Services;

/// <summary>
/// Service interface for rating business logic operations.
/// </summary>
public interface IRatingService
{
    /// <summary>
    /// Creates or updates a rating for a book.
    /// </summary>
    /// <param name="bookId">The book identifier.</param>
    /// <param name="ratingDto">The rating data.</param>
    Task CreateOrUpdateRatingAsync(Guid bookId, RatingDto ratingDto);

    /// <summary>
    /// Deletes a rating for a book.
    /// </summary>
    /// <param name="bookId">The book identifier.</param>
    Task DeleteRatingAsync(Guid bookId);
}
