using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PersonalLibrary.API.Migrations
{
    /// <inheritdoc />
    public partial class SeedTestData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Define book IDs for reference
            var book1Id = new Guid("11111111-1111-1111-1111-111111111111");
            var book2Id = new Guid("22222222-2222-2222-2222-222222222222");
            var book3Id = new Guid("33333333-3333-3333-3333-333333333333");
            var book4Id = new Guid("44444444-4444-4444-4444-444444444444");
            var book5Id = new Guid("55555555-5555-5555-5555-555555555555");
            var book6Id = new Guid("66666666-6666-6666-6666-666666666666");
            var book7Id = new Guid("77777777-7777-7777-7777-777777777777");
            var book8Id = new Guid("88888888-8888-8888-8888-888888888888");
            var book9Id = new Guid("99999999-9999-9999-9999-999999999999");
            var book10Id = new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
            var book11Id = new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
            var book12Id = new Guid("cccccccc-cccc-cccc-cccc-cccccccccccc");

            // Seed Books by Tolkien McTolkienface, Rowling McRowlingface, and Dinniman McDinnimanface
            migrationBuilder.InsertData(
                table: "Books",
                columns: new[] { "Id", "Title", "Author", "Description", "Notes", "ISBN", "PublishedYear", "PageCount", "OwnershipStatus" },
                values: new object[,]
                {
                    // Books by Tolkien McTolkienface
                    { book1Id, "The Fellowship of the Code", "Tolkien McTolkienface", "An epic journey through the land of debugging, where a fellowship must destroy the One Bug.", "Incredible world-building! Best fantasy book I've read.", "978-1-234567-01-1", 2020, 678, "Own" },
                    { book2Id, "The Two Repositories", "Tolkien McTolkienface", "The fellowship splits as they navigate merge conflicts and code reviews.", "Second book in the trilogy. Even better than the first!", "978-1-234567-02-8", 2021, 712, "Own" },
                    { book3Id, "The Return of the Developer", "Tolkien McTolkienface", "The epic conclusion where the developer returns to restore order to the codebase.", "Loaned this out and never got it back. Had to give my copy away later.", "978-1-234567-03-5", 2022, 745, "SoldOrGaveAway" },
                    { book4Id, "The Silmarillion of Systems", "Tolkien McTolkienface", "The history and mythology behind the great software systems of old.", "Dense but rewarding. Took multiple attempts to finish.", "978-1-234567-04-2", 2019, 890, "Own" },
                    
                    // Books by Rowling McRowlingface
                    { book5Id, "Harry Coder and the Philosopher's Code", "Rowling McRowlingface", "A young programmer discovers magical programming abilities.", "Absolutely magical! Perfect for beginner programmers.", "978-2-345678-01-9", 2018, 456, "Own" },
                    { book6Id, "Harry Coder and the Chamber of Secrets", "Rowling McRowlingface", "Dark secrets lurk in the database chamber.", "Great sequel with darker themes. Currently loaned to a friend.", "978-2-345678-02-6", 2019, 487, "Own" },
                    { book7Id, "Harry Coder and the Prisoner of Technical Debt", "Rowling McRowlingface", "An escaped developer returns to haunt the codebase.", "Best book in the series! The plot twists are amazing.", "978-2-345678-03-3", 2020, 512, "Own" },
                    { book8Id, "Harry Coder and the Goblet of Frameworks", "Rowling McRowlingface", "Four frameworks compete in a deadly tournament.", "Want to buy this when it goes on sale. Heard great reviews.", "978-2-345678-04-0", 2021, 623, "WantToBuy" },
                    
                    // Books by Dinniman McDinnimanface
                    { book9Id, "Dungeon Crawler Carl", "Dinniman McDinnimanface", "Earth becomes a dungeon crawler game show for aliens.", "Hilarious and action-packed! Couldn't put it down.", "978-3-456789-01-7", 2020, 534, "Own" },
                    { book10Id, "Dungeon Crawler Carl 2", "Dinniman McDinnimanface", "Carl and Donut descend deeper into the deadly dungeon.", "Even better than the first. The humor is top-notch.", "978-3-456789-02-4", 2021, 589, "Own" },
                    { book11Id, "Dungeon Crawler Carl 3", "Dinniman McDinnimanface", "The stakes get higher as Carl faces impossible odds.", "Started but couldn't finish. Maybe not my style.", "978-3-456789-03-1", 2022, 612, "Own" },
                    { book12Id, "Dungeon Crawler Carl 4", "Dinniman McDinnimanface", "Carl's journey continues with new allies and enemies.", "On my wish list. Waiting for the paperback release.", "978-3-456789-04-8", 2023, 645, "WantToBuy" }
                });

            // Seed Ratings
            migrationBuilder.InsertData(
                table: "Ratings",
                columns: new[] { "Id", "BookId", "Score", "Notes" },
                values: new object[,]
                {
                    { new Guid("a1111111-1111-1111-1111-111111111111"), book1Id, 10, "Masterpiece! The world-building is exceptional." },
                    { new Guid("a2222222-2222-2222-2222-222222222222"), book2Id, 10, "Even better than the first! Character development is superb." },
                    { new Guid("a3333333-3333-3333-3333-333333333333"), book3Id, 9, "Satisfying conclusion to the trilogy." },
                    { new Guid("a4444444-4444-4444-4444-444444444444"), book4Id, 7, "Dense and complex, but worth the effort." },
                    { new Guid("a5555555-5555-5555-5555-555555555555"), book5Id, 9, "Charming and magical. Perfect introduction to the series." },
                    { new Guid("a6666666-6666-6666-6666-666666666666"), book6Id, 8, "Darker and more mature. Great mystery elements." },
                    { new Guid("a7777777-7777-7777-7777-777777777777"), book7Id, 10, "Best in the series! The time-turner equivalent is brilliant." },
                    { new Guid("a9999999-9999-9999-9999-999999999999"), book9Id, 10, "Incredibly entertaining! The humor is perfect." },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), book10Id, 10, "Love the character dynamics between Carl and Donut." },
                    { new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), book11Id, 5, "Good action but couldn't connect with the story." }
                });

            // Seed Reading Statuses
            migrationBuilder.InsertData(
                table: "ReadingStatuses",
                columns: new[] { "Id", "BookId", "Status" },
                values: new object[,]
                {
                    { new Guid("b1111111-1111-1111-1111-111111111111"), book1Id, "Completed" },
                    { new Guid("b2222222-2222-2222-2222-222222222222"), book2Id, "Completed" },
                    { new Guid("b3333333-3333-3333-3333-333333333333"), book3Id, "Completed" },
                    { new Guid("b4444444-4444-4444-4444-444444444444"), book4Id, "Completed" },
                    { new Guid("b5555555-5555-5555-5555-555555555555"), book5Id, "Completed" },
                    { new Guid("b6666666-6666-6666-6666-666666666666"), book6Id, "Completed" },
                    { new Guid("b7777777-7777-7777-7777-777777777777"), book7Id, "Completed" },
                    { new Guid("b9999999-9999-9999-9999-999999999999"), book9Id, "Completed" },
                    { new Guid("baaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), book10Id, "Completed" },
                    { new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), book11Id, "Abandoned" }
                });

            // Seed Loans - various scenarios
            migrationBuilder.InsertData(
                table: "Loans",
                columns: new[] { "Id", "BookId", "BorrowedTo", "LoanDate", "IsReturned", "ReturnedDate" },
                values: new object[,]
                {
                    // book1 - Multiple loans, all returned
                    { new Guid("c1111111-1111-1111-1111-111111111111"), book1Id, "Sam Gamgee", new DateTime(2023, 3, 15), true, new DateTime(2023, 5, 20) },
                    { new Guid("c1111112-1111-1111-1111-111111111111"), book1Id, "Frodo Baggins", new DateTime(2024, 1, 10), true, new DateTime(2024, 2, 28) },
                    
                    // book2 - One returned loan
                    { new Guid("c2222222-2222-2222-2222-222222222222"), book2Id, "Merry Brandybuck", new DateTime(2024, 6, 5), true, new DateTime(2024, 8, 15) },
                    
                    // book3 - Loaned before being given away (never returned)
                    { new Guid("c3333333-3333-3333-3333-333333333333"), book3Id, "Pippin Took", new DateTime(2023, 9, 1), false, null },
                    
                    // book5 - Multiple completed loans
                    { new Guid("c5555551-5555-5555-5555-555555555555"), book5Id, "Hermione Granger", new DateTime(2022, 11, 1), true, new DateTime(2022, 12, 15) },
                    { new Guid("c5555552-5555-5555-5555-555555555555"), book5Id, "Ron Weasley", new DateTime(2023, 6, 20), true, new DateTime(2023, 8, 5) },
                    { new Guid("c5555553-5555-5555-5555-555555555555"), book5Id, "Luna Lovegood", new DateTime(2024, 9, 10), true, new DateTime(2024, 10, 30) },
                    
                    // book6 - Currently loaned
                    { new Guid("c6666666-6666-6666-6666-666666666666"), book6Id, "Neville Longbottom", new DateTime(2026, 1, 15), false, null },
                    
                    // book7 - One recent returned loan
                    { new Guid("c7777777-7777-7777-7777-777777777777"), book7Id, "Ginny Weasley", new DateTime(2025, 11, 1), true, new DateTime(2026, 1, 10) },
                    
                    // book9 - Currently loaned
                    { new Guid("c9999999-9999-9999-9999-999999999999"), book9Id, "Princess Donut", new DateTime(2026, 2, 1), false, null },
                    
                    // book10 - Multiple loans, latest currently out
                    { new Guid("caaaaaaa-aaaa-1111-aaaa-aaaaaaaaaaaa"), book10Id, "Mordecai", new DateTime(2024, 5, 15), true, new DateTime(2024, 7, 20) },
                    { new Guid("caaaaaaa-aaaa-2222-aaaa-aaaaaaaaaaaa"), book10Id, "Katia", new DateTime(2025, 12, 10), false, null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Remove seeded data in reverse order (respecting foreign keys)
            
            // Delete Loans
            migrationBuilder.DeleteData(table: "Loans", keyColumn: "Id", keyValue: new Guid("c1111111-1111-1111-1111-111111111111"));
            migrationBuilder.DeleteData(table: "Loans", keyColumn: "Id", keyValue: new Guid("c1111112-1111-1111-1111-111111111111"));
            migrationBuilder.DeleteData(table: "Loans", keyColumn: "Id", keyValue: new Guid("c2222222-2222-2222-2222-222222222222"));
            migrationBuilder.DeleteData(table: "Loans", keyColumn: "Id", keyValue: new Guid("c3333333-3333-3333-3333-333333333333"));
            migrationBuilder.DeleteData(table: "Loans", keyColumn: "Id", keyValue: new Guid("c5555551-5555-5555-5555-555555555555"));
            migrationBuilder.DeleteData(table: "Loans", keyColumn: "Id", keyValue: new Guid("c5555552-5555-5555-5555-555555555555"));
            migrationBuilder.DeleteData(table: "Loans", keyColumn: "Id", keyValue: new Guid("c5555553-5555-5555-5555-555555555555"));
            migrationBuilder.DeleteData(table: "Loans", keyColumn: "Id", keyValue: new Guid("c6666666-6666-6666-6666-666666666666"));
            migrationBuilder.DeleteData(table: "Loans", keyColumn: "Id", keyValue: new Guid("c7777777-7777-7777-7777-777777777777"));
            migrationBuilder.DeleteData(table: "Loans", keyColumn: "Id", keyValue: new Guid("c9999999-9999-9999-9999-999999999999"));
            migrationBuilder.DeleteData(table: "Loans", keyColumn: "Id", keyValue: new Guid("caaaaaaa-aaaa-1111-aaaa-aaaaaaaaaaaa"));
            migrationBuilder.DeleteData(table: "Loans", keyColumn: "Id", keyValue: new Guid("caaaaaaa-aaaa-2222-aaaa-aaaaaaaaaaaa"));

            // Delete Reading Statuses
            migrationBuilder.DeleteData(table: "ReadingStatuses", keyColumn: "Id", keyValue: new Guid("b1111111-1111-1111-1111-111111111111"));
            migrationBuilder.DeleteData(table: "ReadingStatuses", keyColumn: "Id", keyValue: new Guid("b2222222-2222-2222-2222-222222222222"));
            migrationBuilder.DeleteData(table: "ReadingStatuses", keyColumn: "Id", keyValue: new Guid("b3333333-3333-3333-3333-333333333333"));
            migrationBuilder.DeleteData(table: "ReadingStatuses", keyColumn: "Id", keyValue: new Guid("b4444444-4444-4444-4444-444444444444"));
            migrationBuilder.DeleteData(table: "ReadingStatuses", keyColumn: "Id", keyValue: new Guid("b5555555-5555-5555-5555-555555555555"));
            migrationBuilder.DeleteData(table: "ReadingStatuses", keyColumn: "Id", keyValue: new Guid("b6666666-6666-6666-6666-666666666666"));
            migrationBuilder.DeleteData(table: "ReadingStatuses", keyColumn: "Id", keyValue: new Guid("b7777777-7777-7777-7777-777777777777"));
            migrationBuilder.DeleteData(table: "ReadingStatuses", keyColumn: "Id", keyValue: new Guid("b9999999-9999-9999-9999-999999999999"));
            migrationBuilder.DeleteData(table: "ReadingStatuses", keyColumn: "Id", keyValue: new Guid("baaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"));
            migrationBuilder.DeleteData(table: "ReadingStatuses", keyColumn: "Id", keyValue: new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"));

            // Delete Ratings
            migrationBuilder.DeleteData(table: "Ratings", keyColumn: "Id", keyValue: new Guid("a1111111-1111-1111-1111-111111111111"));
            migrationBuilder.DeleteData(table: "Ratings", keyColumn: "Id", keyValue: new Guid("a2222222-2222-2222-2222-222222222222"));
            migrationBuilder.DeleteData(table: "Ratings", keyColumn: "Id", keyValue: new Guid("a3333333-3333-3333-3333-333333333333"));
            migrationBuilder.DeleteData(table: "Ratings", keyColumn: "Id", keyValue: new Guid("a4444444-4444-4444-4444-444444444444"));
            migrationBuilder.DeleteData(table: "Ratings", keyColumn: "Id", keyValue: new Guid("a5555555-5555-5555-5555-555555555555"));
            migrationBuilder.DeleteData(table: "Ratings", keyColumn: "Id", keyValue: new Guid("a6666666-6666-6666-6666-666666666666"));
            migrationBuilder.DeleteData(table: "Ratings", keyColumn: "Id", keyValue: new Guid("a7777777-7777-7777-7777-777777777777"));
            migrationBuilder.DeleteData(table: "Ratings", keyColumn: "Id", keyValue: new Guid("a9999999-9999-9999-9999-999999999999"));
            migrationBuilder.DeleteData(table: "Ratings", keyColumn: "Id", keyValue: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"));
            migrationBuilder.DeleteData(table: "Ratings", keyColumn: "Id", keyValue: new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"));

            // Delete Books
            migrationBuilder.DeleteData(table: "Books", keyColumn: "Id", keyValue: new Guid("11111111-1111-1111-1111-111111111111"));
            migrationBuilder.DeleteData(table: "Books", keyColumn: "Id", keyValue: new Guid("22222222-2222-2222-2222-222222222222"));
            migrationBuilder.DeleteData(table: "Books", keyColumn: "Id", keyValue: new Guid("33333333-3333-3333-3333-333333333333"));
            migrationBuilder.DeleteData(table: "Books", keyColumn: "Id", keyValue: new Guid("44444444-4444-4444-4444-444444444444"));
            migrationBuilder.DeleteData(table: "Books", keyColumn: "Id", keyValue: new Guid("55555555-5555-5555-5555-555555555555"));
            migrationBuilder.DeleteData(table: "Books", keyColumn: "Id", keyValue: new Guid("66666666-6666-6666-6666-666666666666"));
            migrationBuilder.DeleteData(table: "Books", keyColumn: "Id", keyValue: new Guid("77777777-7777-7777-7777-777777777777"));
            migrationBuilder.DeleteData(table: "Books", keyColumn: "Id", keyValue: new Guid("88888888-8888-8888-8888-888888888888"));
            migrationBuilder.DeleteData(table: "Books", keyColumn: "Id", keyValue: new Guid("99999999-9999-9999-9999-999999999999"));
            migrationBuilder.DeleteData(table: "Books", keyColumn: "Id", keyValue: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"));
            migrationBuilder.DeleteData(table: "Books", keyColumn: "Id", keyValue: new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"));
            migrationBuilder.DeleteData(table: "Books", keyColumn: "Id", keyValue: new Guid("cccccccc-cccc-cccc-cccc-cccccccccccc"));
        }
    }
}
