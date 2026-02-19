using PersonalLibrary.API.DTOs;
using PersonalLibrary.API.Models;

namespace PersonalLibrary.API.Services;

/// <summary>
/// Service interface for loan business logic operations.
/// </summary>
public interface ILoanService
{
    /// <summary>
    /// Retrieves all currently active loans.
    /// </summary>
    /// <returns>List of active loans.</returns>
    Task<List<Loan>> GetActiveLoanedBooksAsync();

    /// <summary>
    /// Retrieves the loan history for a specific book.
    /// </summary>
    /// <param name="bookId">The book identifier.</param>
    /// <returns>List of loans for the book.</returns>
    Task<List<Loan>> GetLoanHistoryAsync(Guid bookId);

    /// <summary>
    /// Creates a new loan for a book.
    /// </summary>
    /// <param name="bookId">The book identifier.</param>
    /// <param name="loanDto">The loan data.</param>
    Task CreateLoanAsync(Guid bookId, LoanDto loanDto);

    /// <summary>
    /// Returns a loaned book.
    /// </summary>
    /// <param name="bookId">The book identifier.</param>
    Task ReturnBookAsync(Guid bookId);
}
