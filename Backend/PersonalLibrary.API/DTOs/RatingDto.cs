namespace PersonalLibrary.API.DTOs;

/// <summary>
/// Data transfer object for creating and updating book ratings.
/// </summary>
public class RatingDto
{
    /// <summary>
    /// Rating identifier. Null for creation, populated for updates.
    /// </summary>
    public Guid? Id { get; set; }

    /// <summary>
    /// Rating score (1-10).
    /// </summary>
    public int Score { get; set; }

    /// <summary>
    /// Optional notes about the rating.
    /// </summary>
    public string? Notes { get; set; }
}
