using Microsoft.AspNetCore.Mvc;
using PersonalLibrary.API.DTOs;
using PersonalLibrary.API.Services;

namespace PersonalLibrary.API.Controllers;

/// <summary>
/// Controller for managing book ratings.
/// </summary>
[ApiController]
[Route("api/books/{bookId}/rating")]
public class RatingsController : ControllerBase
{
    private readonly IRatingService _ratingService;
    private readonly ILogger<RatingsController> _logger;

    /// <summary>
    /// Initializes a new instance of the RatingsController class.
    /// </summary>
    /// <param name="ratingService">The rating service.</param>
    /// <param name="logger">The logger instance.</param>
    public RatingsController(IRatingService ratingService, ILogger<RatingsController> logger)
    {
        _ratingService = ratingService;
        _logger = logger;
    }

    /// <summary>
    /// Creates or updates a rating for a book.
    /// </summary>
    /// <param name="bookId">The book identifier.</param>
    /// <param name="ratingDto">The rating data.</param>
    /// <returns>Ok on success.</returns>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateOrUpdate(Guid bookId, [FromBody] RatingDto ratingDto)
    {
        await _ratingService.CreateOrUpdateRatingAsync(bookId, ratingDto);
        return Ok();
    }

    /// <summary>
    /// Deletes a rating for a book.
    /// </summary>
    /// <param name="bookId">The book identifier.</param>
    /// <returns>No content on success.</returns>
    [HttpDelete]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid bookId)
    {
        await _ratingService.DeleteRatingAsync(bookId);
        return NoContent();
    }
}
