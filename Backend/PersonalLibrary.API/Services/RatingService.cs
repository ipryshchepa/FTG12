using PersonalLibrary.API.Data;
using PersonalLibrary.API.DTOs;
using PersonalLibrary.API.Exceptions;
using PersonalLibrary.API.Models;

namespace PersonalLibrary.API.Services;

/// <summary>
/// Service implementation for rating business logic operations.
/// </summary>
public class RatingService : IRatingService
{
    private readonly IRatingRepository _ratingRepository;
    private readonly IBookRepository _bookRepository;

    /// <summary>
    /// Initializes a new instance of the RatingService class.
    /// </summary>
    /// <param name="ratingRepository">The rating repository.</param>
    /// <param name="bookRepository">The book repository.</param>
    public RatingService(IRatingRepository ratingRepository, IBookRepository bookRepository)
    {
        _ratingRepository = ratingRepository;
        _bookRepository = bookRepository;
    }

    /// <inheritdoc />
    public async Task CreateOrUpdateRatingAsync(Guid bookId, RatingDto ratingDto)
    {
        // Validate score range
        if (ratingDto.Score < 1 || ratingDto.Score > 10)
        {
            throw new BadRequestException("Score must be between 1 and 10");
        }

        // Verify book exists
        var book = await _bookRepository.GetByIdAsync(bookId);
        if (book is null)
        {
            throw new NotFoundException($"Book with ID {bookId} not found");
        }

        // Check if rating already exists
        var existingRating = await _ratingRepository.GetByBookIdAsync(bookId);

        if (existingRating is null)
        {
            // Create new rating
            var rating = new Rating
            {
                BookId = bookId,
                Score = ratingDto.Score,
                Notes = ratingDto.Notes
            };
            await _ratingRepository.CreateAsync(rating);
        }
        else
        {
            // Update existing rating
            existingRating.Score = ratingDto.Score;
            existingRating.Notes = ratingDto.Notes;
            await _ratingRepository.UpdateAsync(existingRating);
        }
    }

    /// <inheritdoc />
    public async Task DeleteRatingAsync(Guid bookId)
    {
        // Verify book exists
        var book = await _bookRepository.GetByIdAsync(bookId);
        if (book is null)
        {
            throw new NotFoundException($"Book with ID {bookId} not found");
        }

        // Verify rating exists
        var existingRating = await _ratingRepository.GetByBookIdAsync(bookId);
        if (existingRating is null)
        {
            throw new NotFoundException($"Rating for book with ID {bookId} not found");
        }

        await _ratingRepository.DeleteByBookIdAsync(bookId);
    }
}
