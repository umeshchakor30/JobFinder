"""
JobFinder Quiz Data Store

Source of truth: frontend/src/data/quizData.js
Practice question bank for the six JobFinder core tracks.
"""

QUIZ_DATA = {
    "react": {
        "title": "React.js",
        "icon": "⚛️",
        "description": "Test your understanding of React components, hooks, state, and Vite.",
        "questions": [
            {
                "id": "react-1",
                "type": "single",
                "question": "Which built-in hook is used to declare and update local state in a functional component?",
                "options": [
                    "useEffect",
                    "useState",
                    "useContext",
                    "useReducer"
                ],
                "correct": [1],
                "explanation": "useState is the primary hook for adding local state variables to functional components."
            },
            {
                "id": "react-2",
                "type": "multiple",
                "question": "Which of the following are official built-in React hooks? (Select all that apply)",
                "options": [
                    "useEffect",
                    "useRouter",
                    "useMemo",
                    "useFetch"
                ],
                "correct": [0, 2],
                "explanation": "useEffect and useMemo are core built-in React hooks. useRouter and useFetch are third-party or custom hooks."
            },
            {
                "id": "react-3",
                "type": "single",
                "question": "What is the primary role of the Virtual DOM in React?",
                "options": [
                    "To replace the browser HTML rendering engine entirely",
                    "To perform fast in-memory diffing before updating the real DOM",
                    "To store backend database records in the browser",
                    "To compile JavaScript directly into machine code"
                ],
                "correct": [1],
                "explanation": "React maintains a lightweight in-memory representation of the DOM to compute differences (diffing) and batch minimal updates to the real browser DOM."
            }
        ]
    },

    "fastapi": {
        "title": "Python / FastAPI",
        "icon": "⚡",
        "description": "Test your knowledge of FastAPI endpoints, async handlers, and Pydantic validation.",
        "questions": [
            {
                "id": "fastapi-1",
                "type": "single",
                "question": "Which Python library does FastAPI leverage for data validation and request schema definition?",
                "options": [
                    "Django ORM",
                    "Pydantic",
                    "Marshmallow",
                    "Celery"
                ],
                "correct": [1],
                "explanation": "FastAPI uses Pydantic models for type hinting, input validation, serialization, and automatic schema documentation."
            },
            {
                "id": "fastapi-2",
                "type": "multiple",
                "question": "Which of the following are core features provided out-of-the-box by FastAPI? (Select all that apply)",
                "options": [
                    "Native asynchronous endpoint support via async/await",
                    "Automatic interactive Swagger/OpenAPI documentation (/docs)",
                    "Built-in graphical database administrative panel",
                    "Fast execution speeds comparable to NodeJS and Go"
                ],
                "correct": [0, 1, 3],
                "explanation": "FastAPI provides async support, automated Swagger docs, and high Starlette/Uvicorn performance out-of-the-box. It does not provide a built-in admin GUI."
            },
            {
                "id": "fastapi-3",
                "type": "single",
                "question": 'How do you define a path parameter named "item_id" in a FastAPI route decorator?',
                "options": [
                    '@app.get("/items/:item_id")',
                    '@app.get("/items/{item_id}")',
                    '@app.get("/items/<item_id>")',
                    '@app.get("/items/$item_id")'
                ],
                "correct": [1],
                "explanation": 'FastAPI uses standard Python format string syntax with curly braces: "/items/{item_id}".'
            }
        ]
    },

    "git": {
        "title": "Git",
        "icon": "🌿",
        "description": "Test your grasp of Git version control, branching, and staging workflows.",
        "questions": [
            {
                "id": "git-1",
                "type": "single",
                "question": "Which command stages modified files to prepare them for a commit?",
                "options": [
                    "git commit",
                    "git add",
                    "git push",
                    "git checkout"
                ],
                "correct": [1],
                "explanation": "git add moves changed files from the working directory to the Git staging area (index)."
            },
            {
                "id": "git-2",
                "type": "multiple",
                "question": "Which of the following Git commands only read or display information without changing repository files? (Select all that apply)",
                "options": [
                    "git status",
                    "git log",
                    "git reset --hard",
                    "git diff"
                ],
                "correct": [0, 1, 3],
                "explanation": "git status, git log, and git diff are non-destructive inspection commands. git reset --hard alters files."
            },
            {
                "id": "git-3",
                "type": "single",
                "question": "What is the purpose of the .gitignore file?",
                "options": [
                    "To delete files automatically when pushing to GitHub",
                    "To specify untracked files that Git should deliberately ignore and not stage",
                    "To encrypt sensitive passwords stored in the repository",
                    "To merge branches without commit messages"
                ],
                "correct": [1],
                "explanation": ".gitignore specifies intentionally untracked patterns (like node_modules/ and .env) that Git should ignore."
            }
        ]
    },

    "docker": {
        "title": "Docker",
        "icon": "🐳",
        "description": "Test your understanding of containerization, Dockerfiles, and compose files.",
        "questions": [
            {
                "id": "docker-1",
                "type": "single",
                "question": "What is the fundamental difference between a Docker image and a Docker container?",
                "options": [
                    "An image is a running process; a container is a static configuration file",
                    "An image is a read-only template; a container is a running instance of an image",
                    "Images are only used in Linux; containers are only used in Windows",
                    "There is no difference; the terms are interchangeable"
                ],
                "correct": [1],
                "explanation": "A Docker image is a packaged, immutable filesystem snapshot. A container is an active, running instance instantiated from that image."
            },
            {
                "id": "docker-2",
                "type": "multiple",
                "question": "Which of the following are valid Dockerfile instructions? (Select all that apply)",
                "options": [
                    "FROM",
                    "WORKDIR",
                    "IMPORT",
                    "COPY"
                ],
                "correct": [0, 1, 3],
                "explanation": "FROM, WORKDIR, and COPY are valid standard Dockerfile instructions. IMPORT is not a Dockerfile instruction."
            },
            {
                "id": "docker-3",
                "type": "single",
                "question": "Which tool allows you to define and run multi-container Docker applications using a YAML configuration file?",
                "options": [
                    "Docker Compose",
                    "Docker Swarm CLI",
                    "Kubernetes Minikube",
                    "Docker Hub"
                ],
                "correct": [0],
                "explanation": "Docker Compose uses a docker-compose.yml file to configure and orchestrate multiple interconnected containers."
            }
        ]
    },

    "cicd": {
        "title": "CI / CD",
        "icon": "🔄",
        "description": "Test your knowledge of continuous integration, automated testing, and GitHub Actions.",
        "questions": [
            {
                "id": "cicd-1",
                "type": "single",
                "question": "In a GitHub repository, where must GitHub Actions workflow YAML files be located?",
                "options": [
                    ".github/actions/",
                    ".github/workflows/",
                    "ci/workflows/",
                    ".workflows/"
                ],
                "correct": [1],
                "explanation": "GitHub Actions requires workflow configuration files to be stored directly in .github/workflows/."
            },
            {
                "id": "cicd-2",
                "type": "multiple",
                "question": "Which of the following are primary benefits of Continuous Integration (CI)? (Select all that apply)",
                "options": [
                    "Catching integration bugs and test failures early in development",
                    "Automating code linting, formatting, and test execution on every pull request",
                    "Eliminating the need to write unit tests",
                    "Increasing team deployment confidence through reproducible builds"
                ],
                "correct": [0, 1, 3],
                "explanation": "CI catches bugs early, automates checks, and improves deployment reliability. It encourages unit testing rather than eliminating it."
            },
            {
                "id": "cicd-3",
                "type": "single",
                "question": "In a CI pipeline, what is the role of automated linting?",
                "options": [
                    "To compile machine binaries for production deployment",
                    "To enforce code style consistency and detect syntax errors before merging",
                    "To manage database migrations automatically",
                    "To generate artificial user traffic for load testing"
                ],
                "correct": [1],
                "explanation": "Linting analyzes source code statically to flag programming errors, styling inconsistencies, and suspicious constructs early."
            }
        ]
    },

    "vercel": {
        "title": "Vercel",
        "icon": "▲",
        "description": "Test your understanding of cloud frontend hosting, preview deployments, and environment configuration.",
        "questions": [
            {
                "id": "vercel-1",
                "type": "single",
                "question": "What valuable feature does Vercel generate automatically whenever a Pull Request is opened on a linked repository?",
                "options": [
                    "A production database replica",
                    "A unique Preview Deployment URL for testing changes before merging",
                    "A full Docker daemon instance",
                    "An automated mobile app build for app stores"
                ],
                "correct": [1],
                "explanation": "Vercel creates an isolated Preview Deployment with a unique URL for every commit/PR, allowing stakeholders to review changes live."
            },
            {
                "id": "vercel-2",
                "type": "multiple",
                "question": "Which of the following can be hosted and managed on Vercel? (Select all that apply)",
                "options": [
                    "Static Single Page Applications (React, Vite, Vue)",
                    "Serverless Functions / API routes",
                    "Full-featured relational MySQL database servers",
                    "Modern frameworks like Next.js, SvelteKit, and Remix"
                ],
                "correct": [0, 1, 3],
                "explanation": "Vercel hosts frontend SPAs, serverless API functions, and modern meta-frameworks. Relational database engines like MySQL are typically hosted on dedicated database providers."
            },
            {
                "id": "vercel-3",
                "type": "single",
                "question": "Where should production secrets and API keys be configured for a Vercel project?",
                "options": [
                    "Hardcoded directly in public frontend JavaScript files",
                    "Committed into Git in a .env file",
                    "Configured securely in the Vercel Project Dashboard under Environment Variables",
                    "Shared in the public README.md file"
                ],
                "correct": [2],
                "explanation": "Secrets should never be committed to Git. Vercel provides an Environment Variables management panel in the project dashboard to inject secrets securely."
            }
        ]
    }
}

