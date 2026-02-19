using Microsoft.AspNetCore.Mvc;
using PersonalLibrary.API.DTOs;
using PersonalLibrary.API.Services;

namespace PersonalLibrary.API.Controllers;

/// <summary>
/// Controller for managing book reading statuses.
/// </summary>
[ApiController]
[Route("api/books/{bookId}/reading-status")]
public class ReadingStatusController : ControllerBase
{
    private readonly IReadingStatusService _readingStatusService;
    private readonly ILogger<ReadingStatusController> _logger;

    /// <summary>
    /// Initializes a new instance of the ReadingStatusController class.
    /// </summary>
    /// <param name="readingStatusService">The reading status service.</param>
    /// <param name="logger">The logger instance.</param>
    public ReadingStatusController(IReadingStatusService readingStatusService, ILogger<ReadingStatusController> logger)
    {
        _readingStatusService = readingStatusService;
        _logger = logger;
    }

    /// <summary>
    /// Creates or updates a reading status for a book.
    /// </summary>
    /// <param name="bookId">The book identifier.</param>
    /// <param name="statusDto">The reading status data.</param>
    /// <returns>Ok on success.</returns>
    [HttpPut]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid bookId, [FromBody] ReadingStatusDto statusDto)
    {
        await _readingStatusService.CreateOrUpdateReadingStatusAsync(bookId, statusDto);
        return Ok();
    }

    /// <summary>
    /// Deletes a reading status for a book.
    /// </summary>
    /// <param name="bookId">The book identifier.</param>
    /// <returns>No content on success.</returns>
    [HttpDelete]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid bookId)
    {
        await _readingStatusService.DeleteReadingStatusAsync(bookId);
        return NoContent();
    }
}
