using System.ComponentModel.DataAnnotations;

namespace PersonalLibrary.API.Models;

/// <summary>
/// Represents the ownership status of a book in the personal library.
/// </summary>
public enum OwnershipStatus
{
    /// <summary>
    /// Book is on the wish list to be purchased.
    /// </summary>
    [Display(Name = "Want to buy")]
    WantToBuy,

    /// <summary>
    /// Book is currently owned.
    /// </summary>
    [Display(Name = "Own")]
    Own,

    /// <summary>
    /// Book was previously owned but has been sold or given away.
    /// </summary>
    [Display(Name = "Sold/Gave away")]
    SoldOrGaveAway
}
