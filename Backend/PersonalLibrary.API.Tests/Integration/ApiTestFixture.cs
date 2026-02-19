using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using PersonalLibrary.API.Data;
using PersonalLibrary.API.Models;

namespace PersonalLibrary.API.Tests.Integration;

/// <summary>
/// Custom WebApplicationFactory for integration testing with in-memory database.
/// </summary>
public class ApiTestFixture : WebApplicationFactory<Program>
{
    private readonly string _databaseName = $"TestDatabase_{Guid.NewGuid()}";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        
        builder.ConfigureTestServices(services =>
        {
            // Find and remove the SQL Server DbContext registration
            var dbContextOptions = services.FirstOrDefault(x =>
                x.ServiceType == typeof(DbContextOptions<LibraryDbContext>));

            if (dbContextOptions != null)
                services.Remove(dbContextOptions);

            // Register InMemory database
            services.AddDbContext<LibraryDbContext>(options =>
                options.UseInMemoryDatabase(_databaseName),
                ServiceLifetime.Scoped);
        });
    }

    /// <summary>
    /// Ensures the database is created. Call this from test setup/constructor.
    /// </summary>
    public async Task EnsureDatabaseCreatedAsync()
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<LibraryDbContext>();
        await db.Database.EnsureCreatedAsync();
    }

    /// <summary>
    /// Seeds the database with test data.
    /// </summary>
    /// <param name="books">Books to seed.</param>
    public async Task SeedDataAsync(params Book[] books)
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<LibraryDbContext>();
        
        db.Books.AddRange(books);
        await db.SaveChangesAsync();
    }

    /// <summary>
    /// Creates a test book with Author McAuthorface.
    /// </summary>
    public static Book CreateTestBook(string title = "Test Book", OwnershipStatus status = OwnershipStatus.Own)
    {
        return new Book
        {
            Title = title,
            Author = "Author McAuthorface",
            OwnershipStatus = status
        };
    }
}
