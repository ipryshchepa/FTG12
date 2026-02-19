using PersonalLibrary.API.Models;

namespace PersonalLibrary.API.DTOs;

/// <summary>
/// Data transfer object for updating reading status.
/// </summary>
public class ReadingStatusDto
{
    /// <summary>
    /// Reading status identifier. Null for creation, populated for updates.
    /// </summary>
    public Guid? Id { get; set; }

    /// <summary>
    /// Reading status (Backlog, Completed, Abandoned).
    /// </summary>
    public ReadingStatusEnum Status { get; set; }
}
