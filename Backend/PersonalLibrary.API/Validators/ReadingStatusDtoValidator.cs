using FluentValidation;
using PersonalLibrary.API.DTOs;

namespace PersonalLibrary.API.Validators;

/// <summary>
/// Validator for reading status data transfer objects.
/// </summary>
public class ReadingStatusDtoValidator : AbstractValidator<ReadingStatusDto>
{
    /// <summary>
    /// Initializes a new instance of the ReadingStatusDtoValidator class.
    /// </summary>
    public ReadingStatusDtoValidator()
    {
        // Status must be valid enum value
        RuleFor(x => x.Status)
            .IsInEnum()
            .WithMessage("Invalid reading status.");
    }
}
