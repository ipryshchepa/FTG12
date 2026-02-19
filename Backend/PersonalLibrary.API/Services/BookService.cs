using PersonalLibrary.API.Data;
using PersonalLibrary.API.DTOs;
using PersonalLibrary.API.Exceptions;
using PersonalLibrary.API.Models;

namespace PersonalLibrary.API.Services;

/// <summary>
/// Service implementation for book business logic operations.
/// </summary>
public class BookService : IBookService
{
    private readonly IBookRepository _bookRepository;

    /// <summary>
    /// Initializes a new instance of the BookService class.
    /// </summary>
    /// <param name="bookRepository">The book repository.</param>
    public BookService(IBookRepository bookRepository)
    {
        _bookRepository = bookRepository;
    }

    /// <inheritdoc />
    public async Task<List<BookDetailsDto>> GetAllBooksAsync()
    {
        return await _bookRepository.GetAllAsync();
    }

    /// <inheritdoc />
    public async Task<PaginatedResponse<BookDetailsDto>> GetAllBooksPaginatedAsync(int page, int pageSize, string sortBy, string sortDirection)
    {
        // Validate pagination parameters
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100; // Max 100 items per page

        // Validate and normalize sortBy
        var validSortFields = new[] { "title", "author", "score", "ownershipstatus", "readingstatus", "loanee" };
        sortBy = sortBy.ToLower();
        if (!validSortFields.Contains(sortBy))
        {
            sortBy = "title";
        }

        // Validate sortDirection
        sortDirection = sortDirection.ToLower();
        if (sortDirection != "asc" && sortDirection != "desc")
        {
            sortDirection = "asc";
        }

        return await _bookRepository.GetAllPaginatedAsync(page, pageSize, sortBy, sortDirection);
    }

    /// <inheritdoc />
    public async Task<BookDetailsDto?> GetBookByIdAsync(Guid id)
    {
        var book = await _bookRepository.GetByIdAsync(id);
        if (book is null)
        {
            throw new NotFoundException($"Book with ID {id} not found");
        }
        return book;
    }

    /// <inheritdoc />
    public async Task<BookDetailsDto> CreateBookAsync(BookDto bookDto)
    {
        if (bookDto.Id is not null)
        {
            throw new BadRequestException("Id must be null for creation");
        }

        var book = MapToEntity(bookDto);
        var createdBook = await _bookRepository.CreateAsync(book);
        
        var result = await _bookRepository.GetByIdAsync(createdBook.Id);
        return result!;
    }

    /// <inheritdoc />
    public async Task UpdateBookAsync(Guid id, BookDto bookDto)
    {
        if (bookDto.Id is null)
        {
            throw new BadRequestException("Id is required for update");
        }

        if (bookDto.Id != id)
        {
            throw new BadRequestException("Id in request body must match route parameter");
        }

        var existingBook = await _bookRepository.GetByIdAsync(id);
        if (existingBook is null)
        {
            throw new NotFoundException($"Book with ID {id} not found");
        }

        var book = MapToEntity(bookDto);
        await _bookRepository.UpdateAsync(book);
    }

    /// <inheritdoc />
    public async Task DeleteBookAsync(Guid id)
    {
        var book = await _bookRepository.GetByIdAsync(id);
        if (book is null)
        {
            throw new NotFoundException($"Book with ID {id} not found");
        }
        
        await _bookRepository.DeleteAsync(id);
    }

    /// <summary>
    /// Maps a BookDto to a Book entity.
    /// </summary>
    /// <param name="dto">The book DTO to map.</param>
    /// <returns>The mapped book entity.</returns>
    private static Book MapToEntity(BookDto dto)
    {
        return new Book
        {
            Id = dto.Id ?? Guid.NewGuid(),
            Title = dto.Title,
            Author = dto.Author,
            Description = dto.Description,
            Notes = dto.Notes,
            ISBN = dto.ISBN,
            PublishedYear = dto.PublishedYear,
            PageCount = dto.PageCount,
            OwnershipStatus = dto.OwnershipStatus
        };
    }
}
