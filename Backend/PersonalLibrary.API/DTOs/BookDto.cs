using PersonalLibrary.API.Models;

namespace PersonalLibrary.API.DTOs;

/// <summary>
/// Data transfer object for creating and updating books.
/// </summary>
public class BookDto
{
    /// <summary>
    /// Book identifier. Null for creation, populated for updates.
    /// </summary>
    public Guid? Id { get; set; }

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
}
