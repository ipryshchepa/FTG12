using PersonalLibrary.API.Models;

namespace PersonalLibrary.API.DTOs;

/// <summary>
/// Flat read-only data transfer object for book details including related entities.
/// Used for both grid display and details page.
/// </summary>
public class BookDetailsDto
{
    // Book properties

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

    // Flattened Rating properties

    /// <summary>
    /// Rating score (1-10) if book has been rated.
    /// </summary>
    public int? Score { get; set; }

    /// <summary>
    /// Optional notes about the rating.
    /// </summary>
    public string? RatingNotes { get; set; }

    // Flattened ReadingStatus property

    /// <summary>
    /// Reading status of the book (Backlog, Completed, Abandoned).
    /// </summary>
    public ReadingStatusEnum? ReadingStatus { get; set; }

    // Flattened Loan properties (active loan only)

    /// <summary>
    /// Name of person who currently has the book on loan.
    /// </summary>
    public string? Loanee { get; set; }

    /// <summary>
    /// Date the active loan started.
    /// </summary>
    public DateTime? LoanDate { get; set; }
}
