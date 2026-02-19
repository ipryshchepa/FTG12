using FluentValidation;
using PersonalLibrary.API.DTOs;

namespace PersonalLibrary.API.Validators;

/// <summary>
/// Validator for loan data transfer objects.
/// </summary>
public class LoanDtoValidator : AbstractValidator<LoanDto>
{
    /// <summary>
    /// Initializes a new instance of the LoanDtoValidator class.
    /// </summary>
    public LoanDtoValidator()
    {
        // BorrowedTo is required and max 100 chars
        RuleFor(x => x.BorrowedTo)
            .NotEmpty()
            .WithMessage("Borrower name is required.")
            .MaximumLength(100)
            .WithMessage("Borrower name must not exceed 100 characters.");
    }
}
