using FluentAssertions;
using Moq;
using PersonalLibrary.API.Data;
using PersonalLibrary.API.DTOs;
using PersonalLibrary.API.Exceptions;
using PersonalLibrary.API.Models;
using PersonalLibrary.API.Services;

namespace PersonalLibrary.API.Tests.Services;

/// <summary>
/// Tests for RatingService business logic operations.
/// </summary>
public class RatingServiceTests
{
    private readonly Mock<IRatingRepository> _mockRatingRepository;
    private readonly Mock<IBookRepository> _mockBookRepository;
    private readonly RatingService _service;

    public RatingServiceTests()
    {
        _mockRatingRepository = new Mock<IRatingRepository>();
        _mockBookRepository = new Mock<IBookRepository>();
        _service = new RatingService(_mockRatingRepository.Object, _mockBookRepository.Object);
    }

    [Fact]
    public async Task CreateOrUpdateRatingAsync_WhenBookDoesNotExist_ThrowsNotFoundException()
    {
        // Arrange
        var bookId = Guid.NewGuid();
        var ratingDto = new RatingDto { Score = 8, Notes = "Great" };
        _mockBookRepository.Setup(r => r.GetByIdAsync(bookId)).ReturnsAsync((BookDetailsDto?)null);

        // Act
        Func<Task> act = async () => await _service.CreateOrUpdateRatingAsync(bookId, ratingDto);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage($"Book with ID {bookId} not found");
    }

    [Fact]
    public async Task CreateOrUpdateRatingAsync_WhenRatingExists_UpdatesRating()
    {
        // Arrange
        var bookId = Guid.NewGuid();
        var ratingDto = new RatingDto { Score = 9, Notes = "Excellent" };
        
        var existingBook = new BookDetailsDto { Id = bookId, Title = "Test", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own };
        var existingRating = new Rating { Id = Guid.NewGuid(), BookId = bookId, Score = 7, Notes = "Good" };

        _mockBookRepository.Setup(r => r.GetByIdAsync(bookId)).ReturnsAsync(existingBook);
        _mockRatingRepository.Setup(r => r.GetByBookIdAsync(bookId)).ReturnsAsync(existingRating);
        _mockRatingRepository.Setup(r => r.UpdateAsync(It.IsAny<Rating>())).Returns(Task.CompletedTask);

        // Act
        await _service.CreateOrUpdateRatingAsync(bookId, ratingDto);

        // Assert
        _mockRatingRepository.Verify(r => r.UpdateAsync(It.Is<Rating>(rating => 
            rating.Score == 9 && rating.Notes == "Excellent")), Times.Once);
        _mockRatingRepository.Verify(r => r.CreateAsync(It.IsAny<Rating>()), Times.Never);
    }

    [Fact]
    public async Task CreateOrUpdateRatingAsync_WhenRatingDoesNotExist_CreatesRating()
    {
        // Arrange
        var bookId = Guid.NewGuid();
        var ratingDto = new RatingDto { Score = 8, Notes = "Very good" };
        
        var existingBook = new BookDetailsDto { Id = bookId, Title = "Test", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own };

        _mockBookRepository.Setup(r => r.GetByIdAsync(bookId)).ReturnsAsync(existingBook);
        _mockRatingRepository.Setup(r => r.GetByBookIdAsync(bookId)).ReturnsAsync((Rating?)null);
        
        var createdRating = new Rating { Id = Guid.NewGuid(), BookId = bookId, Score = 8, Notes = "Very good" };
        _mockRatingRepository.Setup(r => r.CreateAsync(It.IsAny<Rating>())).ReturnsAsync(createdRating);

        // Act
        await _service.CreateOrUpdateRatingAsync(bookId, ratingDto);

        // Assert
        _mockRatingRepository.Verify(r => r.CreateAsync(It.Is<Rating>(rating => 
            rating.BookId == bookId && rating.Score == 8)), Times.Once);
        _mockRatingRepository.Verify(r => r.UpdateAsync(It.IsAny<Rating>()), Times.Never);
    }

    [Fact]
    public async Task DeleteRatingAsync_WhenBookExists_DeletesRating()
    {
        // Arrange
        var bookId = Guid.NewGuid();
        var existingBook = new BookDetailsDto { Id = bookId, Title = "Test", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own };
        var existingRating = new Rating { Id = Guid.NewGuid(), BookId = bookId, Score = 5 };

        _mockBookRepository.Setup(r => r.GetByIdAsync(bookId)).ReturnsAsync(existingBook);
        _mockRatingRepository.Setup(r => r.GetByBookIdAsync(bookId)).ReturnsAsync(existingRating);
        _mockRatingRepository.Setup(r => r.DeleteByBookIdAsync(bookId)).Returns(Task.CompletedTask);

        // Act
        await _service.DeleteRatingAsync(bookId);

        // Assert
        _mockRatingRepository.Verify(r => r.DeleteByBookIdAsync(bookId), Times.Once);
    }

    [Fact]
    public async Task DeleteRatingAsync_WhenBookDoesNotExist_ThrowsNotFoundException()
    {
        // Arrange
        var bookId = Guid.NewGuid();
        _mockBookRepository.Setup(r => r.GetByIdAsync(bookId)).ReturnsAsync((BookDetailsDto?)null);

        // Act
        Func<Task> act = async () => await _service.DeleteRatingAsync(bookId);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage($"Book with ID {bookId} not found");
        _mockRatingRepository.Verify(r => r.DeleteByBookIdAsync(It.IsAny<Guid>()), Times.Never);
    }
}
