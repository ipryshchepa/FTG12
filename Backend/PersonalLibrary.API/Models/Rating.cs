namespace PersonalLibrary.API.Models;

/// <summary>
/// Represents a rating for a book.
/// </summary>
public class Rating
{
    /// <summary>
    /// Unique identifier for the rating.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Foreign key to the book being rated.
    /// </summary>
    public Guid BookId { get; set; }

    /// <summary>
    /// Rating score (1-10).
    /// </summary>
    public int Score { get; set; }

    /// <summary>
    /// Optional notes about the rating.
    /// </summary>
    public string? Notes { get; set; }

    // Navigation property

    /// <summary>
    /// The book associated with this rating.
    /// </summary>
    public Book Book { get; set; } = null!;

    /// <summary>
    /// Initializes a new instance of the Rating class.
    /// </summary>
    public Rating()
    {
        Id = Guid.NewGuid();
    }
}
