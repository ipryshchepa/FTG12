using PersonalLibrary.API.Data;
using PersonalLibrary.API.DTOs;
using PersonalLibrary.API.Exceptions;
using PersonalLibrary.API.Models;

namespace PersonalLibrary.API.Services;

/// <summary>
/// Service implementation for reading status business logic operations.
/// </summary>
public class ReadingStatusService : IReadingStatusService
{
    private readonly IReadingStatusRepository _readingStatusRepository;
    private readonly IBookRepository _bookRepository;

    /// <summary>
    /// Initializes a new instance of the ReadingStatusService class.
    /// </summary>
    /// <param name="readingStatusRepository">The reading status repository.</param>
    /// <param name="bookRepository">The book repository.</param>
    public ReadingStatusService(IReadingStatusRepository readingStatusRepository, IBookRepository bookRepository)
    {
        _readingStatusRepository = readingStatusRepository;
        _bookRepository = bookRepository;
    }

    /// <inheritdoc />
    public async Task CreateOrUpdateReadingStatusAsync(Guid bookId, ReadingStatusDto statusDto)
    {
        // Verify book exists
        var book = await _bookRepository.GetByIdAsync(bookId);
        if (book is null)
        {
            throw new NotFoundException($"Book with ID {bookId} not found");
        }

        // Check if reading status already exists
        var existingStatus = await _readingStatusRepository.GetByBookIdAsync(bookId);

        if (existingStatus is null)
        {
            // Create new reading status
            var status = new ReadingStatus
            {
                BookId = bookId,
                Status = statusDto.Status
            };
            await _readingStatusRepository.CreateAsync(status);
        }
        else
        {
            // Update existing reading status
            existingStatus.Status = statusDto.Status;
            await _readingStatusRepository.UpdateAsync(existingStatus);
        }
    }

    /// <inheritdoc />
    public async Task DeleteReadingStatusAsync(Guid bookId)
    {
        // Verify book exists
        var book = await _bookRepository.GetByIdAsync(bookId);
        if (book is null)
        {
            throw new NotFoundException($"Book with ID {bookId} not found");
        }

        // Verify reading status exists
        var existingStatus = await _readingStatusRepository.GetByBookIdAsync(bookId);
        if (existingStatus is null)
        {
            throw new NotFoundException($"Reading status for book with ID {bookId} not found");
        }

        await _readingStatusRepository.DeleteByBookIdAsync(bookId);
    }
}
