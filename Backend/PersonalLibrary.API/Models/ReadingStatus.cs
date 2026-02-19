namespace PersonalLibrary.API.Models;

/// <summary>
/// Represents the reading status of a book.
/// </summary>
public class ReadingStatus
{
    /// <summary>
    /// Unique identifier for the reading status.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Foreign key to the book.
    /// </summary>
    public Guid BookId { get; set; }

    /// <summary>
    /// Status of the book (Backlog, Completed, Abandoned).
    /// </summary>
    public ReadingStatusEnum Status { get; set; }

    // Navigation property

    /// <summary>
    /// The book associated with this reading status.
    /// </summary>
    public Book Book { get; set; } = null!;

    /// <summary>
    /// Initializes a new instance of the ReadingStatus class.
    /// </summary>
    public ReadingStatus()
    {
        Id = Guid.NewGuid();
    }
}
