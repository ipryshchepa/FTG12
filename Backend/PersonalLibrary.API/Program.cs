using System.Text.Json.Serialization;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using PersonalLibrary.API.Data;
using PersonalLibrary.API.Filters;
using PersonalLibrary.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Add DbContext with SQL Server
builder.Services.AddDbContext<LibraryDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add FluentValidation validators from the Validators namespace
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

// Register repositories
builder.Services.AddScoped<IBookRepository, BookRepository>();
builder.Services.AddScoped<IRatingRepository, RatingRepository>();
builder.Services.AddScoped<ILoanRepository, LoanRepository>();
builder.Services.AddScoped<IReadingStatusRepository, ReadingStatusRepository>();

// Register services
builder.Services.AddScoped<IBookService, BookService>();
builder.Services.AddScoped<IRatingService, RatingService>();
builder.Services.AddScoped<ILoanService, LoanService>();
builder.Services.AddScoped<IReadingStatusService, ReadingStatusService>();

// Add controllers with global exception filter
builder.Services.AddControllers(options =>
{
    options.Filters.Add<GlobalExceptionFilter>();
})
.AddJsonOptions(options =>
{
    // Convert enums to strings in JSON
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    // Use camelCase for property names
    options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
});

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins(
                    "http://localhost:5173",      // Frontend dev server
                    "http://localhost:5000",      // Alternative port
                    "http://frontend",            // Docker internal
                    "http://frontend:80"          // Docker internal with port
                  )
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

// Comment out HTTPS redirection for Docker - re-enable for production with proper certificates
// app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

// Map controllers
app.MapControllers();

// Health check endpoint
app.MapGet("/api/health", () =>
{
    return Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow });
})
.WithName("HealthCheck");

app.Run();
