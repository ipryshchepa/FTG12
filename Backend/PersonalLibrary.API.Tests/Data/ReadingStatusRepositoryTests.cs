using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using PersonalLibrary.API.Data;
using PersonalLibrary.API.Models;

namespace PersonalLibrary.API.Tests.Data;

/// <summary>
/// Tests for ReadingStatusRepository data access operations.
/// </summary>
public class ReadingStatusRepositoryTests : IDisposable
{
    private readonly LibraryDbContext _context;
    private readonly ReadingStatusRepository _repository;

    public ReadingStatusRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<LibraryDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new LibraryDbContext(options);
        _repository = new ReadingStatusRepository(_context);
    }

    [Fact]
    public async Task GetByBookIdAsync_WhenStatusExists_ReturnsReadingStatus()
    {
        // Arrange
        var book = new Book { Title = "Test Book", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own };
        _context.Books.Add(book);
        await _context.SaveChangesAsync();

        var status = new ReadingStatus
        {
            BookId = book.Id,
            Status = ReadingStatusEnum.Completed
        };
        _context.ReadingStatuses.Add(status);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetByBookIdAsync(book.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Status.Should().Be(ReadingStatusEnum.Completed);
    }

    [Fact]
    public async Task GetByBookIdAsync_WhenStatusDoesNotExist_ReturnsNull()
    {
        // Act
        var result = await _repository.GetByBookIdAsync(Guid.NewGuid());

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task CreateAsync_CreatesReadingStatusWithValidEnum()
    {
        // Arrange
        var book = new Book { Title = "Test Book", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own };
        _context.Books.Add(book);
        await _context.SaveChangesAsync();

        var status = new ReadingStatus
        {
            BookId = book.Id,
            Status = ReadingStatusEnum.Backlog
        };

        // Act
        var result = await _repository.CreateAsync(status);

        // Assert
        result.Should().NotBeNull();
        result.Status.Should().Be(ReadingStatusEnum.Backlog);

        var savedStatus = await _context.ReadingStatuses.FindAsync(result.Id);
        savedStatus.Should().NotBeNull();
    }

    [Fact]
    public async Task UpdateAsync_UpdatesReadingStatus()
    {
        // Arrange
        var book = new Book { Title = "Test Book", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own };
        _context.Books.Add(book);
        await _context.SaveChangesAsync();

        var status = new ReadingStatus
        {
            BookId = book.Id,
            Status = ReadingStatusEnum.Backlog
        };
        _context.ReadingStatuses.Add(status);
        await _context.SaveChangesAsync();
        var statusId = status.Id;

        // Clear change tracker to simulate separate request context
        _context.ChangeTracker.Clear();

        // Act - Create a new entity instance with updated properties (mimics service behavior)
        var updatedStatus = new ReadingStatus
        {
            Id = statusId,
            BookId = book.Id,
            Status = ReadingStatusEnum.Completed
        };
        await _repository.UpdateAsync(updatedStatus);

        // Assert
        var result = await _context.ReadingStatuses.FindAsync(statusId);
        result.Should().NotBeNull();
        result!.Status.Should().Be(ReadingStatusEnum.Completed);
    }

    [Fact]
    public async Task DeleteByBookIdAsync_DeletesReadingStatus()
    {
        // Arrange
        var book = new Book { Title = "Test Book", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own };
        _context.Books.Add(book);
        await _context.SaveChangesAsync();

        var status = new ReadingStatus { BookId = book.Id, Status = ReadingStatusEnum.Abandoned };
        _context.ReadingStatuses.Add(status);
        await _context.SaveChangesAsync();

        // Act
        await _repository.DeleteByBookIdAsync(book.Id);

        // Assert
        var deletedStatus = await _context.ReadingStatuses.FirstOrDefaultAsync(s => s.BookId == book.Id);
        deletedStatus.Should().BeNull();
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }
}
