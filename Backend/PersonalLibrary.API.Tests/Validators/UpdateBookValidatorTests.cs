using FluentAssertions;
using FluentValidation.TestHelper;
using PersonalLibrary.API.DTOs;
using PersonalLibrary.API.Models;
using PersonalLibrary.API.Validators;

namespace PersonalLibrary.API.Tests.Validators;

/// <summary>
/// Tests for UpdateBookValidator validation rules.
/// </summary>
public class UpdateBookValidatorTests
{
    private readonly UpdateBookValidator _validator;

    public UpdateBookValidatorTests()
    {
        _validator = new UpdateBookValidator();
    }

    [Fact]
    public void Validate_WithNullId_ShouldHaveError()
    {
        // Arrange
        var bookDto = new BookDto
        {
            Id = null,
            Title = "Test Book",
            Author = "Author McAuthorface",
            OwnershipStatus = OwnershipStatus.Own
        };

        // Act
        var result = _validator.TestValidate(bookDto);

        // Assert
        result.ShouldHaveValidationErrorFor(b => b.Id)
            .WithErrorMessage("Id must be provided when updating a book.");
    }

    [Fact]
    public void Validate_WithValidId_ShouldNotHaveError()
    {
        // Arrange
        var bookDto = new BookDto
        {
            Id = Guid.NewGuid(),
            Title = "Test Book",
            Author = "Author McAuthorface",
            OwnershipStatus = OwnershipStatus.Own
        };

        // Act
        var result = _validator.TestValidate(bookDto);

        // Assert
        result.ShouldNotHaveValidationErrorFor(b => b.Id);
    }

    [Fact]
    public void Validate_WithMissingTitle_ShouldHaveError()
    {
        // Arrange
        var bookDto = new BookDto
        {
            Id = Guid.NewGuid(),
            Title = string.Empty,
            Author = "Author McAuthorface",
            OwnershipStatus = OwnershipStatus.Own
        };

        // Act
        var result = _validator.TestValidate(bookDto);

        // Assert
        result.ShouldHaveValidationErrorFor(b => b.Title);
    }

    [Fact]
    public void Validate_WithTitleExceedingMaxLength_ShouldHaveError()
    {
        // Arrange
        var bookDto = new BookDto
        {
            Id = Guid.NewGuid(),
            Title = new string('A', 101),
            Author = "Author McAuthorface",
            OwnershipStatus = OwnershipStatus.Own
        };

        // Act
        var result = _validator.TestValidate(bookDto);

        // Assert
        result.ShouldHaveValidationErrorFor(b => b.Title);
    }

    [Fact]
    public void Validate_WithValidData_ShouldNotHaveErrors()
    {
        // Arrange
        var bookDto = new BookDto
        {
            Id = Guid.NewGuid(),
            Title = "Updated Book",
            Author = "Author McAuthorface",
            Description = "Updated description",
            PublishedYear = 2021,
            PageCount = 400,
            OwnershipStatus = OwnershipStatus.Own
        };

        // Act
        var result = _validator.TestValidate(bookDto);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }
}
