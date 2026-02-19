using Microsoft.EntityFrameworkCore;
using PersonalLibrary.API.DTOs;
using PersonalLibrary.API.Models;

namespace PersonalLibrary.API.Data;

/// <summary>
/// Repository implementation for book data access operations.
/// </summary>
public class BookRepository : IBookRepository
{
    private readonly LibraryDbContext _context;

    /// <summary>
    /// Initializes a new instance of the BookRepository class.
    /// </summary>
    /// <param name="context">The database context.</param>
    public BookRepository(LibraryDbContext context)
    {
        _context = context;
    }

    /// <inheritdoc />
    public async Task<List<BookDetailsDto>> GetAllAsync()
    {
        return await _context.Books
            .AsNoTracking()
            .Include(b => b.Rating)
            .Include(b => b.ReadingStatus)
            .Include(b => b.Loans.Where(l => !l.IsReturned))
            .Select(b => MapToDetailsDto(b))
            .ToListAsync();
    }

    /// <inheritdoc />
    public async Task<BookDetailsDto?> GetByIdAsync(Guid id)
    {
        var book = await _context.Books
            .AsNoTracking()
            .Include(b => b.Rating)
            .Include(b => b.ReadingStatus)
            .Include(b => b.Loans.Where(l => !l.IsReturned))
            .FirstOrDefaultAsync(b => b.Id == id);

        return book is null ? null : MapToDetailsDto(book);
    }

    /// <inheritdoc />
    public async Task<Book> CreateAsync(Book book)
    {
        _context.Books.Add(book);
        await _context.SaveChangesAsync();
        return book;
    }

    /// <inheritdoc />
    public async Task UpdateAsync(Book book)
    {
        _context.Books.Update(book);
        await _context.SaveChangesAsync();
    }

    /// <inheritdoc />
    public async Task DeleteAsync(Guid id)
    {
        var book = await _context.Books.FindAsync(id);
        if (book is not null)
        {
            _context.Books.Remove(book);
            await _context.SaveChangesAsync();
        }
    }

    /// <summary>
    /// Maps a Book entity with its related entities to a flat BookDetailsDto.
    /// </summary>
    /// <param name="book">The book entity to map.</param>
    /// <returns>Flattened book details DTO.</returns>
    private static BookDetailsDto MapToDetailsDto(Book book)
    {
        var activeLoan = book.Loans.FirstOrDefault(l => !l.IsReturned);

        return new BookDetailsDto
        {
            Id = book.Id,
            Title = book.Title,
            Author = book.Author,
            Description = book.Description,
            Notes = book.Notes,
            ISBN = book.ISBN,
            PublishedYear = book.PublishedYear,
            PageCount = book.PageCount,
            OwnershipStatus = book.OwnershipStatus,
            Score = book.Rating?.Score,
            RatingNotes = book.Rating?.Notes,
            ReadingStatus = book.ReadingStatus?.Status,
            Loanee = activeLoan?.BorrowedTo,
            LoanDate = activeLoan?.LoanDate
        };
    }
}
