using Microsoft.EntityFrameworkCore;
using PersonalLibrary.API.Models;

namespace PersonalLibrary.API.Data;

/// <summary>
/// Repository implementation for reading status data access operations.
/// </summary>
public class ReadingStatusRepository : IReadingStatusRepository
{
    private readonly LibraryDbContext _context;

    /// <summary>
    /// Initializes a new instance of the ReadingStatusRepository class.
    /// </summary>
    /// <param name="context">The database context.</param>
    public ReadingStatusRepository(LibraryDbContext context)
    {
        _context = context;
    }

    /// <inheritdoc />
    public async Task<ReadingStatus?> GetByBookIdAsync(Guid bookId)
    {
        return await _context.ReadingStatuses
            .FirstOrDefaultAsync(rs => rs.BookId == bookId);
    }

    /// <inheritdoc />
    public async Task<ReadingStatus> CreateAsync(ReadingStatus status)
    {
        _context.ReadingStatuses.Add(status);
        await _context.SaveChangesAsync();
        return status;
    }

    /// <inheritdoc />
    public async Task UpdateAsync(ReadingStatus status)
    {
        _context.ReadingStatuses.Update(status);
        await _context.SaveChangesAsync();
    }

    /// <inheritdoc />
    public async Task DeleteByBookIdAsync(Guid bookId)
    {
        var status = await GetByBookIdAsync(bookId);
        if (status is not null)
        {
            _context.ReadingStatuses.Remove(status);
            await _context.SaveChangesAsync();
        }
    }
}
