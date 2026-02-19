using FluentValidation.TestHelper;
using PersonalLibrary.API.DTOs;
using PersonalLibrary.API.Validators;

namespace PersonalLibrary.API.Tests.Validators;

/// <summary>
/// Tests for RatingDtoValidator validation rules.
/// </summary>
public class RatingDtoValidatorTests
{
    private readonly RatingDtoValidator _validator;

    public RatingDtoValidatorTests()
    {
        _validator = new RatingDtoValidator();
    }

    [Fact]
    public void Validate_WithScoreBelowMinimum_ShouldHaveError()
    {
        // Arrange
        var ratingDto = new RatingDto { Score = 0 };

        // Act
        var result = _validator.TestValidate(ratingDto);

        // Assert
        result.ShouldHaveValidationErrorFor(r => r.Score);
    }

    [Fact]
    public void Validate_WithScoreAboveMaximum_ShouldHaveError()
    {
        // Arrange
        var ratingDto = new RatingDto { Score = 11 };

        // Act
        var result = _validator.TestValidate(ratingDto);

        // Assert
        result.ShouldHaveValidationErrorFor(r => r.Score);
    }

    [Fact]
    public void Validate_WithScoreInValidRange_ShouldNotHaveError()
    {
        // Arrange
        var ratingDto = new RatingDto { Score = 5 };

        // Act
        var result = _validator.TestValidate(ratingDto);

        // Assert
        result.ShouldNotHaveValidationErrorFor(r => r.Score);
    }

    [Fact]
    public void Validate_WithNotesExceedingMaxLength_ShouldHaveError()
    {
        // Arrange
        var ratingDto = new RatingDto
        {
            Score = 8,
            Notes = new string('A', 1001)
        };

        // Act
        var result = _validator.TestValidate(ratingDto);

        // Assert
        result.ShouldHaveValidationErrorFor(r => r.Notes);
    }

    [Fact]
    public void Validate_WithValidData_ShouldNotHaveErrors()
    {
        // Arrange
        var ratingDto = new RatingDto
        {
            Score = 8,
            Notes = "Great book with compelling narrative"
        };

        // Act
        var result = _validator.TestValidate(ratingDto);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }
}
