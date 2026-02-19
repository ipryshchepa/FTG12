using Microsoft.EntityFrameworkCore;
using PersonalLibrary.API.Models;

namespace PersonalLibrary.API.Data;

/// <summary>
/// Repository implementation for loan data access operations.
/// </summary>
public class LoanRepository : ILoanRepository
{
    private readonly LibraryDbContext _context;

    /// <summary>
    /// Initializes a new instance of the LoanRepository class.
    /// </summary>
    /// <param name="context">The database context.</param>
    public LoanRepository(LibraryDbContext context)
    {
        _context = context;
    }

    /// <inheritdoc />
    public async Task<Loan?> GetActiveLoanByBookIdAsync(Guid bookId)
    {
        return await _context.Loans
            .AsNoTracking()
            .FirstOrDefaultAsync(l => l.BookId == bookId && !l.IsReturned);
    }

    /// <inheritdoc />
    public async Task<List<Loan>> GetAllActiveLoansAsync()
    {
        return await _context.Loans
            .AsNoTracking()
            .Include(l => l.Book)
            .Where(l => !l.IsReturned)
            .OrderBy(l => l.LoanDate)
            .ToListAsync();
    }

    /// <inheritdoc />
    public async Task<List<Loan>> GetLoanHistoryByBookIdAsync(Guid bookId)
    {
        return await _context.Loans
            .AsNoTracking()
            .Where(l => l.BookId == bookId)
            .OrderByDescending(l => l.LoanDate)
            .ToListAsync();
    }

    /// <inheritdoc />
    public async Task<Loan> CreateAsync(Loan loan)
    {
        _context.Loans.Add(loan);
        await _context.SaveChangesAsync();
        return loan;
    }

    /// <inheritdoc />
    public async Task ReturnLoanAsync(Guid bookId)
    {
        var loan = await _context.Loans
            .FirstOrDefaultAsync(l => l.BookId == bookId && !l.IsReturned);
        if (loan is not null)
        {
            loan.IsReturned = true;
            loan.ReturnedDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }
}
