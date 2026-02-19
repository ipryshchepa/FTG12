using PersonalLibrary.API.Models;

namespace PersonalLibrary.API.Data;

/// <summary>
/// Repository interface for loan data access operations.
/// </summary>
public interface ILoanRepository
{
    /// <summary>
    /// Retrieves the active loan for a book.
    /// </summary>
    /// <param name="bookId">The book identifier.</param>
    /// <returns>The active loan entity, or null if not found.</returns>
    Task<Loan?> GetActiveLoanByBookIdAsync(Guid bookId);

    /// <summary>
    /// Retrieves all currently active loans with book details.
    /// </summary>
    /// <returns>List of active loans.</returns>
    Task<List<Loan>> GetAllActiveLoansAsync();

    /// <summary>
    /// Retrieves the loan history for a specific book.
    /// </summary>
    /// <param name="bookId">The book identifier.</param>
    /// <returns>List of loans for the book, ordered by loan date descending.</returns>
    Task<List<Loan>> GetLoanHistoryByBookIdAsync(Guid bookId);

    /// <summary>
    /// Creates a new loan in the database.
    /// </summary>
    /// <param name="loan">The loan entity to create.</param>
    /// <returns>The created loan entity.</returns>
    Task<Loan> CreateAsync(Loan loan);

    /// <summary>
    /// Returns a book by marking its active loan as returned.
    /// </summary>
    /// <param name="bookId">The book identifier.</param>
    Task ReturnLoanAsync(Guid bookId);
}
