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
