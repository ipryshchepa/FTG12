using FluentValidation.TestHelper;
using PersonalLibrary.API.DTOs;
using PersonalLibrary.API.Validators;

namespace PersonalLibrary.API.Tests.Validators;

/// <summary>
/// Tests for LoanDtoValidator validation rules.
/// </summary>
public class LoanDtoValidatorTests
{
    private readonly LoanDtoValidator _validator;

    public LoanDtoValidatorTests()
    {
        _validator = new LoanDtoValidator();
    }

    [Fact]
    public void Validate_WithMissingBorrowedTo_ShouldHaveError()
    {
        // Arrange
        var loanDto = new LoanDto { BorrowedTo = string.Empty };

        // Act
        var result = _validator.TestValidate(loanDto);

        // Assert
        result.ShouldHaveValidationErrorFor(l => l.BorrowedTo);
    }

    [Fact]
    public void Validate_WithBorrowedToExceedingMaxLength_ShouldHaveError()
    {
        // Arrange
        var loanDto = new LoanDto { BorrowedTo = new string('A', 101) };

        // Act
        var result = _validator.TestValidate(loanDto);

        // Assert
        result.ShouldHaveValidationErrorFor(l => l.BorrowedTo);
    }

    [Fact]
    public void Validate_WithValidData_ShouldNotHaveErrors()
    {
        // Arrange
        var loanDto = new LoanDto { BorrowedTo = "John Doe" };

        // Act
        var result = _validator.TestValidate(loanDto);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }
}
