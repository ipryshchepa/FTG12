using FluentAssertions;
using FluentValidation.TestHelper;
using PersonalLibrary.API.DTOs;
using PersonalLibrary.API.Models;
using PersonalLibrary.API.Validators;

namespace PersonalLibrary.API.Tests.Validators;

/// <summary>
/// Tests for CreateBookValidator validation rules.
/// </summary>
public class CreateBookValidatorTests
{
    private readonly CreateBookValidator _validator;

    public CreateBookValidatorTests()
    {
        _validator = new CreateBookValidator();
    }

    [Fact]
    public void Validate_WithNullId_ShouldNotHaveError()
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
        result.ShouldNotHaveValidationErrorFor(b => b.Id);
    }

    [Fact]
    public void Validate_WithNonNullId_ShouldHaveError()
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
        result.ShouldHaveValidationErrorFor(b => b.Id)
            .WithErrorMessage("Id must not be provided when creating a book.");
    }

    [Fact]
    public void Validate_WithMissingTitle_ShouldHaveError()
    {
        // Arrange
        var bookDto = new BookDto
        {
            Id = null,
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
            Id = null,
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
    public void Validate_WithMissingAuthor_ShouldHaveError()
    {
        // Arrange
        var bookDto = new BookDto
        {
            Id = null,
            Title = "Test Book",
            Author = string.Empty,
            OwnershipStatus = OwnershipStatus.Own
        };

        // Act
        var result = _validator.TestValidate(bookDto);

        // Assert
        result.ShouldHaveValidationErrorFor(b => b.Author);
    }

    [Fact]
    public void Validate_WithAuthorExceedingMaxLength_ShouldHaveError()
    {
        // Arrange
        var bookDto = new BookDto
        {
            Id = null,
            Title = "Test Book",
            Author = new string('A', 101),
            OwnershipStatus = OwnershipStatus.Own
        };

        // Act
        var result = _validator.TestValidate(bookDto);

        // Assert
        result.ShouldHaveValidationErrorFor(b => b.Author);
    }

    [Fact]
    public void Validate_WithDescriptionExceedingMaxLength_ShouldHaveError()
    {
        // Arrange
        var bookDto = new BookDto
        {
            Id = null,
            Title = "Test Book",
            Author = "Author McAuthorface",
            Description = new string('A', 501),
            OwnershipStatus = OwnershipStatus.Own
        };

        // Act
        var result = _validator.TestValidate(bookDto);

        // Assert
        result.ShouldHaveValidationErrorFor(b => b.Description);
    }

    [Fact]
    public void Validate_WithNotesExceedingMaxLength_ShouldHaveError()
    {
        // Arrange
        var bookDto = new BookDto
        {
            Id = null,
            Title = "Test Book",
            Author = "Author McAuthorface",
            Notes = new string('A', 1001),
            OwnershipStatus = OwnershipStatus.Own
        };

        // Act
        var result = _validator.TestValidate(bookDto);

        // Assert
        result.ShouldHaveValidationErrorFor(b => b.Notes);
    }

    [Fact]
    public void Validate_WithISBNExceedingMaxLength_ShouldHaveError()
    {
        // Arrange
        var bookDto = new BookDto
        {
            Id = null,
            Title = "Test Book",
            Author = "Author McAuthorface",
            ISBN = new string('1', 21),
            OwnershipStatus = OwnershipStatus.Own
        };

        // Act
        var result = _validator.TestValidate(bookDto);

        // Assert
        result.ShouldHaveValidationErrorFor(b => b.ISBN);
    }

    [Fact]
    public void Validate_WithPublishedYearOutOfRange_ShouldHaveError()
    {
        // Arrange
        var bookDto = new BookDto
        {
            Id = null,
            Title = "Test Book",
            Author = "Author McAuthorface",
            PublishedYear = 999,
            OwnershipStatus = OwnershipStatus.Own
        };

        // Act
        var result = _validator.TestValidate(bookDto);

        // Assert
        result.ShouldHaveValidationErrorFor(b => b.PublishedYear);
    }

    [Fact]
    public void Validate_WithNegativePageCount_ShouldHaveError()
    {
        // Arrange
        var bookDto = new BookDto
        {
            Id = null,
            Title = "Test Book",
            Author = "Author McAuthorface",
            PageCount = -1,
            OwnershipStatus = OwnershipStatus.Own
        };

        // Act
        var result = _validator.TestValidate(bookDto);

        // Assert
        result.ShouldHaveValidationErrorFor(b => b.PageCount);
    }

    [Fact]
    public void Validate_WithValidData_ShouldNotHaveErrors()
    {
        // Arrange
        var bookDto = new BookDto
        {
            Id = null,
            Title = "Test Book",
            Author = "Author McAuthorface",
            Description = "A great book",
            ISBN = "978-3-16-148410-0",
            PublishedYear = 2020,
            PageCount = 350,
            OwnershipStatus = OwnershipStatus.Own
        };

        // Act
        var result = _validator.TestValidate(bookDto);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }
}
