using PersonalLibrary.API.Data;
using PersonalLibrary.API.DTOs;
using PersonalLibrary.API.Exceptions;
using PersonalLibrary.API.Models;

namespace PersonalLibrary.API.Services;

/// <summary>
/// Service implementation for loan business logic operations.
/// </summary>
public class LoanService : ILoanService
{
    private readonly ILoanRepository _loanRepository;
    private readonly IBookRepository _bookRepository;

    /// <summary>
    /// Initializes a new instance of the LoanService class.
    /// </summary>
    /// <param name="loanRepository">The loan repository.</param>
    /// <param name="bookRepository">The book repository.</param>
    public LoanService(ILoanRepository loanRepository, IBookRepository bookRepository)
    {
        _loanRepository = loanRepository;
        _bookRepository = bookRepository;
    }

    /// <inheritdoc />
    public async Task<List<Loan>> GetActiveLoanedBooksAsync()
    {
        return await _loanRepository.GetAllActiveLoansAsync();
    }

    /// <inheritdoc />
    public async Task<List<Loan>> GetLoanHistoryAsync(Guid bookId)
    {
        // Verify book exists
        var book = await _bookRepository.GetByIdAsync(bookId);
        if (book is null)
        {
            throw new NotFoundException($"Book with ID {bookId} not found");
        }

        return await _loanRepository.GetLoanHistoryByBookIdAsync(bookId);
    }

    /// <inheritdoc />
    public async Task CreateLoanAsync(Guid bookId, LoanDto loanDto)
    {
        // Verify book exists
        var book = await _bookRepository.GetByIdAsync(bookId);
        if (book is null)
        {
            throw new NotFoundException($"Book with ID {bookId} not found");
        }

        // Verify no active loan exists
        var activeLoan = await _loanRepository.GetActiveLoanByBookIdAsync(bookId);
        if (activeLoan is not null)
        {
            throw new BusinessRuleException($"Book with ID {bookId} is already loaned to {activeLoan.BorrowedTo}");
        }

        // Create loan
        var loan = new Loan
        {
            BookId = bookId,
            BorrowedTo = loanDto.BorrowedTo,
            LoanDate = DateTime.UtcNow,
            IsReturned = false
        };

        await _loanRepository.CreateAsync(loan);
    }

    /// <inheritdoc />
    public async Task ReturnBookAsync(Guid bookId)
    {
        // Verify active loan exists
        var activeLoan = await _loanRepository.GetActiveLoanByBookIdAsync(bookId);
        if (activeLoan is null)
        {
            throw new NotFoundException($"No active loan found for book with ID {bookId}");
        }

        await _loanRepository.ReturnLoanAsync(bookId);
    }
}
