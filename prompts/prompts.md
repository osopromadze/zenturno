Analyze project, load it in your context, and tell me what it is about.
-----
Simplify this architecture from the readme, make it simple, use Vercel for the frontend, Supabase for the database and just a simple backend API. Remove all the complex stuff and make it simple and modern.
-----
Initialize memory bank.
-----
Delete nginx and workers related folders and documentation.
-----
I still see mobile related things in readme, remove it
-----
let's start with backend. Analyze 'zenturno/backend/docker-compose.yml' (see below for file content) and remove unnecessary containers
-----
let's configure supabase for local development
-----
remove everything related to supabase, documentation, code and everything. Do not forget to add my prompts in file as indicating in @[/.windsurf/rules/02-prompt.md] rule. Also do not mention migartion from supabase, as we are in early stage of development and we did not use supabase yet, it was just configured, just replace all supabase to postgres and prisma.
-----
analyze and always use rules in @[.windsurf/rules], you are forgetting to add my prompts
-----
after running @[zenturno/backend/verify-setup.sh] I got error in terminal:

Error: P1000: Authentication failed against database server, the provided database credentials for `postgres` are not valid.

Do not forget to update @[prompts/prompts.md] 
-----
database is running without problems in docker and I can connect it using dbeaver, but in terminal after running @[zenturno/backend/verify-setup.sh] I got again this error:
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "zenturno", schema "public" at "localhost:5432"
Error: P1000: Authentication failed against database server, the provided database credentials for `postgres` are not valid.

Do we really need this script?
-----
Continue
-----
skip @[zenturno/backend/verify-setup.sh] and delete it, also delete @[zenturno/backend/backup-restore.sh] and @[zenturno/backend/setup-prisma.sh] 
-----
now let's change everything related to database in english, rename table and field names and use english for them
-----
I see that we have node_modules for the whole project. I think that we need separate modules for backend and frontend. For now, ignore frontend and only work on backend.
-----
in @docs create for me postman collection json to be able to import in postman and test endpoints
-----
I also need a Postman environment for local development.
-----

I see spanish texts in responses, for example `Formato de token inválido`. Look for any spanish text, comment, string, function name in code and change it to english
-----

I checked database using dbeaver and I still see tables with spanish names, change them to english, run docker compose
-----

I want you to act as a Senior full stack Typescript developer.
Your task is to develop a comprehensive suite of unit tests for @zenturno/backend . 
Follow these guidelines for an effective testing process:

1. **Understand the Codebase**: Analyze the TypeScript code thoroughly, step by step. Identify the possible ambiguity or missing information such as constants, type definitions, conditions, external APIs, etc and provide steps, and questions and seek clarification for better code understanding. Only proceed to the next step once you have analyzed the codebase fully.

2. **Testing framework**: For this task, use an **abstract** testing framework instead of known frameworks such as chai, jest, etc., remembering that the principles of unit testing apply regardless of the specific tools.

3. **Design Small, Focused Tests**: Each unit test should focus on one functionality, enhancing readability and ease of debugging. Ensure each test is isolated and does not depend on others. Simulate the behavior of external dependencies using mock objects to increase the reliability and speed of your tests.

4. **Structure and Name Your Tests Well**: Your tests should follow a clear structure and use descriptive names to make their purpose clear. Follow the provided below test structure:

```typescript
// import necessary methods from an abstract testing framework
import { describe, expect, it, beforeAll, beforeEach, afterAll } from './setup.js';

describe('<NAME_OF_MODULE_TO_TEST>', () => {
  // Define top-level test variables here

  beforeAll(async () => {
    // One-time initialization logic _if required_
  });

  beforeEach(async () => {
    // Logic that must be started before every test _if required_
  });
  
  afterAll(async () => {
    // Logic that must be started after all tests _if required_
  });

  describe('#<METHOD_NAME>', () => {
    // Define method-level variable here
    
    // Use method-lavel beforeAll, beforeEach or afterAll _if required_
    
    it('<TEST_CASE>', async () => {
      // Test case code

      // to assert definitions of variables use:
      // expect(<VARIABLE>).toBeDefined();

      // to assert equality use:
      // expect(<TEST_RESULT>).toEqual(<EXPECTED_VALUE>);
      // expect(<TEST_RESULT>).toStrictEqual(<EXPECTED_VALUE>);

      // for promises use async assertion:
      // await expect(<ASYNC_METHOD>).rejects.toThrow(<ERROR_MESSAGE>);
      // await expect(<ASYNC_METHOD>).resolves.toEqual(<EXPECTED_VALUE>);
    });
  });
});
```

Your additional guidelines:

1. **Implement the AAA Pattern**: Implement the Arrange-Act-Assert (AAA) paradigm in each test, establishing necessary preconditions and inputs (Arrange), executing the object or method under test (Act), and asserting the results against the expected outcomes (Assert).

2. **Test the Happy Path and Failure Modes**: Your tests should not only confirm that the code works under expected conditions (the 'happy path') but also how it behaves in failure modes.

3. **Testing Edge Cases**: Go beyond testing the expected use cases and ensure edge cases are also tested to catch potential bugs that might not be apparent in regular use.

4. **Avoid Logic in Tests**: Strive for simplicity in your tests, steering clear of logic such as loops and conditionals, as these can signal excessive test complexity.

5. **Leverage TypeScript's Type System**: Leverage static typing to catch potential bugs before they occur, potentially reducing the number of tests needed.

6. **Handle Asynchronous Code Effectively**: If your test cases involve promises and asynchronous operations, ensure they are handled correctly.

7. **Write Complete Test Cases**: Avoid writing test cases as mere examples or code skeletons. You have to write a complete set of tests. They should effectively validate the functionality under test. 

Your ultimate objective is to create a robust, complete test suite for the provided TypeScript code.
-----

always use jest for testing. Remove unnecessary files created for testing before now.
-----
great, now let's add tests for @AppointmentRepository.ts 
-----
continue implementing test for @zenturno/backend/src/infra/repositories 
-----
create tests for @ProfessionalRepository.ts similar to other tests in @zenturno/backend/test/infra/repositories/prisma 
-----
great, now let's move on @/zenturno/backend/src/infra/http/controllers and write unit tests for them
-----