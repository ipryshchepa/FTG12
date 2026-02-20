# Personal Library Application - Development Summary

This document chronicles the development process of the Personal Library application, including prompts, results, and lessons learned. It was written manually by myself. Copilot was used to format the document from the simple text file and to help provide the next summary at the beginning of the document.

## Key Takeaways

### ✅ What Worked Well

- **Asking for clarification** - Adding "Ask clarifying questions if needed" to prompts resulted in valuable questions about CI/CD, testing tools, and business requirements
- **Iterative refinement** - Copilot successfully adapted to changing requirements (e.g., removing authorization, updating data models)
- **React testing** - Frontend tests worked exceptionally well with minimal issues (contrary to expectations)
- **Context awareness** - Copilot learned from existing patterns and automatically added features like sorting/paging to new pages
- **Creative implementations** - Data seeding used contextual, humorous names based on author references rather than generic placeholders
- **Natural language fixes** - Simple problem descriptions were understood as bug fix requests without formal task framing
- **Feature completeness** - Copilot suggested missing components and features that weren't explicitly mentioned
- **Persistent problem-solving** - Through multiple iterations, eventually resolved complex issues like CI/CD pipeline configuration

### ❌ Challenges & Issues
- **Lack of practice** - I definitely need more practice internalizing the prompt engineering techinques and instruments available. I often wasted token or requests by iterating using ineffective prompts
- **Specificity required** - Generic prompts led to unexpected decisions (e.g., 'Frontend'/'Backend' folder naming)
- **Misinterpretations** - Confused property requirements with enum values; required detailed clarification
- **Excessive verbosity** - Generated overly long instruction files (580 lines) and documentation (200+ lines) requiring manual trimming
- **Edit quality** - Introduced duplicates, typos, and trimmed content unexpectedly when modifying existing documents
- **Backend testing struggles** - C# tests were problematic (90% pass rate, 60% coverage vs. 100%/80% target); added test code into services inappropriately
- **Complexity handling** - I underestimated the complexity of some tasks. Large tasks (40 files, CI/CD pipelines) were initially overwhelming; should have been broken into smaller chunks
- **UI/styling issues** - Struggled with compact layouts, button margins, and responsive design; required screenshots to fix
- **Hallucinations** - Made false claims about "legacy tests" and "environment issues" when actual bugs existed; required 3 attempts to acknowledge
- **Configuration instability** - CI/CD coverage threshold configuration changed back and forth across commits
- **Plan scope creep** - Documentation tasks unexpectedly included performance optimizations and new features

### 💡 Best Practices Learned

1. **Always include** "Ask clarifying questions if needed" in prompts
2. **Be specific** about desired outcomes, folder names, and technical decisions
3. **Break down large tasks** into smaller, manageable plans (avoid 40-file plans)
4. **Request verification** after edits - ask Copilot to reread entire documents after making partial changes
5. **Use iterative approach** for complex tasks like CI/CD pipelines
6. **Provide visual context** (screenshots) for UI/styling issues when text descriptions fail
7. **Challenge hallucinations** - persist with 2-3 verification requests when results seem incorrect
8. **Add constraints** - specify "short and concise" or "no code examples" to control output verbosity
9. **Request step-by-step** execution for test fixes rather than bulk operations
10. **Feature-based plans** work better than layered plans (infrastructure → components → tests)

---

## Initial Setup (Agent Mode)

**Prompt:**

> I want to build personal library application. It will have .Net 10 backend, MS SQL database, ReactJS frontend and Materialize CSS. I want you to create appropriate solution structure with necessary packages and libraries with the latest versions. Create barebones homepage so I would be able to verify that the initial set up is configured properly.

### Result

This was an initial prompt during repo creation. As I was limited to 500 characters during this process I utilized the initial prompt as a general project description without details of the planned stack of technologies. Copilot created PR with the next file structure and barebones .NET and React projects:

FTG12/
├── Backend/
│   └── PersonalLibrary.API/     # .NET 10 Web API
├── Frontend/                    # React + Vite app
├── PersonalLibrary.sln          # Solution file
├── .gitignore                   # Comprehensive ignore rules
└── README.md                    # Setup instructions

This is more or less what I expected, but I am not happy with the 'Frontend', 'Backend' folder naming. On one hand it was my fault that I did not think about that part, on the other I see that Copilot requires more specifics where I did not expect them. I planned initially to add 'Ask clarifying questions if needed' to the prompt, but based on how GitHub presented the field for the prompt I was not sure that this initial prompt would follow through with that. I suspect, I should've still added that clause.

---

## Instruction File Creation (Agent Mode)

**Prompt:**

> Create a copilot instruction file for this application. Application is using ReactJS, Materialize CSS, .NET 10, Entity Framework Core, MS SQL. Consider that C# and ReactJS specific instructions are defined in path specific instructions. Use best coding and security practices. All front end and back end code should be covered by unit tests, and successful run of those tests is a requirement for a build. Ask clarifying questions if needed.

### Result

Copilot generated extensive 580 line file with instructions. It asked me about CI/CD configuration, authorization, project business details and preferred testing tools and proposed options for those questions. For me it seems that asking Copilot to ask questions is one of the most useful things I can do as it is easy to forget or not to think about requirements during prompting. The resulting instructions include among other things proposed data structure, API calls, testing patterns, EntityFramework, CSS, CI/CD instructions. That looks quite extensive for general instructions, so I want to split it, but that seems to be a good start with all the potential instructions gathered in one place.

### Fix Request: Remove Authorization

> I decided I do not want authorization in this application at the moment as the application is not planned to be public. Remove authorization requirements from the instructions

**Result:**

For this request I added generated instruction files as a context to the chat. I decided to change my requirements and reflect that in the instructions. I like that Copilot makes it easier to hone your ideas as you go.

### Fix Request: Update Data Models

> Update instructions according to updated data models:
Book:
Id - guid - required
Title - string(100) - required
Author - string(100) - required
Descrtiption - string(100) - optional
Notes - string(1000) - optional
ISBN - string - optional
PublishedYear - int - optional
PageCount - int - optional
CoverImageUrl - Uri - optional
OwnershipStatus - enum(Want to buy, Own, Sold/Gave away) - required

Rating:
Id - guid - required
BookId - guid - required - foreign key to Book
Score - int - required
Notes - string(1000) - optional

Loan:
Id - guid - required
BookId - guid - required - foreign key to Book
BorrowedTo - string(100) - required
LoanDate - DateTime - required

ReadingStatus:
Id - guid - required
BookId - guid - required - foreign key to Book
Status - enum(Backlog, Completed, Abandoned) - required

**Result:**

I wanted to describe desired structure using simplest possible definitions, but that is not enough if I want robust results, as Copilot misunderstood optional/required field flag for enum values. For example it proposed these enum values: - OwnershipStatus (enum: Want to buy, Own, Sold/Gave away, required)

### Fix Request: Clarify Property Requirements

> Update the instructions so that it would be obvious that required/optional is a property requirement and not an enum value or type description

**Result:**

The result suited me as the resulting property description looked like this: - OwnershipStatus: enum { Want to buy, Own, Sold/Gave away } - **Required**

### Fix Request: Simplify Instructions

> Instructions file is too extensive. Remove model info, API info and examples from the instructions. Split instructions into path specific instructions where appropriate. Leave only essentials in general instructions file

**Result:**

Resulting backend and frontend instructions mostly were similar to the react/c# instructions from awesome-copilot repo, so I decided to remove them. General instructions were still excessive, with the info on how to build and deploy application in .NET for example. I removed those and left only short project summary, technology stack, security and code review requirements. I definitely need more practice and understanding of the preferred content of the general instructions file and the optimal way of its generation.

---

## Development Plan Creation (Plan Mode)

**Prompt:**

> Task: Create a development plan for a personal library assistant. Plan should include list of well described expected tasks for copilot in order of development. Technology stack is described in the instruction files.
> 
> Application logic: 
1. Application should have a home page with books dashboard. Dashboard should contain a grid with books. Columns: Title, Author, Score, Ownership Status, Reading Status, Loanee. Grid rows should have next actions available to them: Details, Loan, Rate, Update reading status, Delete. Details action opens popup with editable book details. Loan action opens popup with the Name input. Rate action opens popup with the 10 star score and notes inputs. Update reading status opens popup with editable reading status. Delete action deletes book from the database.
2. Dashboard page should have 'Add book' action that opens a popup with inputs for book details, validation and saving book to the db. After the book is added, grid on the dashboard should be refreshed.
3. Loaned books page that contains grid with the columns: Title, Author, Loanee. Grid should contain only loaned books. Grid rows should have available action: Return. Return action deletes book loan info and refreshes the grid.

Expected data model: 
Book:
Id - guid - required
Title - string(100) - required
Author - string(100) - required
Descrtiption - string(100) - optional
Notes - string(1000) - optional
ISBN - string - optional
PublishedYear - int - optional
PageCount - int - optional
CoverImageUrl - Uri - optional
OwnershipStatus - enum(Want to buy, Own, Sold/Gave away) - required

Rating:
Id - guid - required
BookId - guid - required - foreign key to Book
Score - int - required
Notes - string(1000) - optional

Loan:
Id - guid - required
BookId - guid - required - foreign key to Book
BorrowedTo - string(100) - required
LoanDate - DateTime - required

ReadingStatus:
Id - guid - required
BookId - guid - required - foreign key to Book
Status - enum(Backlog, Completed, Abandoned) - required

Additional task:
Application requires creation of MS SQL db docker container

Ask, if you need additional tools to create the plan or execute the task. Ask, if you have clarifying questions. Think through the plan step by step.

### Result

Resulting plan is stored in [OriginalPlan.md](OriginalPlan.md). Copilot provided quite an extensive plan in 10 stages for the whole application development. While the plan seemed like what I want, I had few little details I wanted to change. I decided to ask Copilot to split that plan into separate subplans, so that the whole process is more manageable.

### Fix Request: Split Into Subplans

> Based on proposed stages convert this plan into independent subplans that can be executed individually. Provide all the necessary context to each subplan.

**Result:**

Copilot started splitting the plan, but it also decided that the context I'm asking for also contains code, so it basically started implementing the code in the prompt result, which quickly ate all available tokens. I rolled back the results, and rephrased the prompt a bit.

### Fix Request: Split Without Code Examples

> Based on proposed stages split this plan into independent subplans that can be executed individually. Provide all the necessary context to each subplan. Do not provide code examples

**Result:**

Copilot provided 9 subplans (it combined two stages into one plan in this version) that I could use as prompts with minimal changes. Resulting subplans response is stored in [OriginalSubPlans.md](OriginalSubPlans.md).

---

## Implementation: Docker Setup (Agent Mode)

**Prompt:**

Original prompt proposed by Copilot is from [OriginalSubPlans.md](OriginalSubPlans.md). Final prompt contents are in [01-docker.md](../Plans/01-docker.md)

### Result

Copilot produced necessary docker files and configuration, but I had an issue with SSL certificate on my machine during docker-compose. By feeding Copilot stack trace of the error multiple times and manual rebuilding, it ended up disabling SSL verification. I haven't figured out the issue with SSL cert on my machine myself, so I went with the unsafe solution.

See: [01-docker.result.md](../Plans/01-docker.result.md)

---

## Implementation: Backend Data Layer (Agent Mode)

**Prompt:**

Original prompt proposed by Copilot is from [OriginalSubPlans.md](OriginalSubPlans.md). Final prompt contents are in [02-backend-data-layer.md](../Plans/02-backend-data-layer.md)

### Result

I didn't like the abundance of Book DTOs, so I asked Copilot to update the plan to reduce the amount of DTOs. After the updated plan was implemented I reviewed the code and noticed that Copilot did not include display text for enums, and IDs for DTOs, so I had to fix with separate prompts.

See: [02-backend-data-layer.result.md](../Plans/02-backend-data-layer.result.md)

---

## Implementation: Backend Services & API (Agent Mode)

**Prompt:**

Original prompt proposed by Copilot is from [OriginalSubPlans.md](OriginalSubPlans.md). Final prompt contents are in [03-backend-services-and-api-endpoints.md](../Plans/03-backend-services-and-api-endpoints.md)

### Result

I asked Copilot to modify the original prompt according to changes I made in the previous part. And after that I decided to ask it to replace Minimal API with RESTful API. But with the updated plan this was the first prompt where I did not feel the need to alter the results.

See: [03-backend-services-and-api-endpoints.result.md](../Plans/03-backend-services-and-api-endpoints.result.md)

---

## Implementation: Backend Testing (Agent Mode)

**Prompt:**

Original prompt proposed by Copilot is from [OriginalSubPlans.md](OriginalSubPlans.md). Final prompt contents are in [04-backend-testing.md](../Plans/04-backend-testing.md)

### Result

I asked Copilot to modify the original prompt according to changes I made in the previous part. After requesting changes for this and previous plan I asked Copilot to verify the plan and fix any issues if found. It turned out that Copilot was reckless in its changes, and left some duplicates in the tasks, trimmed some unexpectedly, or left typos. It looks like that it is a good practice to ask Copilot to reread the document it creates in its entirety after making it pay attention only to small parts of the document.

Looking back I underestimated the scope of the testing required and should've split this plan into separate plans at least for unit and integration tests. While I requested 100% tests to pass, when Copilot was done, it reported only 90% success rate and 60% coverage, while I requested 80%. Copilot struggled to fix all the tests and I decided to make an additional prompt to make it work through tests one by one. It still struggled with some tests going as far as adding test related code into the service itself, so I had to ask it to come up with a different solution.

See: [04-backend-testing.result.md](../Plans/04-backend-testing.result.md)

### Fix Request: Test Fixes

> Fix unit tests and integration tests. Do not try to fix all the files at once. Only move to the next file when you fixed the tests in the current one. All tests should pass before you finish your work

**Result:**

Copilot was done soon after that, but that might be because it fixed most of the issues when I stopped it to make this prompt.

---

## Plan Restructuring (Agent Mode)

**Initial Prompt:**

> Analyse plans 5, 6, 7 and restructure them in a way so that one plan would correlate to one page or popup so that each plan would include infrastructure, components and testing for that page or popup. Output results into new files in /Plans folder. Include necessary preparations or common code into the first of these plans

### Result

I decided to restructure the layered order of development proposed by Copilot (infrastructure -> components -> tests) to feature specific plans. Original prompt yielded infrastructure plan with a lot of component specific logic, and the plans were missing modules, so I decided to undo the changes and rewrite the prompt with more details.

### Fix Request: Better Feature-Based Restructuring

> Analyse plans 5, 6, 7 and restructure them in a way so that one plan would correlate to one piece of functionality with API, infrastructure, components and testing. Output results into new files in /Plans folder. Include necessary preparations or common code into the first of these plans. Do not prepare code examples.
> 
> Order of plans:
> 1. Common
> 2. Books dashboard with grid but no actions
> 3. Loaned books dashboard with grid but no actions
> 4. Add book button
> 5. View book details action in book grid
> 6. Update book action in book grid
> 7. Rate book action in book grid
> 8. Loan book action in book grid and loaned book grid
> 9. Return book action in book grid and loaned book grid
> 10. View loan history action in book grid and loaned book grid

**Result:**

This prompt created the plans more or less as I expected. Also Copilot created plans for components I forgot to mention, which I found quite pleasing.

---

## Implementation: Frontend Infrastructure (Agent Mode)

**Prompt:**

Prompt contents that were created after the restructuring are in [05-frontend-common-infrastructure.md](../Plans/05-frontend-common-infrastructure.md)

### Result

Looking back that plan could've been split into smaller plans as it had to create 40 files, but in the end simplicity of the files didn't present any problems. What was interesting to me, Copilot didn't have any issues with React tests and it had a lot of them with C# tests, while I expected it to be the opposite.

See: [05-frontend-common-infrastructure.result.md](../Plans/05-frontend-common-infrastructure.result.md)

### Fix Request: Update Star Rating

> Update formatter.js and relevant tests to display up to ten stars instead of five

**Result:**

The only thing I needed to change, is that Copilot decided to display 1-10 score range as 5 stars, with 1/2 character as a half-star.

---

## Implementation: Data Seeding (Agent Mode)

**Prompt:**

> Create seeding EFCore migration with imaginary books by imaginary authors Tolkien McTolkienface, Rowling McRowlingface, Dinniman McDinnimanface with various valid values, scores, statuses and loan history. Verify that migration is valid, executable and creates the data

### Result

Copilot created enough data for my purposes. I liked that it used references to the mentioned authors to create silly book names and description instead of doing something generic.

---

## Implementation: Books Dashboard View (Agent Mode)

**Prompt:**

Prompt contents that were created after the restructuring are in [06-frontend-books-dashboard-view.md](../Plans/06-frontend-books-dashboard-view.md)

### Result

The prompt yielded a simple grid view. I noticed that I forgot to mention sorting and paging for the grid, so I had to ask for that in a separate prompt. Copilot struggled with the sorting logic for a column responsible for somewhat complex relationship, so I had to ask it to iterate on the logic a few times.

See: [06-frontend-books-dashboard-view.result.md](../Plans/06-frontend-books-dashboard-view.result.md)

---

## Implementation: Loaned Books View (Agent Mode)

**Prompt:**

Prompt contents that were created after the restructuring are in [07-frontend-loaned-books-view.md](../Plans/07-frontend-loaned-books-view.md)

### Result

This page is quite similar in logic with the books dashboard, so Copilot didn't struggle with the prompt and I received what I expected. I liked that based on existing books dashboard Copilot added paging and sorting even though that wasn't mentioned in the prompt. Although Copilot added sorting and paging mentions to plan after its implementation.

See: [07-frontend-loaned-books-view.result.md](../Plans/07-frontend-loaned-books-view.result.md)

---

## Implementation: Add Book (Agent Mode)

**Prompt:**

Prompt contents that were created after the restructuring are in [08-frontend-add-book.md](../Plans/08-frontend-add-book.md)

### Result

Copilot created book creation popup. The popup was broken, it closed on any field value change, took too much unnecessary space and had a scroll. As I do not have a lot of fields on a book entity I wanted more compact page.

I liked that I could just describe my issue with the page without adding qualifiers that I'm giving Copilot a task, and agent mode took it as a bug fix request. Updating the page layout took a few iterations with basically asking 'Make the page more compact' a few times with little changes.

See: [08-frontend-add-book.result.md](../Plans/08-frontend-add-book.result.md)

---

## Implementation Prompt Generation (Agent Mode)

**Prompt:**

> Create short and concise prompt for plan implementation that will get currently selected plan file as the input parameter, implement it, and summarize result to Plans folder

### Result

I wanted to try generating prompts via Copilot. My first attempt at generating prompt yielded quite large prompt file with a lot of unnecessary details, so in my second attempt I added "short and concise" qualifier and that helped.

---

## Implementation: View Book Details (Agent Mode)

**Prompt:**

Prompt contents that were created after the restructuring are in [09-frontend-view-book-details.md](../Plans/09-frontend-view-book-details.md)

### Result

Copilot created book details page. Again I didn't like the amount of space the page took, but this time only one additional prompt with more compact page request was required to make the page fit the screen.

See: [09-frontend-view-book-details.result.md](../Plans/09-frontend-view-book-details.result.md)

---

## Implementation: Update Book (Agent Mode)

**Prompt:**

Prompt contents that were created after the restructuring are in [10-frontend-update-book.md](../Plans/10-frontend-update-book.md)

### Result

Copilot updated book details page and added update button that changed the view from read only details to form with the inputs. As it followed closely the layout of the read only details, I didn't have any issues with the page size. Copilot had an issue with the button margins, and the buttons were always touching each other. Text requests to fix that didn't help, Copilot made changes that didn't work. Only by providing Copilot screenshot with the buttons, it figured out that it had issues with button component styling.

See: [10-frontend-update-book.result.md](../Plans/10-frontend-update-book.result.md)

---

## Implementation: Rate Book (Agent Mode)

**Prompt:**

Prompt contents that were created after the restructuring are in [11-frontend-rate-book.md](../Plans/11-frontend-rate-book.md)

### Result

Copilot added Rate button to a book dashboard and details page. I liked the results and didn't have any issues.

See: [11-frontend-rate-book.result.md](../Plans/11-frontend-rate-book.result.md)

---

## Implementation: Loan & Return Book (Agent Mode)

**Prompt:**

Prompt contents that were created after the restructuring are in [12-frontend-loan-return-book.md](../Plans/12-frontend-loan-return-book.md)

### Result

Copilot added Loan and Return buttons to book dashboard and details page. I liked the results and didn't have any issues.

See: [12-frontend-loan-return-book.result.md](../Plans/12-frontend-loan-return-book.result.md)

---

## Implementation: Update Reading Status (Agent Mode)

**Prompt:**

Prompt contents that were created after the restructuring are in [13-frontend-update-reading-status.md](../Plans/13-frontend-update-reading-status.md)

### Result

Copilot created functional popup with couple of styling issues and small initialization bugs that were fixed with a simple problem description prompt.

See: [13-frontend-update-reading-status.result.md](../Plans/13-frontend-update-reading-status.result.md)

---

## Implementation: View Loan History (Agent Mode)

**Prompt:**

Prompt contents that were created after the restructuring are in [14-frontend-view-loan-history.md](../Plans/14-frontend-view-loan-history.md)

### Result

Copilot created a functional page, but it decided to implement 'Back' button with a different styling than buttons on other windows.

See: [14-frontend-view-loan-history.result.md](../Plans/14-frontend-view-loan-history.result.md)

---

## Implementation: Delete Book (Agent Mode)

**Prompt:**

Prompt contents that were created after the restructuring are in [15-frontend-delete-book.md](../Plans/15-frontend-delete-book.md)

### Result

As a result of this prompt I saw the weirdest case of hallucinations I saw during this project. Copilot created a popup, but left 2 tests broken. It told me that those are legacy tests from previous commits, and it cannot do anything. I asked to verify all the tests again, Copilot told me that those are new tests, but they are caused by environment issues, and it cannot do anything. Third time I asked Copilot to fix the tests or remove them if they cannot be fixed (in case it produced untestable case), and only then Copilot acknowledged the bugs, and fixed both tests.

See: [15-frontend-delete-book.result.md](../Plans/15-frontend-delete-book.result.md)

---

## Implementation: CI/CD Pipeline (Agent Mode)

**Prompt:**

Prompt contents that were created after the restructuring are in [16-ci-cd-pipeline.md](../Plans/16-ci-cd-pipeline.md)

### Result

Copilot created CI/CD pipeline configuration although with overly complex code coverage solution. From the way it first implemented the configuration, only code checks were working right, while backend/frontend/docker checks were failing miserably. So it appears that this task is still too complex for Copilot.

See: [16-ci-cd-pipeline.result.md](../Plans/16-ci-cd-pipeline.result.md)

### Fix Request: Test CI/CD Pipeline

> I want to test CI/CD pipeline. Create test pull request, verify that all checks are passing, fix any issues with CI/CD pipeline if found any. The goal is the pull request where all checks are green

**Result:**

Through many iterations of changes and commits Copilot ended up fixing all of the issues, although it struggled with the code coverage configuration. It changed the way it processed coverage threshold back and forth basically in each commit. I was still quite impressed by the end result.

---

## Documentation Updates (Agent Mode)

### Prompt: Split Documentation Plan

> Split this subplan in two. 1. Updating documentation for existing code without any new features. 2. Structured feature list for future implementation

**Result:**

There was documentation part of the plan left (## Subplan 9: Documentation & Production Readiness in [OriginalSubPlans.md](OriginalSubPlans.md)), but the plan Copilot was generating included not only documentation update, but performance optimizations, new code changes and other things that were out of scope of the project. My attempts to ask Copilot to split the plan or shorten it didn't help, it still was creating more than 200 lines of plans and documents. I decided to forego this part, as I didn't see the value in the product.

### Fix Request: Update README

> Update README file to current project state. Add info on docker deployment. Keep the file short only with the necessary information

**Result:**

As a result of this prompt Copilot shortened existing README file while adding docker instructions, and doing it in a way I expected. Verbosity of Copilot, especially in its not strictly technical tasks is still one of its biggest issues.

---

## Summary fomatting

### Prompt

> Format the Summary file to user friendly format. In this document Prompt is close to a header, Fix result is close to subheader. Three dashes are used to logically separate the prompts. Use format you see fit. Update relative paths in text to be actual links

### Result

Copilot updated this file more or less as I expected it, but it still left some inconsistencies in the headers. I liked that it decided to link prompt result files to this document. I didn't add them myself, but thought about it, so it came out as a nice surprise.

## Summary summary (lol)

### Prompt

> Analyze the prompt results in the summary document and add short list of generally good and bad experiences as a formatted list at the start of the document

### Result

This prompt yielded the results fairly close to the ones I wanted, I needed to make minimal changes, and some of the things I've already managed to forget about by time I was finished with the project, so Copilot was quite helpful with that.
