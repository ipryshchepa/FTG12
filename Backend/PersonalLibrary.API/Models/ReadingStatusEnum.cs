using System.ComponentModel.DataAnnotations;

namespace PersonalLibrary.API.Models;

/// <summary>
/// Represents the reading status of a book.
/// </summary>
public enum ReadingStatusEnum
{
    /// <summary>
    /// Book is in the reading backlog.
    /// </summary>
    [Display(Name = "Backlog")]
    Backlog,

    /// <summary>
    /// Book has been completed.
    /// </summary>
    [Display(Name = "Completed")]
    Completed,

    /// <summary>
    /// Book reading was abandoned.
    /// </summary>
    [Display(Name = "Abandoned")]
    Abandoned
}
