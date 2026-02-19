using Microsoft.AspNetCore.Mvc;
using PersonalLibrary.API.DTOs;
using PersonalLibrary.API.Services;

namespace PersonalLibrary.API.Controllers;

/// <summary>
/// Controller for managing books in the personal library.
/// </summary>
[ApiController]
[Route("api/books")]
public class BooksController : ControllerBase
{
    private readonly IBookService _bookService;
    private readonly ILogger<BooksController> _logger;

    /// <summary>
    /// Initializes a new instance of the BooksController class.
    /// </summary>
    /// <param name="bookService">The book service.</param>
    /// <param name="logger">The logger instance.</param>
    public BooksController(IBookService bookService, ILogger<BooksController> logger)
    {
        _bookService = bookService;
        _logger = logger;
    }

    /// <summary>
    /// Retrieves all books in the library.
    /// </summary>
    /// <returns>A list of all books with their details.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(List<BookDetailsDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<BookDetailsDto>>> GetAll()
    {
        var books = await _bookService.GetAllBooksAsync();
        return Ok(books);
    }

    /// <summary>
    /// Retrieves a specific book by its identifier.
    /// </summary>
    /// <param name="id">The book identifier.</param>
    /// <returns>The book details.</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(BookDetailsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BookDetailsDto>> GetById(Guid id)
    {
        var book = await _bookService.GetBookByIdAsync(id);
        return Ok(book);
    }

    /// <summary>
    /// Creates a new book in the library.
    /// </summary>
    /// <param name="bookDto">The book data to create.</param>
    /// <returns>The created book details.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(BookDetailsDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<BookDetailsDto>> Create([FromBody] BookDto bookDto)
    {
        var result = await _bookService.CreateBookAsync(bookDto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>
    /// Updates an existing book in the library.
    /// </summary>
    /// <param name="id">The book identifier.</param>
    /// <param name="bookDto">The updated book data.</param>
    /// <returns>No content on success.</returns>
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] BookDto bookDto)
    {
        bookDto.Id = id;
        await _bookService.UpdateBookAsync(id, bookDto);
        return NoContent();
    }

    /// <summary>
    /// Deletes a book from the library.
    /// </summary>
    /// <param name="id">The book identifier.</param>
    /// <returns>No content on success.</returns>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _bookService.DeleteBookAsync(id);
        return NoContent();
    }
}
