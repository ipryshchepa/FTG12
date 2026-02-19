using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using PersonalLibrary.API.Exceptions;

namespace PersonalLibrary.API.Filters;

/// <summary>
/// Global exception filter that handles exceptions and returns appropriate HTTP responses.
/// </summary>
public class GlobalExceptionFilter : IExceptionFilter
{
    private readonly ILogger<GlobalExceptionFilter> _logger;
    private readonly IWebHostEnvironment _environment;

    /// <summary>
    /// Initializes a new instance of the GlobalExceptionFilter class.
    /// </summary>
    /// <param name="logger">The logger instance.</param>
    /// <param name="environment">The web host environment.</param>
    public GlobalExceptionFilter(ILogger<GlobalExceptionFilter> logger, IWebHostEnvironment environment)
    {
        _logger = logger;
        _environment = environment;
    }

    /// <inheritdoc />
    public void OnException(ExceptionContext context)
    {
        var exception = context.Exception;
        
        _logger.LogError(exception, "An unhandled exception occurred: {Message}", exception.Message);

        ProblemDetails problemDetails = exception switch
        {
            NotFoundException notFoundEx => CreateProblemDetails(
                context,
                StatusCodes.Status404NotFound,
                "Not Found",
                notFoundEx.Message),

            BadRequestException badRequestEx => CreateProblemDetails(
                context,
                StatusCodes.Status400BadRequest,
                "Bad Request",
                badRequestEx.Message),

            BusinessRuleException businessRuleEx => CreateProblemDetails(
                context,
                StatusCodes.Status409Conflict,
                "Business Rule Violation",
                businessRuleEx.Message),

            ValidationException validationEx => CreateValidationProblemDetails(
                context,
                validationEx),

            DbUpdateException dbUpdateEx => CreateProblemDetails(
                context,
                StatusCodes.Status409Conflict,
                "Database Update Error",
                "A database error occurred while processing your request"),

            _ => CreateProblemDetails(
                context,
                StatusCodes.Status500InternalServerError,
                "Internal Server Error",
                _environment.IsDevelopment() 
                    ? exception.Message 
                    : "An unexpected error occurred")
        };

        context.Result = new ObjectResult(problemDetails)
        {
            StatusCode = problemDetails.Status
        };

        context.ExceptionHandled = true;
    }

    /// <summary>
    /// Creates a ProblemDetails object for the given exception.
    /// </summary>
    /// <param name="context">The exception context.</param>
    /// <param name="statusCode">The HTTP status code.</param>
    /// <param name="title">The error title.</param>
    /// <param name="detail">The error detail message.</param>
    /// <returns>A ProblemDetails object.</returns>
    private ProblemDetails CreateProblemDetails(
        ExceptionContext context,
        int statusCode,
        string title,
        string detail)
    {
        return new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Instance = context.HttpContext.Request.Path
        };
    }

    /// <summary>
    /// Creates a ValidationProblemDetails object for FluentValidation exceptions.
    /// </summary>
    /// <param name="context">The exception context.</param>
    /// <param name="validationException">The validation exception.</param>
    /// <returns>A ValidationProblemDetails object.</returns>
    private ValidationProblemDetails CreateValidationProblemDetails(
        ExceptionContext context,
        ValidationException validationException)
    {
        var errors = validationException.Errors
            .GroupBy(e => e.PropertyName)
            .ToDictionary(
                g => g.Key,
                g => g.Select(e => e.ErrorMessage).ToArray()
            );

        return new ValidationProblemDetails(errors)
        {
            Status = StatusCodes.Status400BadRequest,
            Title = "Validation Error",
            Detail = "One or more validation errors occurred",
            Instance = context.HttpContext.Request.Path
        };
    }
}
