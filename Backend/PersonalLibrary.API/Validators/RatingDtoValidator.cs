using FluentValidation;
using PersonalLibrary.API.DTOs;

namespace PersonalLibrary.API.Validators;

/// <summary>
/// Validator for rating data transfer objects.
/// </summary>
public class RatingDtoValidator : AbstractValidator<RatingDto>
{
    /// <summary>
    /// Initializes a new instance of the RatingDtoValidator class.
    /// </summary>
    public RatingDtoValidator()
    {
        // Score is required and must be between 1-10
        RuleFor(x => x.Score)
            .InclusiveBetween(1, 10)
            .WithMessage("Score must be between 1 and 10.");

        // Notes max 1000 chars if provided
        RuleFor(x => x.Notes)
            .MaximumLength(1000)
            .WithMessage("Notes must not exceed 1000 characters.")
            .When(x => x.Notes is not null);
    }
}
