using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using PersonalLibrary.API.Data;
using PersonalLibrary.API.DTOs;
using PersonalLibrary.API.Models;

namespace PersonalLibrary.API.Tests.Integration;

/// <summary>
/// Integration tests for Loans API endpoints.
/// </summary>
public class LoanEndpointsTests : IClassFixture<ApiTestFixture>, IAsyncLifetime
{
    private readonly ApiTestFixture _factory;
    private readonly HttpClient _client;
    
    // JSON options matching the API configuration
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter() },
        ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles
    };

    public LoanEndpointsTests(ApiTestFixture factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    public async Task InitializeAsync()
    {
        // Ensure clean database for each test
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<LibraryDbContext>();
        await db.Database.EnsureDeletedAsync();
        await db.Database.EnsureCreatedAsync();
    }

    public Task DisposeAsync() => Task.CompletedTask;

    [Fact]
    public async Task GetActiveLoans_ReturnsOnlyActiveLoans()
    {
        // Arrange
        var book = ApiTestFixture.CreateTestBook();
        await _factory.SeedDataAsync(book);

        var loanDto = new LoanDto { BorrowedTo = "John Doe" };
        await _client.PostAsJsonAsync($"/api/books/{book.Id}/loan", loanDto);

        // Act
        var response = await _client.GetAsync("/api/loans");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var loans = await response.Content.ReadFromJsonAsync<List<Loan>>(JsonOptions);
        loans.Should().NotBeNull();
        loans.Should().HaveCount(1);
        loans![0].BorrowedTo.Should().Be("John Doe");
        loans[0].IsReturned.Should().BeFalse();
    }

    [Fact]
    public async Task GetLoanHistory_ReturnsAllLoansForBook()
    {
        // Arrange
        var book = ApiTestFixture.CreateTestBook();
        await _factory.SeedDataAsync(book);

        // Create and return a loan
        var loanDto = new LoanDto { BorrowedTo = "Person 1" };
        await _client.PostAsJsonAsync($"/api/books/{book.Id}/loan", loanDto);
        await _client.DeleteAsync($"/api/books/{book.Id}/loan");

        // Create another loan
        var secondLoanDto = new LoanDto { BorrowedTo = "Person 2" };
        await _client.PostAsJsonAsync($"/api/books/{book.Id}/loan", secondLoanDto);

        // Act
        var response = await _client.GetAsync($"/api/books/{book.Id}/loans");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var loans = await response.Content.ReadFromJsonAsync<List<Loan>>(JsonOptions);
        loans.Should().NotBeNull();
        loans.Should().HaveCount(2);
    }

    [Fact]
    public async Task CreateLoan_WithValidData_ReturnsCreated()
    {
        // Arrange
        var book = ApiTestFixture.CreateTestBook();
        await _factory.SeedDataAsync(book);

        var loanDto = new LoanDto { BorrowedTo = "Jane Smith" };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/books/{book.Id}/loan", loanDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        // Location header not set by controller
    }

    [Fact]
    public async Task CreateLoan_WhenBookAlreadyLoaned_ReturnsConflict()
    {
        // Arrange
        var book = ApiTestFixture.CreateTestBook();
        await _factory.SeedDataAsync(book);

        var firstLoan = new LoanDto { BorrowedTo = "Person 1" };
        await _client.PostAsJsonAsync($"/api/books/{book.Id}/loan", firstLoan);

        var secondLoan = new LoanDto { BorrowedTo = "Person 2" };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/books/{book.Id}/loan", secondLoan);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task CreateLoan_WithNonExistentBook_ReturnsNotFound()
    {
        // Arrange
        var loanDto = new LoanDto { BorrowedTo = "John Doe" };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/books/{Guid.NewGuid()}/loan", loanDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task ReturnBook_WhenLoanExists_ReturnsNoContent()
    {
        // Arrange
        var book = ApiTestFixture.CreateTestBook();
        await _factory.SeedDataAsync(book);

        var loanDto = new LoanDto { BorrowedTo = "John Doe" };
        await _client.PostAsJsonAsync($"/api/books/{book.Id}/loan", loanDto);

        // Act
        var response = await _client.DeleteAsync($"/api/books/{book.Id}/loan");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // Verify loan no longer appears in active loans
        var activeLoansResponse = await _client.GetAsync("/api/loans");
        var activeLoans = await activeLoansResponse.Content.ReadFromJsonAsync<List<Loan>>(JsonOptions);
        activeLoans.Should().BeEmpty();
    }

    [Fact]
    public async Task ReturnBook_WhenNoActiveLoan_ReturnsNotFound()
    {
        // Arrange
        var book = ApiTestFixture.CreateTestBook();
        await _factory.SeedDataAsync(book);

        // Act
        var response = await _client.DeleteAsync($"/api/books/{book.Id}/loan");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
