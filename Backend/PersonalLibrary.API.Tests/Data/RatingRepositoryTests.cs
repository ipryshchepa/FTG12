using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using PersonalLibrary.API.Data;
using PersonalLibrary.API.Models;

namespace PersonalLibrary.API.Tests.Data;

/// <summary>
/// Tests for RatingRepository data access operations.
/// </summary>
public class RatingRepositoryTests : IDisposable
{
    private readonly LibraryDbContext _context;
    private readonly RatingRepository _repository;

    public RatingRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<LibraryDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new LibraryDbContext(options);
        _repository = new RatingRepository(_context);
    }

    [Fact]
    public async Task GetByBookIdAsync_WhenRatingExists_ReturnsRating()
    {
        // Arrange
        var book = new Book { Title = "Test Book", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own };
        _context.Books.Add(book);
        await _context.SaveChangesAsync();

        var rating = new Rating
        {
            BookId = book.Id,
            Score = 7,
            Notes = "Good book"
        };
        _context.Ratings.Add(rating);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetByBookIdAsync(book.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Score.Should().Be(7);
        result.Notes.Should().Be("Good book");
    }

    [Fact]
    public async Task GetByBookIdAsync_WhenRatingDoesNotExist_ReturnsNull()
    {
        // Act
        var result = await _repository.GetByBookIdAsync(Guid.NewGuid());

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task CreateAsync_CreatesRatingWithValidScore()
    {
        // Arrange
        var book = new Book { Title = "Test Book", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own };
        _context.Books.Add(book);
        await  _context.SaveChangesAsync();

        var rating = new Rating
        {
            BookId = book.Id,
            Score = 9,
            Notes = "Excellent"
        };

        // Act
        var result = await _repository.CreateAsync(rating);

        // Assert
        result.Should().NotBeNull();
        result.Score.Should().Be(9);
        result.Notes.Should().Be("Excellent");

        var savedRating = await _context.Ratings.FindAsync(result.Id);
        savedRating.Should().NotBeNull();
    }

    [Fact]
    public async Task UpdateAsync_UpdatesRatingScoreAndNotes()
    {
        // Arrange
        var book = new Book { Title = "Test Book", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own };
        _context.Books.Add(book);
        await _context.SaveChangesAsync();

        var rating = new Rating
        {
            BookId = book.Id,
            Score = 5,
            Notes = "Average"
        };
        _context.Ratings.Add(rating);
        await _context.SaveChangesAsync();
        var ratingId = rating.Id;

        // Clear change tracker to simulate separate request context
        _context.ChangeTracker.Clear();

        // Act - Create a new entity instance with updated properties (mimics service behavior)
        var updatedRating = new Rating
        {
            Id = ratingId,
            BookId = book.Id,
            Score = 8,
            Notes = "Better than expected"
        };
        await _repository.UpdateAsync(updatedRating);

        // Assert
        var result = await _context.Ratings.FindAsync(ratingId);
        result.Should().NotBeNull();
        result!.Score.Should().Be(8);
        result.Notes.Should().Be("Better than expected");
    }

    [Fact]
    public async Task DeleteByBookIdAsync_DeletesRating()
    {
        // Arrange
        var book = new Book { Title = "Test Book", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own };
        _context.Books.Add(book);
        await _context.SaveChangesAsync();

        var rating = new Rating { BookId = book.Id, Score = 6 };
        _context.Ratings.Add(rating);
        await _context.SaveChangesAsync();

        // Act
        await _repository.DeleteByBookIdAsync(book.Id);

        // Assert
        var deletedRating = await _context.Ratings.FirstOrDefaultAsync(r => r.BookId == book.Id);
        deletedRating.Should().BeNull();
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }
}
