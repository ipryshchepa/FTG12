using FluentAssertions;
using Moq;
using PersonalLibrary.API.Data;
using PersonalLibrary.API.DTOs;
using PersonalLibrary.API.Exceptions;
using PersonalLibrary.API.Models;
using PersonalLibrary.API.Services;

namespace PersonalLibrary.API.Tests.Services;

/// <summary>
/// Tests for ReadingStatusService business logic operations.
/// </summary>
public class ReadingStatusServiceTests
{
    private readonly Mock<IReadingStatusRepository> _mockReadingStatusRepository;
    private readonly Mock<IBookRepository> _mockBookRepository;
    private readonly ReadingStatusService _service;

    public ReadingStatusServiceTests()
    {
        _mockReadingStatusRepository = new Mock<IReadingStatusRepository>();
        _mockBookRepository = new Mock<IBookRepository>();
        _service = new ReadingStatusService(_mockReadingStatusRepository.Object, _mockBookRepository.Object);
    }

    [Fact]
    public async Task CreateOrUpdateReadingStatusAsync_WhenBookDoesNotExist_ThrowsNotFoundException()
    {
        // Arrange
        var bookId = Guid.NewGuid();
        var statusDto = new ReadingStatusDto { Status = ReadingStatusEnum.Completed };
        _mockBookRepository.Setup(r => r.GetByIdAsync(bookId)).ReturnsAsync((BookDetailsDto?)null);

        // Act
        Func<Task> act = async () => await _service.CreateOrUpdateReadingStatusAsync(bookId, statusDto);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage($"Book with ID {bookId} not found");
    }

    [Fact]
    public async Task CreateOrUpdateReadingStatusAsync_WhenStatusExists_UpdatesStatus()
    {
        // Arrange
        var bookId = Guid.NewGuid();
        var statusDto = new ReadingStatusDto { Status = ReadingStatusEnum.Completed };
        
        var existingBook = new BookDetailsDto { Id = bookId, Title = "Test", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own };
        var existingStatus = new ReadingStatus { Id = Guid.NewGuid(), BookId = bookId, Status = ReadingStatusEnum.Backlog };

        _mockBookRepository.Setup(r => r.GetByIdAsync(bookId)).ReturnsAsync(existingBook);
        _mockReadingStatusRepository.Setup(r => r.GetByBookIdAsync(bookId)).ReturnsAsync(existingStatus);
        _mockReadingStatusRepository.Setup(r => r.UpdateAsync(It.IsAny<ReadingStatus>())).Returns(Task.CompletedTask);

        // Act
        await _service.CreateOrUpdateReadingStatusAsync(bookId, statusDto);

        // Assert
        _mockReadingStatusRepository.Verify(r => r.UpdateAsync(It.Is<ReadingStatus>(status => 
            status.Status == ReadingStatusEnum.Completed)), Times.Once);
        _mockReadingStatusRepository.Verify(r => r.CreateAsync(It.IsAny<ReadingStatus>()), Times.Never);
    }

    [Fact]
    public async Task CreateOrUpdateReadingStatusAsync_WhenStatusDoesNotExist_CreatesStatus()
    {
        // Arrange
        var bookId = Guid.NewGuid();
        var statusDto = new ReadingStatusDto { Status = ReadingStatusEnum.Backlog };
        
        var existingBook = new BookDetailsDto { Id = bookId, Title = "Test", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own };

        _mockBookRepository.Setup(r => r.GetByIdAsync(bookId)).ReturnsAsync(existingBook);
        _mockReadingStatusRepository.Setup(r => r.GetByBookIdAsync(bookId)).ReturnsAsync((ReadingStatus?)null);
        
        var createdStatus = new ReadingStatus { Id = Guid.NewGuid(), BookId = bookId, Status = ReadingStatusEnum.Backlog };
        _mockReadingStatusRepository.Setup(r => r.CreateAsync(It.IsAny<ReadingStatus>())).ReturnsAsync(createdStatus);

        // Act
        await _service.CreateOrUpdateReadingStatusAsync(bookId, statusDto);

        // Assert
        _mockReadingStatusRepository.Verify(r => r.CreateAsync(It.Is<ReadingStatus>(status => 
            status.BookId == bookId && status.Status == ReadingStatusEnum.Backlog)), Times.Once);
        _mockReadingStatusRepository.Verify(r => r.UpdateAsync(It.IsAny<ReadingStatus>()), Times.Never);
    }

    [Fact]
    public async Task DeleteReadingStatusAsync_WhenStatusExists_DeletesStatus()
    {
        // Arrange
        var bookId = Guid.NewGuid();
        var existingBook = new BookDetailsDto { Id = bookId, Title = "Test", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own };
        var existingStatus = new ReadingStatus { Id = Guid.NewGuid(), BookId = bookId, Status = ReadingStatusEnum.Completed };

        _mockBookRepository.Setup(r => r.GetByIdAsync(bookId)).ReturnsAsync(existingBook);
        _mockReadingStatusRepository.Setup(r => r.GetByBookIdAsync(bookId)).ReturnsAsync(existingStatus);
        _mockReadingStatusRepository.Setup(r => r.DeleteByBookIdAsync(bookId)).Returns(Task.CompletedTask);

        // Act
        await _service.DeleteReadingStatusAsync(bookId);

        // Assert
        _mockReadingStatusRepository.Verify(r => r.DeleteByBookIdAsync(bookId), Times.Once);
    }

    [Fact]
    public async Task DeleteReadingStatusAsync_WhenBookDoesNotExist_ThrowsNotFoundException()
    {
        // Arrange
        var bookId = Guid.NewGuid();
        _mockBookRepository.Setup(r => r.GetByIdAsync(bookId)).ReturnsAsync((BookDetailsDto?)null);

        // Act
        Func<Task> act = async () => await _service.DeleteReadingStatusAsync(bookId);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage($"Book with ID {bookId} not found");
        _mockReadingStatusRepository.Verify(r => r.DeleteByBookIdAsync(It.IsAny<Guid>()), Times.Never);
    }
}
