using Microsoft.EntityFrameworkCore;
using PersonalLibrary.API.Models;

namespace PersonalLibrary.API.Data;

/// <summary>
/// Repository implementation for rating data access operations.
/// </summary>
public class RatingRepository : IRatingRepository
{
    private readonly LibraryDbContext _context;

    /// <summary>
    /// Initializes a new instance of the RatingRepository class.
    /// </summary>
    /// <param name="context">The database context.</param>
    public RatingRepository(LibraryDbContext context)
    {
        _context = context;
    }

    /// <inheritdoc />
    public async Task<Rating?> GetByBookIdAsync(Guid bookId)
    {
        return await _context.Ratings
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.BookId == bookId);
    }

    /// <inheritdoc />
    public async Task<Rating> CreateAsync(Rating rating)
    {
        _context.Ratings.Add(rating);
        await _context.SaveChangesAsync();
        return rating;
    }

    /// <inheritdoc />
    public async Task UpdateAsync(Rating rating)
    {
        _context.Ratings.Update(rating);
        await _context.SaveChangesAsync();
    }

    /// <inheritdoc />
    public async Task DeleteByBookIdAsync(Guid bookId)
    {
        var rating = await _context.Ratings
            .FirstOrDefaultAsync(r => r.BookId == bookId);
        if (rating is not null)
        {
            _context.Ratings.Remove(rating);
            await _context.SaveChangesAsync();
        }
    }
}
