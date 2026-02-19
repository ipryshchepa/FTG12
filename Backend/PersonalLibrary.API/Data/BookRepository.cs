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
    public async Task<PaginatedResponse<BookDetailsDto>> GetAllPaginatedAsync(int page, int pageSize, string sortBy, string sortDirection)
    {
        var query = _context.Books
            .AsNoTracking()
            .Include(b => b.Rating)
            .Include(b => b.ReadingStatus)
            .Include(b => b.Loans.Where(l => !l.IsReturned))
            .AsQueryable();

        // Get total count before pagination
        var totalCount = await query.CountAsync();

        List<BookDetailsDto> itemList;

        // For loanee sorting, materialize first then sort in memory due to EF Core limitations
        // We load all loans (not just active ones) and then filter in memory
        if (sortBy.Equals("loanee", StringComparison.OrdinalIgnoreCase))
        {
            var queryWithAllLoans = _context.Books
                .AsNoTracking()
                .Include(b => b.Rating)
                .Include(b => b.ReadingStatus)
                .Include(b => b.Loans)
                .AsQueryable();
            
            var allBooks = await queryWithAllLoans.ToListAsync();
            var isDescending = sortDirection.Equals("desc", StringComparison.OrdinalIgnoreCase);
            
            allBooks = isDescending
                ? allBooks.OrderByDescending(b => b.Loans.FirstOrDefault(l => !l.IsReturned)?.BorrowedTo).ThenBy(b => b.Id).ToList()
                : allBooks.OrderBy(b => b.Loans.FirstOrDefault(l => !l.IsReturned)?.BorrowedTo).ThenBy(b => b.Id).ToList();
            
            itemList = allBooks
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(b => MapToDetailsDto(b))
                .ToList();
        }
        else
        {
            // Apply sorting
            query = ApplySorting(query, sortBy, sortDirection);

            // Apply pagination and materialize
            var books = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Map to DTOs after materialization
            itemList = books.Select(b => MapToDetailsDto(b)).ToList();
        }

        return new PaginatedResponse<BookDetailsDto>
        {
            Items = itemList,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
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
    /// Applies sorting to the query based on the specified field and direction.
    /// Secondary ordering by BookId is applied to ensure consistent sort order.
    /// </summary>
    /// <param name="query">The query to sort.</param>
    /// <param name="sortBy">The field to sort by.</param>
    /// <param name="sortDirection">The sort direction ('asc' or 'desc').</param>
    /// <returns>The sorted query.</returns>
    private static IQueryable<Book> ApplySorting(IQueryable<Book> query, string sortBy, string sortDirection)
    {
        var isDescending = sortDirection.Equals("desc", StringComparison.OrdinalIgnoreCase);

        IOrderedQueryable<Book> orderedQuery = sortBy.ToLower() switch
        {
            "title" => isDescending
                ? query.OrderByDescending(b => b.Title)
                : query.OrderBy(b => b.Title),
            "author" => isDescending
                ? query.OrderByDescending(b => b.Author)
                : query.OrderBy(b => b.Author),
            "score" => isDescending
                ? query.OrderByDescending(b => b.Rating != null ? b.Rating.Score : (int?)null)
                : query.OrderBy(b => b.Rating != null ? b.Rating.Score : (int?)null),
            "ownershipstatus" => isDescending
                ? query.OrderByDescending(b => b.OwnershipStatus)
                : query.OrderBy(b => b.OwnershipStatus),
            "readingstatus" => isDescending
                ? query.OrderByDescending(b => b.ReadingStatus != null ? b.ReadingStatus.Status : (ReadingStatusEnum?)null)
                : query.OrderBy(b => b.ReadingStatus != null ? b.ReadingStatus.Status : (ReadingStatusEnum?)null),
            _ => query.OrderBy(b => b.Title) // Default to Title
        };

        // Apply secondary ordering by Id for consistent, deterministic results
        return orderedQuery.ThenBy(b => b.Id);
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
