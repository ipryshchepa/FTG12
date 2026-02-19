---

Prompt (Agent mode):

I want to build personal library application. It will have .Net 10 backend, MS SQL database, ReactJS frontend and Materialize CSS. I want you to create appropriate solution structure with necessary packages and libraries with the latest versions. Create barebones homepage so I would be able to verify that the initial set up is configured properly.

Result:

This was an initial prompt during repo creation. As I was limited to 500 characters during this process I utilized the initial prompt as a general project description without details of the planned stack of technologies. Copilot created PR with the next file structure and barebones .Net and React projects:

FTG12/
├── Backend/
│   └── PersonalLibrary.API/     # .NET 10 Web API
├── Frontend/                    # React + Vite app
├── PersonalLibrary.sln          # Solution file
├── .gitignore                   # Comprehensive ignore rules
└── README.md                    # Setup instructions

This is more or less what I expected, but i am not happy with the 'Frontend', 'Backend' folder naming. On one hand it was my fault that I did not think about that part, on the other I see that copilot requires more specifics where I did not expect them. I planned initially to add 'Ask clarifying questions if needed' to the prompt, but based on how github presented the field for the prompt I was not sure that this initial prompt would follow through with that. I suspect, I should've still added that clause.

---

Prompt (Agent mode):

Create a copilot instruction file for this application. Application is using ReactJS, Materialize CSS, .Net 10, Entity Framework Core, MS SQL. Consider that C# and ReactJS specific instructions are defined in path specific insturctions. Use best coding and security practices. All front end and back end code should be covered by unit tests, and succesful run of those tests is a requirement for a build. Ask clarifying questions if needed.

Result: 

Copilot generated extensive 580 line file with instructions. It asked me about CI/CD configuration, authorisation, project business details and preferred testing tools and proposed options for those questions. For me it seems that asking copilot to ask questions is one of the most useful things I can do as it is easy to forget or not to think about requirements during prompting. The resulting instructions include among other things proposed data structure, api calls, testing patterns, EntityFramework, CSS, CI/CD instructions. That looks quite extensive for general instructions, so I wanto split it, but that seems to be a good start with all the potential instructions gathered in one place.

Fix request: 

I deceded I do not want authorisation in this application at the moment as the application is not planned to be public. Remove authorisation requirements from the instructions

Result:
I
For this request I added generated instruction files as a context to the chat. I decided to change my requirements and reflect that in the instructions. I like that Copilot makes it easier to hone your ideas as you go.

Fix request:

Update instructions according to updated data models:
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

Result: 

I wanted to described desired structure using simplest possible definitions, but that is not enough If I want robust results, as Copilot misunderstood optional/required field flag for enum values. For example it proposed these enum values: - OwnershipStatus (enum: Want to buy, Own, Sold/Gave away, required)

Fix request:

Update the instructions so that it would be obvious that required/optional is a property requriement and not a enum value or type description

Result:

The result suited me as the resulting propery description looked like this: - OwnershipStatus: enum { Want to buy, Own, Sold/Gave away } - **Required**

Fix request:

Instructions file is too extensive. Remove model info, api info and examples from the instructions. Split instructions into path specific instrucions where appropriate. Leave only essentials in general instructions file

Result: 

Resulting backend and frontend instructions mostly were similar to the react/c# instructions from awesome-copilit repo, so I decided to remove them. General instructions were still excessive, with the info on how to build and deploy application in .Net for example. I removed those and left only short project summary, technology stack, security and code review requirementss. I definitely need more practice and understanding of the preferred content of the general instructions file and the optimal way of its generation.

---

Prompt (Plan mode):

Task: Create a development plan for a personal library assistant. Plan should include list of well described expected tasks for copilot in order of development. Technology stack is described in the instruction files.
Application logic: 
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

Result: 

Resulting plan is stored in \Summary\OriginalPlan.md. Copilot provided quite an extensive in 10 stages for the whole application development. While the plan seemed like what I want, I had few little details I wanted to change. I decided to ask copilot to split that plan into separate subplans, so that the whole process is more manageable. 

Fix Request: 

Based on proposed stages convert this plan into independent subplans that can be executed individually. Provide all the necessary context to each subplan.

Result:

Copilot started splitting the plan, but it also decided that the context I'm asking for also contains code, so it basically started implementing the code in the prompt result, which quickly ate all awailable tokens. I rolled back the results, and rephrased the prompt a bit.

Fix Request:

Based on proposed stages split this plan into independent subplans that can be executed individually. Provide all the necessary context to each subplan. Do not provide code examples

Result: 

Copilot provided 9 subplans (it combined two stages into one plan in this version) that I could use as prompts with minimal changes. Resulting subplans response is stored in \Summary\OriginalSubPlans.md. 

---

Prompt (Agent mode):

Original prompt proposed by the copilot is ## Subplan 1: Infrastructure & Docker Setup from \Summary\OriginalSubPlans.md. Final prompt contents are in \Plans\01-Docker.md

Result:

Copilot produced necessary docker files and configuration, but I had an issue with SSL certificate on my machine during docker-compose. By feeding copilot stack trace of the error multiple times and manual rebuilding, it ended up disabling SSL verification. I haven't figured out the issue with SSL cert on my machine myself, so I went with the unsafe solution.

---

Prompt (Agent mode):

Original prompt proposed by the copilot is ## Subplan 2: Backend Data Layer from \Summary\OriginalSubPlans.md. Final prompt contents are in \Plans\02-BackendDataLayer.md 

Result: 

I didn't like the abundance of Book Dtos, so I asked copilot to update the plan to reduce the amount of DTOs. After the updated plan was implemented I reviewed the code and noticed that Copilot did not include display text for enums, and Ids for DTOs, so I had to fix with the separate prompts.

---

Prompt (Agent mode):

Original prompt proposed by the copilot is ## Subplan 3: Backend Services & API Endpoints from \Summary\OriginalSubPlans.md. Final prompt contents are in \Plans\03-BackendServicesAndAPIEndpoints.md 

Result: 

I asked copilot to modify the original prompt according to changes I made in the previous part. And after that I decided to ask it to replace Minimal API with RESTful API. But with the updated pland this was the first prompt where I did not feel the need to alter the results.

---

Prompt (Agent mode):

Original prompt proposed by the copilot is ## Subplan 4: Backend Testing Infrastructure from \Summary\OriginalSubPlans.md. Final prompt contents are in \Plans\04-BackendTesting.md

Result: 

I asked copilot to modify the original prompt according to changes I made in the previous part. After requesting changes for this and previous plan I asked copilot to verify the plan and fix any issues if found. It turned out that Copilot was reckless in its changes, and left some duplicates in the tasks, trimmmed some unexpectedly, or left typos. It looks like that it is a good practice to ask copilot to reread the documentit creates in its entirety after making it pay attention only to small parts of the document.

Looking back I underestimated the scope of the testing required and should've split this plan into separate plans at least for unit and integration tests. While I requested 100% test to pass, when copilot was done, he reported only 90% success rate and 60% coverage, while I requested 80%. Copilot struggled to fix all the tests and I decided to make an additional prompt to make him work through tests one by one. It still struggled with some test going as far as adding test related code into the service itself, so I had to ask him to come up with a different solution.

Fix request: 

Fix unit tests and integration tests. Do not try to fix all the files at once. Only move to the next file when you fixed the tests in the current one. All tests should pass before you finish your work

Result: 

Copilot was done soon after that, but that might be because he fixed most of the issues when I stopped him to make this prompt.

---

Prompt (Agent mode):

Original prompt proposed by the copilot is ## Subplan 5: Frontend Infrastructure & Setup from \Summary\OriginalSubPlans.md. Final prompt contents are in \Plans\05-FrontendInfrastructure.md
