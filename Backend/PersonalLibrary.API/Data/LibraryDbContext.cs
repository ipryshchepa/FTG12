using Microsoft.EntityFrameworkCore;
using PersonalLibrary.API.Models;

namespace PersonalLibrary.API.Data;

/// <summary>
/// Database context for the Personal Library application.
/// </summary>
public class LibraryDbContext : DbContext
{
    /// <summary>
    /// Initializes a new instance of the LibraryDbContext class.
    /// </summary>
    /// <param name="options">The options for this context.</param>
    public LibraryDbContext(DbContextOptions<LibraryDbContext> options) : base(options)
    {
    }

    /// <summary>
    /// Gets or sets the Books DbSet.
    /// </summary>
    public DbSet<Book> Books { get; set; }

    /// <summary>
    /// Gets or sets the Ratings DbSet.
    /// </summary>
    public DbSet<Rating> Ratings { get; set; }

    /// <summary>
    /// Gets or sets the ReadingStatuses DbSet.
    /// </summary>
    public DbSet<ReadingStatus> ReadingStatuses { get; set; }

    /// <summary>
    /// Gets or sets the Loans DbSet.
    /// </summary>
    public DbSet<Loan> Loans { get; set; }

    /// <summary>
    /// Configures the model relationships and constraints.
    /// </summary>
    /// <param name="modelBuilder">The builder being used to construct the model for this context.</param>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Book entity
        modelBuilder.Entity<Book>(entity =>
        {
            entity.HasKey(b => b.Id);

            entity.Property(b => b.Title)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(b => b.Author)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(b => b.Description)
                .HasMaxLength(500);

            entity.Property(b => b.Notes)
                .HasMaxLength(1000);

            entity.Property(b => b.ISBN)
                .HasMaxLength(20);

            entity.Property(b => b.OwnershipStatus)
                .IsRequired()
                .HasConversion<string>()
                .HasDefaultValue(OwnershipStatus.WantToBuy);

            // Configure relationships
            entity.HasOne(b => b.Rating)
                .WithOne(r => r.Book)
                .HasForeignKey<Rating>(r => r.BookId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(b => b.ReadingStatus)
                .WithOne(rs => rs.Book)
                .HasForeignKey<ReadingStatus>(rs => rs.BookId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(b => b.Loans)
                .WithOne(l => l.Book)
                .HasForeignKey(l => l.BookId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure Rating entity
        modelBuilder.Entity<Rating>(entity =>
        {
            entity.HasKey(r => r.Id);

            entity.Property(r => r.Score)
                .IsRequired();

            entity.Property(r => r.Notes)
                .HasMaxLength(1000);

            // Unique index on BookId (one rating per book)
            entity.HasIndex(r => r.BookId)
                .IsUnique();

            // Check constraint for Score range (1-10)
            entity.ToTable(t => t.HasCheckConstraint("CK_Rating_Score", "[Score] >= 1 AND [Score] <= 10"));
        });

        // Configure ReadingStatus entity
        modelBuilder.Entity<ReadingStatus>(entity =>
        {
            entity.HasKey(rs => rs.Id);

            entity.Property(rs => rs.Status)
                .IsRequired()
                .HasConversion<string>();

            // Unique index on BookId (one reading status per book)
            entity.HasIndex(rs => rs.BookId)
                .IsUnique();
        });

        // Configure Loan entity
        modelBuilder.Entity<Loan>(entity =>
        {
            entity.HasKey(l => l.Id);

            entity.Property(l => l.BorrowedTo)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(l => l.LoanDate)
                .IsRequired();

            entity.Property(l => l.IsReturned)
                .IsRequired()
                .HasDefaultValue(false);

            // Index on IsReturned for efficient querying of active loans
            entity.HasIndex(l => l.IsReturned);
        });
    }
}
