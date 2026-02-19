using FluentValidation.TestHelper;
using PersonalLibrary.API.DTOs;
using PersonalLibrary.API.Models;
using PersonalLibrary.API.Validators;

namespace PersonalLibrary.API.Tests.Validators;

/// <summary>
/// Tests for ReadingStatusDtoValidator validation rules.
/// </summary>
public class ReadingStatusDtoValidatorTests
{
    private readonly ReadingStatusDtoValidator _validator;

    public ReadingStatusDtoValidatorTests()
    {
        _validator = new ReadingStatusDtoValidator();
    }

    [Fact]
    public void Validate_WithValidBacklogStatus_ShouldNotHaveError()
    {
        // Arrange
        var statusDto = new ReadingStatusDto { Status = ReadingStatusEnum.Backlog };

        // Act
        var result = _validator.TestValidate(statusDto);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_WithValidCompletedStatus_ShouldNotHaveError()
    {
        // Arrange
        var statusDto = new ReadingStatusDto { Status = ReadingStatusEnum.Completed };

        // Act
        var result = _validator.TestValidate(statusDto);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_WithValidAbandonedStatus_ShouldNotHaveError()
    {
        // Arrange
        var statusDto = new ReadingStatusDto { Status = ReadingStatusEnum.Abandoned };

        // Act
        var result = _validator.TestValidate(statusDto);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }
}
