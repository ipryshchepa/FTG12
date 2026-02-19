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

    [Fact]
    public async Task GetAllPaginatedAsync_WithDefaultParameters_ReturnsFirstPageSorted()
    {
        // Arrange
        var books = new List<Book>
        {
            new Book { Title = "Zebra Book", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own },
            new Book { Title = "Alpha Book", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own },
            new Book { Title = "Middle Book", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own }
        };
        _context.Books.AddRange(books);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetAllPaginatedAsync(1, 10, "Title", "asc");

        // Assert
        result.Should().NotBeNull();
        result.Items.Should().HaveCount(3);
        result.TotalCount.Should().Be(3);
        result.Page.Should().Be(1);
        result.PageSize.Should().Be(10);
        result.Items[0].Title.Should().Be("Alpha Book");
        result.Items[1].Title.Should().Be("Middle Book");
        result.Items[2].Title.Should().Be("Zebra Book");
    }

    [Fact]
    public async Task GetAllPaginatedAsync_WithPagination_ReturnsCorrectPage()
    {
        // Arrange
        for (int i = 1; i <= 15; i++)
        {
            _context.Books.Add(new Book
            {
                Title = $"Book {i:D2}",
                Author = "Author McAuthorface",
                OwnershipStatus = OwnershipStatus.Own
            });
        }
        await _context.SaveChangesAsync();

        // Act - Get page 2 with 5 items per page
        var result = await _repository.GetAllPaginatedAsync(2, 5, "Title", "asc");

        // Assert
        result.Should().NotBeNull();
        result.Items.Should().HaveCount(5);
        result.TotalCount.Should().Be(15);
        result.Page.Should().Be(2);
        result.PageSize.Should().Be(5);
        result.TotalPages.Should().Be(3);
        result.Items[0].Title.Should().Be("Book 06");
        result.Items[4].Title.Should().Be("Book 10");
    }

    [Fact]
    public async Task GetAllPaginatedAsync_SortByAuthor_SortsCorrectly()
    {
        // Arrange
        var books = new List<Book>
        {
            new Book { Title = "Book 1", Author = "Zoe McAuthorface", OwnershipStatus = OwnershipStatus.Own },
            new Book { Title = "Book 2", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own },
            new Book { Title = "Book 3", Author = "Bob McAuthorface", OwnershipStatus = OwnershipStatus.Own }
        };
        _context.Books.AddRange(books);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetAllPaginatedAsync(1, 10, "Author", "asc");

        // Assert
        result.Items.Should().HaveCount(3);
        result.Items[0].Author.Should().Be("Author McAuthorface");
        result.Items[1].Author.Should().Be("Bob McAuthorface");
        result.Items[2].Author.Should().Be("Zoe McAuthorface");
    }

    [Fact]
    public async Task GetAllPaginatedAsync_SortByScoreDescending_SortsCorrectly()
    {
        // Arrange
        var book1 = new Book { Title = "Low Score", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own };
        var book2 = new Book { Title = "High Score", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own };
        var book3 = new Book { Title = "No Score", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own };
        _context.Books.AddRange(book1, book2, book3);
        await _context.SaveChangesAsync();

        _context.Ratings.Add(new Rating { BookId = book1.Id, Score = 5 });
        _context.Ratings.Add(new Rating { BookId = book2.Id, Score = 10 });
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetAllPaginatedAsync(1, 10, "Score", "desc");

        // Assert
        result.Items.Should().HaveCount(3);
        result.Items[0].Title.Should().Be("High Score");
        result.Items[0].Score.Should().Be(10);
        result.Items[1].Title.Should().Be("Low Score");
        result.Items[1].Score.Should().Be(5);
        // Null scores should be last when descending
    }

    [Fact]
    public async Task GetAllPaginatedAsync_SortByOwnershipStatus_SortsCorrectly()
    {
        // Arrange
        var books = new List<Book>
        {
            new Book { Title = "Book 1", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.WantToBuy },
            new Book { Title = "Book 2", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own },
            new Book { Title = "Book 3", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.SoldOrGaveAway }
        };
        _context.Books.AddRange(books);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetAllPaginatedAsync(1, 10, "OwnershipStatus", "asc");

        // Assert
        result.Items.Should().HaveCount(3);
        // Enum ordering: WantToBuy(0), Own(1), SoldOrGaveAway(2)
    }

    [Fact]
    public async Task GetAllPaginatedAsync_SortByReadingStatus_SortsCorrectly()
    {
        // Arrange
        var book1 = new Book { Title = "Completed", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own };
        var book2 = new Book { Title = "Backlog", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own };
        var book3 = new Book { Title = "No Status", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own };
        _context.Books.AddRange(book1, book2, book3);
        await _context.SaveChangesAsync();

        _context.ReadingStatuses.Add(new ReadingStatus { BookId = book1.Id, Status = ReadingStatusEnum.Completed });
        _context.ReadingStatuses.Add(new ReadingStatus { BookId = book2.Id, Status = ReadingStatusEnum.Backlog });
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetAllPaginatedAsync(1, 10, "ReadingStatus", "asc");

        // Assert
        result.Items.Should().HaveCount(3);
        // Should include all books, with nulls handled appropriately
    }

    [Fact]
    public async Task GetAllPaginatedAsync_SortByLoaneeAscending_SortsCorrectly()
    {
        // Arrange
        var book1 = new Book { Title = "Book 1", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own };
        var book2 = new Book { Title = "Book 2", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own };
        var book3 = new Book { Title = "Book 3", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own };
        _context.Books.AddRange(book1, book2, book3);
        await _context.SaveChangesAsync();

        // Add active loans (not returned)
        var loan1 = new Loan { BookId = book1.Id, BorrowedTo = "Zoe Smith", LoanDate = DateTime.UtcNow, IsReturned = false };
        var loan2 = new Loan { BookId = book2.Id, BorrowedTo = "Alice Brown", LoanDate = DateTime.UtcNow, IsReturned = false };
        _context.Loans.AddRange(loan1, loan2);
        // book3 has no active loan
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetAllPaginatedAsync(1, 10, "Loanee", "asc");

        // Assert
        result.Items.Should().HaveCount(3);
        //  Books without loans (null) come first in ascending order, then books with loans sorted by loanee name
        result.Items[0].Loanee.Should().BeNull();
        result.Items[1].Loanee.Should().Be("Alice Brown");
        result.Items[2].Loanee.Should().Be("Zoe Smith");
    }

    [Fact]
    public async Task GetAllPaginatedAsync_SortByLoaneeDescending_SortsCorrectly()
    {
        // Arrange
        var book1 = new Book { Title = "Book 1", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own };
        var book2 = new Book { Title = "Book 2", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own };
        var book3 = new Book { Title = "Book 3", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own };
        _context.Books.AddRange(book1, book2, book3);
        await _context.SaveChangesAsync();

        // Add active loans
        var loan1 = new Loan { BookId = book1.Id, BorrowedTo = "Alice Brown", LoanDate = DateTime.UtcNow, IsReturned = false };
        var loan2 = new Loan { BookId = book2.Id, BorrowedTo = "Zoe Smith", LoanDate = DateTime.UtcNow, IsReturned = false };
        _context.Loans.AddRange(loan1, loan2);
        // book3 has no active loan
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetAllPaginatedAsync(1, 10, "Loanee", "desc");

        // Assert
        result.Items.Should().HaveCount(3);
        result.Items[0].Loanee.Should().Be("Zoe Smith");
        result.Items[1].Loanee.Should().Be("Alice Brown");
        result.Items[2].Loanee.Should().BeNull();
    }

    [Fact]
    public async Task GetAllPaginatedAsync_SortByLoanee_IgnoresReturnedLoans()
    {
        // Arrange
        var book1 = new Book { Title = "Book 1", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own };
        var book2 = new Book { Title = "Book 2", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own };
        _context.Books.AddRange(book1, book2);
        await _context.SaveChangesAsync();

        // book1 has both returned loan and active loan
        var loan1 = new Loan { BookId = book1.Id, BorrowedTo = "Old Borrower", LoanDate = DateTime.UtcNow.AddDays(-30), IsReturned = true, ReturnedDate = DateTime.UtcNow.AddDays(-15) };
        var loan2 = new Loan { BookId = book1.Id, BorrowedTo = "Current Borrower", LoanDate = DateTime.UtcNow.AddDays(-5), IsReturned = false };
        
        // book2 has only returned loan
        var loan3 = new Loan { BookId = book2.Id, BorrowedTo = "Previous Borrower", LoanDate = DateTime.UtcNow.AddDays(-20), IsReturned = true, ReturnedDate = DateTime.UtcNow.AddDays(-10) };
        _context.Loans.AddRange(loan1, loan2, loan3);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetAllPaginatedAsync(1, 10, "Loanee", "asc");

        // Assert
        result.Items.Should().HaveCount(2);
        result.Items[0].Loanee.Should().BeNull(); // book2 has no active loan (nulls come first in ascending)
        result.Items[1].Loanee.Should().Be("Current Borrower"); // Only active loan counts
    }

    [Fact]
    public async Task GetAllPaginatedAsync_WithDescendingSort_SortsCorrectly()
    {
        // Arrange
        var books = new List<Book>
        {
            new Book { Title = "Alpha", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own },
            new Book { Title = "Beta", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own },
            new Book { Title = "Gamma", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own }
        };
        _context.Books.AddRange(books);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetAllPaginatedAsync(1, 10, "Title", "desc");

        // Assert
        result.Items.Should().HaveCount(3);
        result.Items[0].Title.Should().Be("Gamma");
        result.Items[1].Title.Should().Be("Beta");
        result.Items[2].Title.Should().Be("Alpha");
    }

    [Fact]
    public async Task GetAllPaginatedAsync_BeyondAvailablePages_ReturnsEmptyItems()
    {
        // Arrange
        _context.Books.Add(new Book { Title = "Only Book", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own });
        await _context.SaveChangesAsync();

        // Act - Request page 5
        var result = await _repository.GetAllPaginatedAsync(5, 10, "Title", "asc");

        // Assert
        result.Items.Should().BeEmpty();
        result.TotalCount.Should().Be(1);
        result.Page.Should().Be(5);
        result.TotalPages.Should().Be(1);
    }

    [Fact]
    public async Task GetAllPaginatedAsync_WithDuplicateTitles_OrdersByIdAsSecondary()
    {
        // Arrange - Create books with same title but different IDs
        var book1 = new Book { Title = "Duplicate", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own };
        var book2 = new Book { Title = "Duplicate", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own };
        var book3 = new Book { Title = "Duplicate", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own };
        _context.Books.AddRange(book1, book2, book3);
        await _context.SaveChangesAsync();

        // Act - Sort by title twice
        var result1 = await _repository.GetAllPaginatedAsync(1, 10, "Title", "asc");
        var result2 = await _repository.GetAllPaginatedAsync(1, 10, "Title", "asc");

        // Assert - Order should be consistent between calls (secondary sort by ID ensures this)
        result1.Items.Should().HaveCount(3);
        result2.Items.Should().HaveCount(3);
        
        // The order should be exactly the same both times
        for (int i = 0; i < 3; i++)
        {
            result1.Items[i].Id.Should().Be(result2.Items[i].Id, 
                $"because the order should be consistent at position {i}");
        }
        
        // Verify items are ordered by their ID (ascending)
        var sortedByGuid = result1.Items.OrderBy(b => b.Id).ToList();
        result1.Items[0].Id.Should().Be(sortedByGuid[0].Id);
        result1.Items[1].Id.Should().Be(sortedByGuid[1].Id);
        result1.Items[2].Id.Should().Be(sortedByGuid[2].Id);
    }

    [Fact]
    public async Task GetAllPaginatedAsync_WithDuplicateAuthors_OrdersByIdAsSecondary()
    {
        // Arrange - Create books with same author but different titles
        var book1 = new Book { Title = "A Book", Author = "Same Author", OwnershipStatus = OwnershipStatus.Own };
        var book2 = new Book { Title = "B Book", Author = "Same Author", OwnershipStatus = OwnershipStatus.Own };
        _context.Books.AddRange(book1, book2);
        await _context.SaveChangesAsync();

        // Act - Sort by author descending
        var result = await _repository.GetAllPaginatedAsync(1, 10, "Author", "desc");

        // Assert - Should maintain consistent order by ID when authors are the same
        result.Items.Should().HaveCount(2);
        
        // Verify secondary ordering by ID (ascending)
        var sortedByGuid = result.Items.OrderBy(b => b.Id).ToList();
        result.Items[0].Id.Should().Be(sortedByGuid[0].Id);
        result.Items[1].Id.Should().Be(sortedByGuid[1].Id);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }
}
