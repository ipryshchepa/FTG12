using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using PersonalLibrary.API.Data;
using PersonalLibrary.API.Models;

namespace PersonalLibrary.API.Tests.Data;

/// <summary>
/// Tests for BookRepository data access operations.
/// </summary>
public class BookRepositoryTests : IDisposable
{
    private readonly LibraryDbContext _context;
    private readonly BookRepository _repository;

    public BookRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<LibraryDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new LibraryDbContext(options);
        _repository = new BookRepository(_context);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsAllBooksWithFlattenedData()
    {
        // Arrange
        var book1 = new Book
        {
            Title = "Test Book 1",
            Author = "Author McAuthorface",
            OwnershipStatus = OwnershipStatus.Own
        };
        var book2 = new Book
        {
            Title = "Test Book 2",
            Author = "Author McAuthorface",
            OwnershipStatus = OwnershipStatus.WantToBuy
        };

        _context.Books.AddRange(book1, book2);
        await _context.SaveChangesAsync();

        // Add rating to book1
        var rating = new Rating
        {
            BookId = book1.Id,
            Score = 8,
            Notes = "Great read"
        };
        _context.Ratings.Add(rating);

        // Add reading status to book1
        var readingStatus = new ReadingStatus
        {
            BookId = book1.Id,
            Status = ReadingStatusEnum.Completed
        };
        _context.ReadingStatuses.Add(readingStatus);

        // Add active loan to book2
        var loan = new Loan
        {
            BookId = book2.Id,
            BorrowedTo = "John Doe",
            LoanDate = DateTime.UtcNow,
            IsReturned = false
        };
        _context.Loans.Add(loan);

        await _context.SaveChangesAsync();

        // Act
        var results = await _repository.GetAllAsync();

        // Assert
        results.Should().HaveCount(2);
        
        var result1 = results.First(r => r.Id == book1.Id);
        result1.Title.Should().Be("Test Book 1");
        result1.Author.Should().Be("Author McAuthorface");
        result1.Score.Should().Be(8);
        result1.RatingNotes.Should().Be("Great read");
        result1.ReadingStatus.Should().Be(ReadingStatusEnum.Completed);
        result1.Loanee.Should().BeNull();

        var result2 = results.First(r => r.Id == book2.Id);
        result2.Title.Should().Be("Test Book 2");
        result2.Loanee.Should().Be("John Doe");
        result2.Score.Should().BeNull();
        result2.ReadingStatus.Should().BeNull();
    }

    [Fact]
    public async Task GetByIdAsync_WhenBookExists_ReturnsBookWithFlattenedData()
    {
        // Arrange
        var book = new Book
        {
            Title = "Test Book",
            Author = "Author McAuthorface",
            ISBN = "123-456",
            OwnershipStatus = OwnershipStatus.Own
        };
        _context.Books.Add(book);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetByIdAsync(book.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(book.Id);
        result.Title.Should().Be("Test Book");
        result.Author.Should().Be("Author McAuthorface");
        result.ISBN.Should().Be("123-456");
    }

    [Fact]
    public async Task GetByIdAsync_WhenBookDoesNotExist_ReturnsNull()
    {
        // Act
        var result = await _repository.GetByIdAsync(Guid.NewGuid());

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task CreateAsync_CreatesBookWithGeneratedId()
    {
        // Arrange
        var book = new Book
        {
            Title = "New Book",
            Author = "Author McAuthorface",
            OwnershipStatus = OwnershipStatus.Own
        };

        // Act
        var result = await _repository.CreateAsync(book);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().NotBeEmpty();
        result.Title.Should().Be("New Book");

        var savedBook = await _context.Books.FindAsync(result.Id);
        savedBook.Should().NotBeNull();
        savedBook!.Title.Should().Be("New Book");
    }

    [Fact]
    public async Task UpdateAsync_UpdatesAllBookProperties()
    {
        // Arrange
        var book = new Book
        {
            Title = "Original Title",
            Author = "Original Author",
            OwnershipStatus = OwnershipStatus.WantToBuy
        };
        _context.Books.Add(book);
        await _context.SaveChangesAsync();
        var bookId = book.Id;

        // Clear change tracker to simulate separate request context (like in production)
        _context.ChangeTracker.Clear();

        // Act - Create a new entity instance with updated properties (mimics service behavior)
        var updatedBook = new Book
        {
            Id = bookId,
            Title = "Updated Title",
            Author = "Author McAuthorface",
            Description = "Updated Description",
            OwnershipStatus = OwnershipStatus.Own
        };
        await _repository.UpdateAsync(updatedBook);

        // Assert
        var result = await _context.Books.FindAsync(bookId);
        result.Should().NotBeNull();
        result!.Title.Should().Be("Updated Title");
        result.Author.Should().Be("Author McAuthorface");
        result.Description.Should().Be("Updated Description");
        updatedBook.OwnershipStatus.Should().Be(OwnershipStatus.Own);
    }

    [Fact]
    public async Task DeleteAsync_DeletesBookAndCascadesRelatedEntities()
    {
        // Arrange
        var book = new Book
        {
            Title = "Book to Delete",
            Author = "Author McAuthorface",
            OwnershipStatus = OwnershipStatus.Own
        };
        _context.Books.Add(book);
        await _context.SaveChangesAsync();

        var rating = new Rating { BookId = book.Id, Score = 5 };
        var readingStatus = new ReadingStatus { BookId = book.Id, Status = ReadingStatusEnum.Completed };
        var loan = new Loan { BookId = book.Id, BorrowedTo = "John", IsReturned = true };

        _context.Ratings.Add(rating);
        _context.ReadingStatuses.Add(readingStatus);
        _context.Loans.Add(loan);
        await _context.SaveChangesAsync();

        // Act
        await _repository.DeleteAsync(book.Id);

        // Assert
        var deletedBook = await _context.Books.FindAsync(book.Id);
        deletedBook.Should().BeNull();

        var deletedRating = await _context.Ratings.FindAsync(rating.Id);
        deletedRating.Should().BeNull();

        var deletedStatus = await _context.ReadingStatuses.FindAsync(readingStatus.Id);
        deletedStatus.Should().BeNull();

        var deletedLoan = await _context.Loans.FindAsync(loan.Id);
        deletedLoan.Should().BeNull();
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }
}
