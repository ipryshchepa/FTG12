using FluentAssertions;
using Moq;
using PersonalLibrary.API.Data;
using PersonalLibrary.API.DTOs;
using PersonalLibrary.API.Exceptions;
using PersonalLibrary.API.Models;
using PersonalLibrary.API.Services;

namespace PersonalLibrary.API.Tests.Services;

/// <summary>
/// Tests for BookService business logic operations.
/// </summary>
public class BookServiceTests
{
    private readonly Mock<IBookRepository> _mockRepository;
    private readonly BookService _service;

    public BookServiceTests()
    {
        _mockRepository = new Mock<IBookRepository>();
        _service = new BookService(_mockRepository.Object);
    }

    [Fact]
    public async Task GetAllBooksAsync_CallsRepository_ReturnsBooksList()
    {
        // Arrange
        var expectedBooks = new List<BookDetailsDto>
        {
            new() { Id = Guid.NewGuid(), Title = "Book 1", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own },
            new() { Id = Guid.NewGuid(), Title = "Book 2", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.WantToBuy }
        };
        _mockRepository.Setup(r => r.GetAllAsync()).ReturnsAsync(expectedBooks);

        // Act
        var result = await _service.GetAllBooksAsync();

        // Assert
        result.Should().BeEquivalentTo(expectedBooks);
        _mockRepository.Verify(r => r.GetAllAsync(), Times.Once);
    }

    [Fact]
    public async Task GetBookByIdAsync_WhenBookExists_ReturnsBook()
    {
        // Arrange
        var bookId = Guid.NewGuid();
        var expectedBook = new BookDetailsDto { Id = bookId, Title = "Test Book", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own };
        _mockRepository.Setup(r => r.GetByIdAsync(bookId)).ReturnsAsync(expectedBook);

        // Act
        var result = await _service.GetBookByIdAsync(bookId);

        // Assert
        result.Should().BeEquivalentTo(expectedBook);
        _mockRepository.Verify(r => r.GetByIdAsync(bookId), Times.Once);
    }

    [Fact]
    public async Task GetBookByIdAsync_WhenBookDoesNotExist_ThrowsNotFoundException()
    {
        // Arrange
        var bookId = Guid.NewGuid();
        _mockRepository.Setup(r => r.GetByIdAsync(bookId)).ReturnsAsync((BookDetailsDto?)null);

        // Act
        Func<Task> act = async () => await _service.GetBookByIdAsync(bookId);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage($"Book with ID {bookId} not found");
    }

    [Fact]
    public async Task CreateBookAsync_WithNullId_CreatesBook()
    {
        // Arrange
        var bookDto = new BookDto
        {
            Id = null,
            Title = "New Book",
            Author = "Author McAuthorface",
            OwnershipStatus = OwnershipStatus.Own
        };

        var createdBookId = Guid.NewGuid();
        _mockRepository.Setup(r => r.CreateAsync(It.IsAny<Book>()))
            .ReturnsAsync(new Book { Id = createdBookId, Title = "New Book", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own });

        var createdBookDetails = new BookDetailsDto
        {
            Id = createdBookId,
            Title = "New Book",
            Author = "Author McAuthorface",
            OwnershipStatus = OwnershipStatus.Own
        };
        _mockRepository.Setup(r => r.GetByIdAsync(createdBookId)).ReturnsAsync(createdBookDetails);

        // Act
        var result = await _service.CreateBookAsync(bookDto);

        // Assert
        result.Should().NotBeNull();
        result.Title.Should().Be("New Book");
        _mockRepository.Verify(r => r.CreateAsync(It.IsAny<Book>()), Times.Once);
    }

    [Fact]
    public async Task CreateBookAsync_WithNonNullId_ThrowsBadRequestException()
    {
        // Arrange
        var bookDto = new BookDto
        {
            Id = Guid.NewGuid(),
            Title = "New Book",
            Author = "Author McAuthorface",
            OwnershipStatus = OwnershipStatus.Own
        };

        // Act
        Func<Task> act = async () => await _service.CreateBookAsync(bookDto);

        // Assert
        await act.Should().ThrowAsync<BadRequestException>()
            .WithMessage("Id must be null for creation");
        _mockRepository.Verify(r => r.CreateAsync(It.IsAny<Book>()), Times.Never);
    }

    [Fact]
    public async Task UpdateBookAsync_WithValidData_UpdatesBook()
    {
        // Arrange
        var bookId = Guid.NewGuid();
        var bookDto = new BookDto
        {
            Id = bookId,
            Title = "Updated Book",
            Author = "Author McAuthorface",
            OwnershipStatus = OwnershipStatus.Own
        };

        var existingBook = new BookDetailsDto { Id = bookId, Title = "Original", Author = "Original Author", OwnershipStatus = OwnershipStatus.WantToBuy };
        _mockRepository.Setup(r => r.GetByIdAsync(bookId)).ReturnsAsync(existingBook);
        _mockRepository.Setup(r => r.UpdateAsync(It.IsAny<Book>())).Returns(Task.CompletedTask);

        // Act
        await _service.UpdateBookAsync(bookId, bookDto);

        // Assert
        _mockRepository.Verify(r => r.UpdateAsync(It.Is<Book>(b => b.Title == "Updated Book")), Times.Once);
    }

    [Fact]
    public async Task UpdateBookAsync_WithNullId_ThrowsBadRequestException()
    {
        // Arrange
        var bookDto = new BookDto
        {
            Id = null,
            Title = "Updated Book",
            Author = "Author McAuthorface",
            OwnershipStatus = OwnershipStatus.Own
        };

        // Act
        Func<Task> act = async () => await _service.UpdateBookAsync(Guid.NewGuid(), bookDto);

        // Assert
        await act.Should().ThrowAsync<BadRequestException>()
            .WithMessage("Id is required for update");
    }

    [Fact]
    public async Task UpdateBookAsync_WithMismatchedIds_ThrowsBadRequestException()
    {
        // Arrange
        var routeId = Guid.NewGuid();
        var bodyId = Guid.NewGuid();
        var bookDto = new BookDto
        {
            Id = bodyId,
            Title = "Updated Book",
            Author = "Author McAuthorface",
            OwnershipStatus = OwnershipStatus.Own
        };

        // Act
        Func<Task> act = async () => await _service.UpdateBookAsync(routeId, bookDto);

        // Assert
        await act.Should().ThrowAsync<BadRequestException>()
            .WithMessage("Id in request body must match route parameter");
    }

    [Fact]
    public async Task UpdateBookAsync_WhenBookDoesNotExist_ThrowsNotFoundException()
    {
        // Arrange
        var bookId = Guid.NewGuid();
        var bookDto = new BookDto
        {
            Id = bookId,
            Title = "Updated Book",
            Author = "Author McAuthorface",
            OwnershipStatus = OwnershipStatus.Own
        };

        _mockRepository.Setup(r => r.GetByIdAsync(bookId)).ReturnsAsync((BookDetailsDto?)null);

        // Act
        Func<Task> act = async () => await _service.UpdateBookAsync(bookId, bookDto);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage($"Book with ID {bookId} not found");
    }

    [Fact]
    public async Task DeleteBookAsync_WhenBookExists_DeletesBook()
    {
        // Arrange
        var bookId = Guid.NewGuid();
        var existingBook = new BookDetailsDto { Id = bookId, Title = "Test Book", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own };
        _mockRepository.Setup(r => r.GetByIdAsync(bookId)).ReturnsAsync(existingBook);
        _mockRepository.Setup(r => r.DeleteAsync(bookId)).Returns(Task.CompletedTask);

        // Act
        await _service.DeleteBookAsync(bookId);

        // Assert
        _mockRepository.Verify(r => r.DeleteAsync(bookId), Times.Once);
    }

    [Fact]
    public async Task DeleteBookAsync_WhenBookDoesNotExist_ThrowsNotFoundException()
    {
        // Arrange
        var bookId = Guid.NewGuid();
        _mockRepository.Setup(r => r.GetByIdAsync(bookId)).ReturnsAsync((BookDetailsDto?)null);

        // Act
        Func<Task> act = async () => await _service.DeleteBookAsync(bookId);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage($"Book with ID {bookId} not found");
        _mockRepository.Verify(r => r.DeleteAsync(It.IsAny<Guid>()), Times.Never);
    }

    [Fact]
    public async Task GetAllBooksPaginatedAsync_WithValidParameters_ReturnsCurrentPage()
    {
        // Arrange
        var expectedResponse = new PaginatedResponse<BookDetailsDto>
        {
            Items = new List<BookDetailsDto>
            {
                new() { Id = Guid.NewGuid(), Title = "Book 1", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own },
                new() { Id = Guid.NewGuid(), Title = "Book 2", Author = "Author McAuthorface", OwnershipStatus = OwnershipStatus.Own }
            },
            TotalCount = 20,
            Page = 1,
            PageSize = 10
        };
        _mockRepository.Setup(r => r.GetAllPaginatedAsync(1, 10, "title", "asc"))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _service.GetAllBooksPaginatedAsync(1, 10, "Title", "asc");

        // Assert
        result.Should().BeEquivalentTo(expectedResponse);
        _mockRepository.Verify(r => r.GetAllPaginatedAsync(1, 10, "title", "asc"), Times.Once);
    }

    [Fact]
    public async Task GetAllBooksPaginatedAsync_WithInvalidPage_DefaultsToPageOne()
    {
        // Arrange
        var expectedResponse = new PaginatedResponse<BookDetailsDto>
        {
            Items = new List<BookDetailsDto>(),
            TotalCount = 0,
            Page = 1,
            PageSize = 10
        };
        _mockRepository.Setup(r => r.GetAllPaginatedAsync(1, 10, "title", "asc"))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _service.GetAllBooksPaginatedAsync(0, 10, "Title", "asc");

        // Assert
        result.Page.Should().Be(1);
        _mockRepository.Verify(r => r.GetAllPaginatedAsync(1, 10, "title", "asc"), Times.Once);
    }

    [Fact]
    public async Task GetAllBooksPaginatedAsync_WithInvalidPageSize_DefaultsToTen()
    {
        // Arrange
        var expectedResponse = new PaginatedResponse<BookDetailsDto>
        {
            Items = new List<BookDetailsDto>(),
            TotalCount = 0,
            Page = 1,
            PageSize = 10
        };
        _mockRepository.Setup(r => r.GetAllPaginatedAsync(1, 10, "title", "asc"))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _service.GetAllBooksPaginatedAsync(1, 0, "Title", "asc");

        // Assert
        result.PageSize.Should().Be(10);
        _mockRepository.Verify(r => r.GetAllPaginatedAsync(1, 10, "title", "asc"), Times.Once);
    }

    [Fact]
    public async Task GetAllBooksPaginatedAsync_WithPageSizeOverMax_CapsAtHundred()
    {
        // Arrange
        var expectedResponse = new PaginatedResponse<BookDetailsDto>
        {
            Items = new List<BookDetailsDto>(),
            TotalCount = 0,
            Page = 1,
            PageSize = 100
        };
        _mockRepository.Setup(r => r.GetAllPaginatedAsync(1, 100, "title", "asc"))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _service.GetAllBooksPaginatedAsync(1, 200, "Title", "asc");

        // Assert
        result.PageSize.Should().Be(100);
        _mockRepository.Verify(r => r.GetAllPaginatedAsync(1, 100, "title", "asc"), Times.Once);
    }

    [Fact]
    public async Task GetAllBooksPaginatedAsync_WithInvalidSortField_DefaultsToTitle()
    {
        // Arrange
        var expectedResponse = new PaginatedResponse<BookDetailsDto>
        {
            Items = new List<BookDetailsDto>(),
            TotalCount = 0,
            Page = 1,
            PageSize = 10
        };
        _mockRepository.Setup(r => r.GetAllPaginatedAsync(1, 10, "title", "asc"))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _service.GetAllBooksPaginatedAsync(1, 10, "InvalidField", "asc");

        // Assert
        _mockRepository.Verify(r => r.GetAllPaginatedAsync(1, 10, "title", "asc"), Times.Once);
    }

    [Fact]
    public async Task GetAllBooksPaginatedAsync_WithInvalidSortDirection_DefaultsToAsc()
    {
        // Arrange
        var expectedResponse = new PaginatedResponse<BookDetailsDto>
        {
            Items = new List<BookDetailsDto>(),
            TotalCount = 0,
            Page = 1,
            PageSize = 10
        };
        _mockRepository.Setup(r => r.GetAllPaginatedAsync(1, 10, "title", "asc"))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _service.GetAllBooksPaginatedAsync(1, 10, "Title", "invalid");

        // Assert
        _mockRepository.Verify(r => r.GetAllPaginatedAsync(1, 10, "title", "asc"), Times.Once);
    }

    [Theory]
    [InlineData("Title")]
    [InlineData("Author")]
    [InlineData("Score")]
    [InlineData("OwnershipStatus")]
    [InlineData("ReadingStatus")]
    [InlineData("Loanee")]
    public async Task GetAllBooksPaginatedAsync_WithValidSortFields_AcceptsField(string sortField)
    {
        // Arrange
        var expectedResponse = new PaginatedResponse<BookDetailsDto>
        {
            Items = new List<BookDetailsDto>(),
            TotalCount = 0,
            Page = 1,
            PageSize = 10
        };
        var normalizedField = sortField.ToLower();
        _mockRepository.Setup(r => r.GetAllPaginatedAsync(1, 10, normalizedField, "asc"))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _service.GetAllBooksPaginatedAsync(1, 10, sortField, "asc");

        // Assert
        _mockRepository.Verify(r => r.GetAllPaginatedAsync(1, 10, normalizedField, "asc"), Times.Once);
    }
}
