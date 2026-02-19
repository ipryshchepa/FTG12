using FluentAssertions;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using PersonalLibrary.API.Exceptions;
using PersonalLibrary.API.Filters;

namespace PersonalLibrary.API.Tests.Filters;

/// <summary>
/// Tests for GlobalExceptionFilter.
/// </summary>
public class GlobalExceptionFilterTests
{
    private readonly Mock<ILogger<GlobalExceptionFilter>> _mockLogger;
    private readonly Mock<IWebHostEnvironment> _mockEnvironment;
    private readonly GlobalExceptionFilter _filter;

    public GlobalExceptionFilterTests()
    {
        _mockLogger = new Mock<ILogger<GlobalExceptionFilter>>();
        _mockEnvironment = new Mock<IWebHostEnvironment>();
        _filter = new GlobalExceptionFilter(_mockLogger.Object, _mockEnvironment.Object);
    }

    [Fact]
    public void OnException_WithNotFoundException_Returns404()
    {
        // Arrange
        var exception = new NotFoundException("Resource not found");
        var context = CreateExceptionContext(exception);

        // Act
        _filter.OnException(context);

        // Assert
        context.ExceptionHandled.Should().BeTrue();
        var result = context.Result.Should().BeOfType<ObjectResult>().Subject;
        result.StatusCode.Should().Be(StatusCodes.Status404NotFound);
        
        var problemDetails = result.Value.Should().BeOfType<ProblemDetails>().Subject;
        problemDetails.Status.Should().Be(StatusCodes.Status404NotFound);
        problemDetails.Title.Should().Be("Not Found");
        problemDetails.Detail.Should().Be("Resource not found");
    }

    [Fact]
    public void OnException_WithBadRequestException_Returns400()
    {
        // Arrange
        var exception = new BadRequestException("Invalid request");
        var context = CreateExceptionContext(exception);

        // Act
        _filter.OnException(context);

        // Assert
        context.ExceptionHandled.Should().BeTrue();
        var result = context.Result.Should().BeOfType<ObjectResult>().Subject;
        result.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
        
        var problemDetails = result.Value.Should().BeOfType<ProblemDetails>().Subject;
        problemDetails.Status.Should().Be(StatusCodes.Status400BadRequest);
        problemDetails.Title.Should().Be("Bad Request");
        problemDetails.Detail.Should().Be("Invalid request");
    }

    [Fact]
    public void OnException_WithBusinessRuleException_Returns409()
    {
        // Arrange
        var exception = new BusinessRuleException("Business rule violated");
        var context = CreateExceptionContext(exception);

        // Act
        _filter.OnException(context);

        // Assert
        context.ExceptionHandled.Should().BeTrue();
        var result = context.Result.Should().BeOfType<ObjectResult>().Subject;
        result.StatusCode.Should().Be(StatusCodes.Status409Conflict);
        
        var problemDetails = result.Value.Should().BeOfType<ProblemDetails>().Subject;
        problemDetails.Status.Should().Be(StatusCodes.Status409Conflict);
        problemDetails.Title.Should().Be("Business Rule Violation");
        problemDetails.Detail.Should().Be("Business rule violated");
    }

    [Fact]
    public void OnException_WithValidationException_Returns400WithValidationDetails()
    {
        // Arrange
        var failures = new List<ValidationFailure>
        {
            new ValidationFailure("Title", "Title is required"),
            new ValidationFailure("Title", "Title must be at least 3 characters"),
            new ValidationFailure("Author", "Author is required")
        };
        var exception = new ValidationException(failures);
        var context = CreateExceptionContext(exception);

        // Act
        _filter.OnException(context);

        // Assert
        context.ExceptionHandled.Should().BeTrue();
        var result = context.Result.Should().BeOfType<ObjectResult>().Subject;
        result.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
        
        var problemDetails = result.Value.Should().BeOfType<ValidationProblemDetails>().Subject;
        problemDetails.Status.Should().Be(StatusCodes.Status400BadRequest);
        problemDetails.Title.Should().Be("Validation Error");
        problemDetails.Detail.Should().Be("One or more validation errors occurred");
        
        problemDetails.Errors.Should().ContainKey("Title");
        problemDetails.Errors["Title"].Should().HaveCount(2);
        problemDetails.Errors.Should().ContainKey("Author");
        problemDetails.Errors["Author"].Should().HaveCount(1);
    }

    [Fact]
    public void OnException_WithDbUpdateException_Returns409()
    {
        // Arrange
        var exception = new DbUpdateException("Database update failed");
        var context = CreateExceptionContext(exception);

        // Act
        _filter.OnException(context);

        // Assert
        context.ExceptionHandled.Should().BeTrue();
        var result = context.Result.Should().BeOfType<ObjectResult>().Subject;
        result.StatusCode.Should().Be(StatusCodes.Status409Conflict);
        
        var problemDetails = result.Value.Should().BeOfType<ProblemDetails>().Subject;
        problemDetails.Status.Should().Be(StatusCodes.Status409Conflict);
        problemDetails.Title.Should().Be("Database Update Error");
        problemDetails.Detail.Should().Be("A database error occurred while processing your request");
    }

    [Fact]
    public void OnException_WithUnhandledException_InDevelopment_Returns500WithDetailedMessage()
    {
        // Arrange
        _mockEnvironment.Setup(e => e.EnvironmentName).Returns("Development");
        var exception = new InvalidOperationException("Something went wrong");
        var context = CreateExceptionContext(exception);

        // Act
        _filter.OnException(context);

        // Assert
        context.ExceptionHandled.Should().BeTrue();
        var result = context.Result.Should().BeOfType<ObjectResult>().Subject;
        result.StatusCode.Should().Be(StatusCodes.Status500InternalServerError);
        
        var problemDetails = result.Value.Should().BeOfType<ProblemDetails>().Subject;
        problemDetails.Status.Should().Be(StatusCodes.Status500InternalServerError);
        problemDetails.Title.Should().Be("Internal Server Error");
        problemDetails.Detail.Should().Be("Something went wrong");
    }

    [Fact]
    public void OnException_WithUnhandledException_InProduction_Returns500WithGenericMessage()
    {
        // Arrange
        _mockEnvironment.Setup(e => e.EnvironmentName).Returns("Production");
        var exception = new InvalidOperationException("Something went wrong");
        var context = CreateExceptionContext(exception);

        // Act
        _filter.OnException(context);

        // Assert
        context.ExceptionHandled.Should().BeTrue();
        var result = context.Result.Should().BeOfType<ObjectResult>().Subject;
        result.StatusCode.Should().Be(StatusCodes.Status500InternalServerError);
        
        var problemDetails = result.Value.Should().BeOfType<ProblemDetails>().Subject;
        problemDetails.Status.Should().Be(StatusCodes.Status500InternalServerError);
        problemDetails.Title.Should().Be("Internal Server Error");
        problemDetails.Detail.Should().Be("An unexpected error occurred");
    }

    [Fact]
    public void OnException_LogsException()
    {
        // Arrange
        var exception = new NotFoundException("Resource not found");
        var context = CreateExceptionContext(exception);

        // Act
        _filter.OnException(context);

        // Assert
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => true),
                exception,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public void OnException_SetsInstanceToRequestPath()
    {
        // Arrange
        var exception = new NotFoundException("Resource not found");
        var context = CreateExceptionContext(exception, "/api/books/123");

        // Act
        _filter.OnException(context);

        // Assert
        var result = context.Result.Should().BeOfType<ObjectResult>().Subject;
        var problemDetails = result.Value.Should().BeOfType<ProblemDetails>().Subject;
        problemDetails.Instance.Should().Be("/api/books/123");
    }

    /// <summary>
    /// Creates a mock ExceptionContext for testing.
    /// </summary>
    private ExceptionContext CreateExceptionContext(Exception exception, string path = "/api/test")
    {
        var httpContext = new DefaultHttpContext();
        httpContext.Request.Path = path;

        var actionContext = new ActionContext(
            httpContext,
            new RouteData(),
            new ActionDescriptor());

        return new ExceptionContext(actionContext, new List<IFilterMetadata>())
        {
            Exception = exception
        };
    }
}
