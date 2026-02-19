namespace PersonalLibrary.API.DTOs;

/// <summary>
/// Data transfer object for creating and managing book loans.
/// </summary>
public class LoanDto
{
    /// <summary>
    /// Loan identifier. Null for creation, populated for updates.
    /// </summary>
    public Guid? Id { get; set; }

    /// <summary>
    /// Name of the person borrowing the book.
    /// </summary>
    public string BorrowedTo { get; set; } = string.Empty;

    /// <summary>
    /// Date the book was loaned.
    /// </summary>
    public DateTime? LoanDate { get; set; }

    /// <summary>
    /// Indicates whether the book has been returned.
    /// </summary>
    public bool? IsReturned { get; set; }

    /// <summary>
    /// Date the book was returned.
    /// </summary>
    public DateTime? ReturnedDate { get; set; }
}
