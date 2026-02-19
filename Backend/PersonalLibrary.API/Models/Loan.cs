namespace PersonalLibrary.API.Models;

/// <summary>
/// Represents a loan of a book to someone.
/// </summary>
public class Loan
{
    /// <summary>
    /// Unique identifier for the loan.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Foreign key to the book being loaned.
    /// </summary>
    public Guid BookId { get; set; }

    /// <summary>
    /// Name of the person who borrowed the book.
    /// </summary>
    public string BorrowedTo { get; set; } = string.Empty;

    /// <summary>
    /// Date the book was loaned.
    /// </summary>
    public DateTime LoanDate { get; set; }

    /// <summary>
    /// Indicates whether the book has been returned.
    /// </summary>
    public bool IsReturned { get; set; }

    /// <summary>
    /// Date the book was returned (if applicable).
    /// </summary>
    public DateTime? ReturnedDate { get; set; }

    // Navigation property

    /// <summary>
    /// The book associated with this loan.
    /// </summary>
    public Book Book { get; set; } = null!;

    /// <summary>
    /// Initializes a new instance of the Loan class.
    /// </summary>
    public Loan()
    {
        Id = Guid.NewGuid();
        IsReturned = false;
    }
}
