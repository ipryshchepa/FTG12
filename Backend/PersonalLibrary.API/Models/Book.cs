namespace PersonalLibrary.API.Models;

/// <summary>
/// Represents a book in the personal library.
/// </summary>
public class Book
{
    /// <summary>
    /// Unique identifier for the book.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Title of the book.
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Author of the book.
    /// </summary>
    public string Author { get; set; } = string.Empty;

    /// <summary>
    /// Description or summary of the book.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Personal notes about the book.
    /// </summary>
    public string? Notes { get; set; }

    /// <summary>
    /// ISBN of the book.
    /// </summary>
    public string? ISBN { get; set; }

    /// <summary>
    /// Year the book was published.
    /// </summary>
    public int? PublishedYear { get; set; }

    /// <summary>
    /// Number of pages in the book.
    /// </summary>
    public int? PageCount { get; set; }

    /// <summary>
    /// Ownership status of the book.
    /// </summary>
    public OwnershipStatus OwnershipStatus { get; set; }

    // Navigation properties

    /// <summary>
    /// Optional rating for this book.
    /// </summary>
    public Rating? Rating { get; set; }

    /// <summary>
    /// Optional reading status for this book.
    /// </summary>
    public ReadingStatus? ReadingStatus { get; set; }

    /// <summary>
    /// Collection of loans for this book.
    /// </summary>
    public ICollection<Loan> Loans { get; set; }

    /// <summary>
    /// Initializes a new instance of the Book class.
    /// </summary>
    public Book()
    {
        Id = Guid.NewGuid();
        Loans = new List<Loan>();
    }
}
