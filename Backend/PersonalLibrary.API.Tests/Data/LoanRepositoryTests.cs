using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using PersonalLibrary.API.Data;
using PersonalLibrary.API.Models;

namespace PersonalLibrary.API.Tests.Data;

/// <summary>
/// Tests for LoanRepository data access operations.
/// </summary>
public class LoanRepositoryTests : IDisposable
{
    private readonly LibraryDbContext _context;
    private readonly LoanRepository _repository;

    public LoanRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<LibraryDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new LibraryDbContext(options);
        _repository = new LoanRepository(_context);
    }

    [Fact]
    public async Task GetActiveLoanByBookIdAsync_WhenActiveLoanExists_ReturnsLoan()
    {
        // Arrange
        var book = new Book { Title = "Test Book", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own };
        _context.Books.Add(book);
        await _context.SaveChangesAsync();

        var activeLoan = new Loan
        {
            BookId = book.Id,
            BorrowedTo = "Jane Doe",
            LoanDate = DateTime.UtcNow.AddDays(-5),
            IsReturned = false
        };
        _context.Loans.Add(activeLoan);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetActiveLoanByBookIdAsync(book.Id);

        // Assert
        result.Should().NotBeNull();
        result!.BorrowedTo.Should().Be("Jane Doe");
        result.IsReturned.Should().BeFalse();
    }

    [Fact]
    public async Task GetActiveLoanByBookIdAsync_WhenOnlyReturnedLoanExists_ReturnsNull()
    {
        // Arrange
        var book = new Book { Title = "Test Book", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own };
        _context.Books.Add(book);
        await _context.SaveChangesAsync();

        var returnedLoan = new Loan
        {
            BookId = book.Id,
            BorrowedTo = "Jane Doe",
            LoanDate = DateTime.UtcNow.AddDays(-10),
            IsReturned = true,
            ReturnedDate = DateTime.UtcNow.AddDays(-3)
        };
        _context.Loans.Add(returnedLoan);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetActiveLoanByBookIdAsync(book.Id);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetAllActiveLoansAsync_ReturnsOnlyNonReturnedLoans()
    {
        // Arrange
        var book1 = new Book { Title = "Book 1", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own };
        var book2 = new Book { Title = "Book 2", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own };
        _context.Books.AddRange(book1, book2);
        await _context.SaveChangesAsync();

        var activeLoan = new Loan { BookId = book1.Id, BorrowedTo = "John", IsReturned = false };
        var returnedLoan = new Loan { BookId = book2.Id, BorrowedTo = "Jane", IsReturned = true };
        _context.Loans.AddRange(activeLoan, returnedLoan);
        await _context.SaveChangesAsync();

        // Act
        var results = await _repository.GetAllActiveLoansAsync();

        // Assert
        results.Should().HaveCount(1);
        results.First().BorrowedTo.Should().Be("John");
        results.First().IsReturned.Should().BeFalse();
    }

    [Fact]
    public async Task GetLoanHistoryByBookIdAsync_ReturnsAllLoansForBook()
    {
        // Arrange
        var book = new Book { Title = "Test Book", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own };
        _context.Books.Add(book);
        await _context.SaveChangesAsync();

        var loan1 = new Loan { BookId = book.Id, BorrowedTo = "Person 1", IsReturned = true };
        var loan2 = new Loan { BookId = book.Id, BorrowedTo = "Person 2", IsReturned = false };
        _context.Loans.AddRange(loan1, loan2);
        await _context.SaveChangesAsync();

        // Act
        var results = await _repository.GetLoanHistoryByBookIdAsync(book.Id);

        // Assert
        results.Should().HaveCount(2);
    }

    [Fact]
    public async Task CreateAsync_CreatesLoanWithDefaultValues()
    {
        // Arrange
        var book = new Book { Title = "Test Book", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own };
        _context.Books.Add(book);
        await _context.SaveChangesAsync();

        var loan = new Loan
        {
            BookId = book.Id,
            BorrowedTo = "Test Person",
            LoanDate = DateTime.UtcNow
        };

        // Act
        var result = await _repository.CreateAsync(loan);

        // Assert
        result.Should().NotBeNull();
        result.BorrowedTo.Should().Be("Test Person");
        result.IsReturned.Should().BeFalse();
        result.ReturnedDate.Should().BeNull();
    }

    [Fact]
    public async Task ReturnLoanAsync_SetsIsReturnedAndReturnedDate()
    {
        // Arrange
        var book = new Book { Title = "Test Book", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own };
        _context.Books.Add(book);
        await _context.SaveChangesAsync();

        var loan = new Loan
        {
            BookId = book.Id,
            BorrowedTo = "Test Person",
            LoanDate = DateTime.UtcNow.AddDays(-7),
            IsReturned = false
        };
        _context.Loans.Add(loan);
        await _context.SaveChangesAsync();

        // Act
        await _repository.ReturnLoanAsync(book.Id);

        // Assert
        var returnedLoan = await _context.Loans.FindAsync(loan.Id);
        returnedLoan.Should().NotBeNull();
        returnedLoan!.IsReturned.Should().BeTrue();
        returnedLoan.ReturnedDate.Should().NotBeNull();
        returnedLoan.ReturnedDate.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }
}
