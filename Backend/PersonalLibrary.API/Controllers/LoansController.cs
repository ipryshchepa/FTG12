using Microsoft.AspNetCore.Mvc;
using PersonalLibrary.API.DTOs;
using PersonalLibrary.API.Models;
using PersonalLibrary.API.Services;

namespace PersonalLibrary.API.Controllers;

/// <summary>
/// Controller for managing book loans.
/// </summary>
[ApiController]
public class LoansController : ControllerBase
{
    private readonly ILoanService _loanService;
    private readonly ILogger<LoansController> _logger;

    /// <summary>
    /// Initializes a new instance of the LoansController class.
    /// </summary>
    /// <param name="loanService">The loan service.</param>
    /// <param name="logger">The logger instance.</param>
    public LoansController(ILoanService loanService, ILogger<LoansController> logger)
    {
        _loanService = loanService;
        _logger = logger;
    }

    /// <summary>
    /// Retrieves all currently active loans.
    /// </summary>
    /// <returns>A list of active loans.</returns>
    [HttpGet("api/loans")]
    [ProducesResponseType(typeof(List<Loan>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<Loan>>> GetActiveLoans()
    {
        var loans = await _loanService.GetActiveLoanedBooksAsync();
        return Ok(loans);
    }

    /// <summary>
    /// Retrieves the loan history for a specific book.
    /// </summary>
    /// <param name="bookId">The book identifier.</param>
    /// <returns>A list of loans for the book.</returns>
    [HttpGet("api/books/{bookId}/loans")]
    [ProducesResponseType(typeof(List<Loan>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<List<Loan>>> GetLoanHistory(Guid bookId)
    {
        var loans = await _loanService.GetLoanHistoryAsync(bookId);
        return Ok(loans);
    }

    /// <summary>
    /// Creates a new loan for a book.
    /// </summary>
    /// <param name="bookId">The book identifier.</param>
    /// <param name="loanDto">The loan data.</param>
    /// <returns>Created on success.</returns>
    [HttpPost("api/books/{bookId}/loan")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateLoan(Guid bookId, [FromBody] LoanDto loanDto)
    {
        await _loanService.CreateLoanAsync(bookId, loanDto);
        return Created();
    }

    /// <summary>
    /// Returns a loaned book.
    /// </summary>
    /// <param name="bookId">The book identifier.</param>
    /// <returns>No content on success.</returns>
    [HttpDelete("api/books/{bookId}/loan")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ReturnBook(Guid bookId)
    {
        await _loanService.ReturnBookAsync(bookId);
        return NoContent();
    }
}
