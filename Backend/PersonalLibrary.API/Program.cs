var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

// Health check endpoint
app.MapGet("/api/health", () =>
{
    return Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow });
})
.WithName("HealthCheck");

// Sample library endpoint
app.MapGet("/api/books", () =>
{
    var books = new[]
    {
        new { Id = 1, Title = "The Great Gatsby", Author = "F. Scott Fitzgerald", Year = 1925 },
        new { Id = 2, Title = "To Kill a Mockingbird", Author = "Harper Lee", Year = 1960 },
        new { Id = 3, Title = "1984", Author = "George Orwell", Year = 1949 }
    };
    return Results.Ok(books);
})
.WithName("GetBooks");

app.Run();
