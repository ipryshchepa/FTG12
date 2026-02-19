using FluentAssertions;
using Moq;
using PersonalLibrary.API.Data;
using PersonalLibrary.API.DTOs;
using PersonalLibrary.API.Exceptions;
using PersonalLibrary.API.Models;
using PersonalLibrary.API.Services;

namespace PersonalLibrary.API.Tests.Services;

/// <summary>
/// Tests for LoanService business logic operations.
/// </summary>
public class LoanServiceTests
{
    private readonly Mock<ILoanRepository> _mockLoanRepository;
    private readonly Mock<IBookRepository> _mockBookRepository;
    private readonly LoanService _service;

    public LoanServiceTests()
    {
        _mockLoanRepository = new Mock<ILoanRepository>();
        _mockBookRepository = new Mock<IBookRepository>();
        _service = new LoanService(_mockLoanRepository.Object, _mockBookRepository.Object);
    }

    [Fact]
    public async Task CreateLoanAsync_WhenBookDoesNotExist_ThrowsNotFoundException()
    {
        // Arrange
        var bookId = Guid.NewGuid();
        var loanDto = new LoanDto { BorrowedTo = "John Doe" };
        _mockBookRepository.Setup(r => r.GetByIdAsync(bookId)).ReturnsAsync((BookDetailsDto?)null);

        // Act
        Func<Task> act = async () => await _service.CreateLoanAsync(bookId, loanDto);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage($"Book with ID {bookId} not found");
    }

    [Fact]
    public async Task CreateLoanAsync_WhenBookAlreadyLoaned_ThrowsBusinessRuleException()
    {
        // Arrange
        var bookId = Guid.NewGuid();
        var loanDto = new LoanDto { BorrowedTo = "John Doe" };
        
        var existingBook = new BookDetailsDto { Id = bookId, Title = "Test", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own };
        var activeLoan = new Loan { Id = Guid.NewGuid(), BookId = bookId, BorrowedTo = "Jane Doe", IsReturned = false };

        _mockBookRepository.Setup(r => r.GetByIdAsync(bookId)).ReturnsAsync(existingBook);
        _mockLoanRepository.Setup(r => r.GetActiveLoanByBookIdAsync(bookId)).ReturnsAsync(activeLoan);

        // Act
        Func<Task> act = async () => await _service.CreateLoanAsync(bookId, loanDto);

        // Assert
        await act.Should().ThrowAsync<BusinessRuleException>()
            .WithMessage($"Book with ID {bookId} is already loaned to Jane Doe");
        _mockLoanRepository.Verify(r => r.CreateAsync(It.IsAny<Loan>()), Times.Never);
    }

    [Fact]
    public async Task CreateLoanAsync_WhenBookNotLoaned_CreatesLoan()
    {
        // Arrange
        var bookId = Guid.NewGuid();
        var loanDto = new LoanDto { BorrowedTo = "John Doe" };
        
        var existingBook = new BookDetailsDto { Id = bookId, Title = "Test", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own };

        _mockBookRepository.Setup(r => r.GetByIdAsync(bookId)).ReturnsAsync(existingBook);
        _mockLoanRepository.Setup(r => r.GetActiveLoanByBookIdAsync(bookId)).ReturnsAsync((Loan?)null);
        _mockLoanRepository.Setup(r => r.CreateAsync(It.IsAny<Loan>())).ReturnsAsync(new Loan 
        { 
            Id = Guid.NewGuid(), 
            BookId = bookId, 
            BorrowedTo = "John Doe",
            LoanDate = DateTime.UtcNow,
            IsReturned = false
        });

        // Act
        await _service.CreateLoanAsync(bookId, loanDto);

        // Assert
        _mockLoanRepository.Verify(r => r.CreateAsync(It.Is<Loan>(loan => 
            loan.BookId == bookId && loan.BorrowedTo == "John Doe")), Times.Once);
    }

    [Fact]
    public async Task GetLoanHistoryAsync_ReturnsAllLoansForBook()
    {
        // Arrange
        var bookId = Guid.NewGuid();
        var existingBook = new BookDetailsDto { Id = bookId, Title = "Test", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own };
        var expectedLoans = new List<Loan>
        {
            new() { Id = Guid.NewGuid(), BookId = bookId, BorrowedTo = "Person 1", IsReturned = true },
            new() { Id = Guid.NewGuid(), BookId = bookId, BorrowedTo = "Person 2", IsReturned = false }
        };

        _mockBookRepository.Setup(r => r.GetByIdAsync(bookId)).ReturnsAsync(existingBook);
        _mockLoanRepository.Setup(r => r.GetLoanHistoryByBookIdAsync(bookId)).ReturnsAsync(expectedLoans);

        // Act
        var result = await _service.GetLoanHistoryAsync(bookId);

        // Assert
        result.Should().HaveCount(2);
        result.Should().BeEquivalentTo(expectedLoans);
        _mockLoanRepository.Verify(r => r.GetLoanHistoryByBookIdAsync(bookId), Times.Once);
    }

    [Fact]
    public async Task ReturnBookAsync_WhenActiveLoanExists_ReturnsBook()
    {
        // Arrange
        var bookId = Guid.NewGuid();
        var activeLoan = new Loan { Id = Guid.NewGuid(), BookId = bookId, BorrowedTo = "John Doe", IsReturned = false };

        _mockLoanRepository.Setup(r => r.GetActiveLoanByBookIdAsync(bookId)).ReturnsAsync(activeLoan);
        _mockLoanRepository.Setup(r => r.ReturnLoanAsync(bookId)).Returns(Task.CompletedTask);

        // Act
        await _service.ReturnBookAsync(bookId);

        // Assert
        _mockLoanRepository.Verify(r => r.ReturnLoanAsync(bookId), Times.Once);
    }

    [Fact]
    public async Task ReturnBookAsync_WhenNoActiveLoan_ThrowsNotFoundException()
    {
        // Arrange
        var bookId = Guid.NewGuid();
        _mockLoanRepository.Setup(r => r.GetActiveLoanByBookIdAsync(bookId)).ReturnsAsync((Loan?)null);

        // Act
        Func<Task> act = async () => await _service.ReturnBookAsync(bookId);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage($"No active loan found for book with ID {bookId}");
        _mockLoanRepository.Verify(r => r.ReturnLoanAsync(It.IsAny<Guid>()), Times.Never);
    }

    [Fact]
    public async Task GetActiveLoanedBooksAsync_ReturnsOnlyActiveLoans()
    {
        // Arrange
        var activeLoans = new List<Loan>
        {
            new() { Id = Guid.NewGuid(), BookId = Guid.NewGuid(), BorrowedTo = "Person 1", IsReturned = false },
            new() { Id = Guid.NewGuid(), BookId = Guid.NewGuid(), BorrowedTo = "Person 2", IsReturned = false }
        };

        _mockLoanRepository.Setup(r => r.GetAllActiveLoansAsync()).ReturnsAsync(activeLoans);

        // Act
        var result = await _service.GetActiveLoanedBooksAsync();

        // Assert
        result.Should().HaveCount(2);
        result.Should().OnlyContain(loan => !loan.IsReturned);
        _mockLoanRepository.Verify(r => r.GetAllActiveLoansAsync(), Times.Once);
    }
}
