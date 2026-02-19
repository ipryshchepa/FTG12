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
/// Integration tests for Reading Status API endpoints.
/// </summary>
public class ReadingStatusEndpointsTests : IClassFixture<ApiTestFixture>, IAsyncLifetime
{
    private readonly ApiTestFixture _factory;
    private readonly HttpClient _client;
    
    // JSON options matching the API configuration
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter() }
    };

    public ReadingStatusEndpointsTests(ApiTestFixture factory)
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
    public async Task CreateOrUpdateStatus_WithValidData_ReturnsOk()
    {
        // Arrange
        var book = ApiTestFixture.CreateTestBook();
        await _factory.SeedDataAsync(book);

        var statusDto = new ReadingStatusDto { Status = ReadingStatusEnum.Completed };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/books/{book.Id}/reading-status", statusDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        // API returns Ok() with no content
    }

    [Fact]
    public async Task CreateOrUpdateStatus_UpdatesExistingStatus()
    {
        // Arrange
        var book = ApiTestFixture.CreateTestBook();
        await _factory.SeedDataAsync(book);

        var firstStatus = new ReadingStatusDto { Status = ReadingStatusEnum.Backlog };
        await _client.PutAsJsonAsync($"/api/books/{book.Id}/reading-status", firstStatus);

        var updatedStatus = new ReadingStatusDto { Status = ReadingStatusEnum.Completed };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/books/{book.Id}/reading-status", updatedStatus);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        // API returns Ok() with no content
    }

    [Fact]
    public async Task CreateOrUpdateStatus_WithNonExistentBook_ReturnsNotFound()
    {
        // Arrange
        var statusDto = new ReadingStatusDto { Status = ReadingStatusEnum.Completed };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/books/{Guid.NewGuid()}/reading-status", statusDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DeleteStatus_WhenStatusExists_ReturnsNoContent()
    {
        // Arrange
        var book = ApiTestFixture.CreateTestBook();
        await _factory.SeedDataAsync(book);

        var statusDto = new ReadingStatusDto { Status = ReadingStatusEnum.Completed };
        await _client.PutAsJsonAsync($"/api/books/{book.Id}/reading-status", statusDto);

        // Act
        var response = await _client.DeleteAsync($"/api/books/{book.Id}/reading-status");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task DeleteStatus_WhenStatusDoesNotExist_ReturnsNotFound()
    {
        // Arrange
        var book = ApiTestFixture.CreateTestBook();
        await _factory.SeedDataAsync(book);

        // Act
        var response = await _client.DeleteAsync($"/api/books/{book.Id}/reading-status");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
