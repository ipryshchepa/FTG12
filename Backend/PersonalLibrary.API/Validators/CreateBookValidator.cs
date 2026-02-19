using FluentValidation;
using PersonalLibrary.API.DTOs;

namespace PersonalLibrary.API.Validators;

/// <summary>
/// Validator for creating new books.
/// </summary>
public class CreateBookValidator : AbstractValidator<BookDto>
{
    /// <summary>
    /// Initializes a new instance of the CreateBookValidator class.
    /// </summary>
    public CreateBookValidator()
    {
        // Id must be null for creation
        RuleFor(x => x.Id)
            .Null()
            .WithMessage("Id must not be provided when creating a book.");

        // Title is required and max 100 chars
        RuleFor(x => x.Title)
            .NotEmpty()
            .WithMessage("Title is required.")
            .MaximumLength(100)
            .WithMessage("Title must not exceed 100 characters.");

        // Author is required and max 100 chars
        RuleFor(x => x.Author)
            .NotEmpty()
            .WithMessage("Author is required.")
            .MaximumLength(100)
            .WithMessage("Author must not exceed 100 characters.");

        // Description max 500 chars if provided
        RuleFor(x => x.Description)
            .MaximumLength(500)
            .WithMessage("Description must not exceed 500 characters.")
            .When(x => x.Description is not null);

        // Notes max 1000 chars if provided
        RuleFor(x => x.Notes)
            .MaximumLength(1000)
            .WithMessage("Notes must not exceed 1000 characters.")
            .When(x => x.Notes is not null);

        // ISBN max 20 chars if provided
        RuleFor(x => x.ISBN)
            .MaximumLength(20)
            .WithMessage("ISBN must not exceed 20 characters.")
            .When(x => x.ISBN is not null);

        // PublishedYear range 1000-2100 if provided
        RuleFor(x => x.PublishedYear)
            .InclusiveBetween(1000, 2100)
            .WithMessage("Published year must be between 1000 and 2100.")
            .When(x => x.PublishedYear.HasValue);

        // PageCount must be positive if provided
        RuleFor(x => x.PageCount)
            .GreaterThan(0)
            .WithMessage("Page count must be positive.")
            .When(x => x.PageCount.HasValue);

        // OwnershipStatus must be valid enum value (automatic)
        RuleFor(x => x.OwnershipStatus)
            .IsInEnum()
            .WithMessage("Invalid ownership status.");
    }
}
