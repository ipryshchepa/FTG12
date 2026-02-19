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
/// Integration tests for Ratings API endpoints.
/// </summary>
public class RatingEndpointsTests : IClassFixture<ApiTestFixture>, IAsyncLifetime
{
    private readonly ApiTestFixture _factory;
    private readonly HttpClient _client;
    
    // JSON options matching the API configuration
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter() }
    };

    public RatingEndpointsTests(ApiTestFixture factory)
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
    public async Task CreateRating_WithValidData_ReturnsOk()
    {
        // Arrange
        var book = ApiTestFixture.CreateTestBook();
        await _factory.SeedDataAsync(book);

        var ratingDto = new RatingDto
        {
            Score = 8,
            Notes = "Great book!"
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/books/{book.Id}/rating", ratingDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        // Verify rating was created by creating another one (which will update)
        // Since API doesn't return the rating, we can't verify content directly
    }

    [Fact]
    public async Task CreateRating_ForSameBookTwice_UpdatesExistingRating()
    {
        // Arrange
        var book = ApiTestFixture.CreateTestBook();
        await _factory.SeedDataAsync(book);

        var firstRating = new RatingDto { Score = 6, Notes = "Good" };
        await _client.PostAsJsonAsync($"/api/books/{book.Id}/rating", firstRating);

        var secondRating = new RatingDto { Score = 9, Notes = "Excellent after rereading" };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/books/{book.Id}/rating", secondRating);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        // API returns Ok() with no content, so we just verify status
    }

    [Fact]
    public async Task CreateRating_WithInvalidScore_ReturnsBadRequest()
    {
        // Arrange
        var book = ApiTestFixture.CreateTestBook();
        await _factory.SeedDataAsync(book);

        var ratingDto = new RatingDto { Score = 11 }; // Invalid: max is 10

        // Act
        var response = await _client.PostAsJsonAsync($"/api/books/{book.Id}/rating", ratingDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateRating_WithScoreBelowMinimum_ReturnsBadRequest()
    {
        // Arrange
        var book = ApiTestFixture.CreateTestBook();
        await _factory.SeedDataAsync(book);

        var ratingDto = new RatingDto { Score = 0 }; // Invalid: min is 1

        // Act
        var response = await _client.PostAsJsonAsync($"/api/books/{book.Id}/rating", ratingDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateRating_WithNonExistentBook_ReturnsNotFound()
    {
        // Arrange
        var ratingDto = new RatingDto { Score = 8, Notes = "Great" };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/books/{Guid.NewGuid()}/rating", ratingDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DeleteRating_WhenRatingExists_ReturnsNoContent()
    {
        // Arrange
        var book = ApiTestFixture.CreateTestBook();
        await _factory.SeedDataAsync(book);

        var ratingDto = new RatingDto { Score = 7 };
        await _client.PostAsJsonAsync($"/api/books/{book.Id}/rating", ratingDto);

        // Act
        var response = await _client.DeleteAsync($"/api/books/{book.Id}/rating");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task DeleteRating_WhenRatingDoesNotExist_ReturnsNotFound()
    {
        // Arrange
        var book = ApiTestFixture.CreateTestBook();
        await _factory.SeedDataAsync(book);

        // Act
        var response = await _client.DeleteAsync($"/api/books/{book.Id}/rating");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
