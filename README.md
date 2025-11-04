# Google Gemini TTS & AI Code Planner Frontend

## Project Overview

This is a modern React/Vite frontend application designed to interact with a Node.js/NestJS backend, offering two core AI-powered capabilities: **Google Gemini Text-to-Speech (TTS) generation** and an **AI-driven code planning and modification system**.

The **Text-to-Speech** feature empowers users to input text, configure multiple speakers with specific voice profiles, generate high-quality speech audio, and play it directly within the browser.

The **AI Code Planner** provides an innovative way to articulate desired code changes in natural language, receive a structured plan, and apply those changes directly to your local project. It supports operations like adding, modifying, deleting, and repairing files.

The application emphasizes a clean, intuitive user experience with robust authentication and error handling across both modules.

For a deep dive into the application's architecture and design principles, please refer to the [Overview and Architecture document](docs/OVERVIEW_ARCHITECTURE.md).

## Features

*   **Authentication:** Seamless integration with JWT-based authentication, supporting Google OAuth2 and GitHub OAuth2 via the backend server.
*   **Dynamic Text-to-Speech Generation:** Flexible text area for inputting content to be synthesized with options for language code.
*   **Multi-Speaker Configuration (TTS):** Dynamically add, remove, and configure speaker profiles, assigning a unique speaker name (for AI prompting) and a specific voice name (e.g., 'Kore', 'Puck').
*   **Integrated Audio Playback (TTS):** Generated `.wav` audio files are played directly in the browser for immediate feedback.
*   **AI Code Planning & Generation:** Define project context through user prompts, specify scan paths for relevant files, provide detailed AI instructions (system prompt), and define the expected JSON output format to generate structured code modification plans (add, modify, delete, repair, analyze files).
*   **Granular Plan Application:** Review detailed plans including file additions, modifications, deletions, and refactors, then apply entire generated plans or individual file changes to your local project directory, automating code modifications.
*   **User Feedback:** Provides clear visual cues for loading states, along with comprehensive error handling and messaging.
*   **Theming:** Light/Dark mode toggle for personalized viewing.

## Technologies Used

-   **Frontend**: React v18, Vite, TypeScript, Material UI v6, Material Icons v6, Tailwind CSS v4, Nanostores, Axios, React Router DOM, path-browserify.
-   **Backend (Interacts with)**: Node.js, NestJS, Google Gemini API.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before you begin, ensure you have the following installed:

-   [Node.js](https://nodejs.org/) (v18 or higher)
-   [pnpm](https://pnpm.io/) (recommended package manager)
-   The corresponding backend server (`project-board-server`) running and accessible (typically at `http://localhost:5000/api`) with authentication, Google Gemini TTS, and AI Planner configured.

### Installation

1.  **Clone the repository (if you haven't already):**
    ```bash
    git clone https://github.com/evillan0315/project-board-server.git # Assuming this repo is part of a monorepo
    cd apps/text-to-speech
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Initialize Tailwind CSS (if not already done by script):**
    ```bash
    pnpm run tailwind:init
    ```

### Configuration

Create a `.env` file in the `apps/text-to-speech` directory for local development:

```env
VITE_APP_API_BASE_URL=http://localhost:5000/api
VITE_FRONTEND_PORT=3003
VITE_BASE_DIR=/media/eddie/Data/projects/nestJS/nest-modules/project-board-server/apps/text-to-speech
# ^^^ IMPORTANT: VITE_BASE_DIR is the default ABSOLUTE path of this 'text-to-speech' project root
#                directory on your local filesystem. This value is used by the frontend's
#                AI Code Planner as its initial project root. It is crucial for the AI Planner
#                features to correctly scan project files and apply changes via the backend.
#                Ensure this path is valid for your system.
VITE_PREVIEW_APP_URL=http://localhost:3002
```

-   `VITE_APP_API_BASE_URL`: The base URL of your backend API. Ensure this matches the URL where your `project-board-server` is running.
-   `VITE_FRONTEND_PORT`: The port your frontend application runs on during development (e.g., `3003`). This is used for OAuth callback URLs.
-   `VITE_BASE_DIR`: **Crucial for the AI Code Planner.** This environment variable now serves as the default `projectRoot` in the frontend's AI Planner (see `src/components/planner/stores/plannerStore.ts`). It should point to the absolute path of the `text-to-speech` project root directory on your local filesystem. The AI backend uses the `projectRoot` specified in the frontend request to locate and apply file changes.
-   `VITE_PREVIEW_APP_URL`: The URL for previewing the application, if applicable.

#### Backend OAuth Configuration

For Google and GitHub OAuth to work, ensure your backend's (`project-board-server/.env`) OAuth callback URLs are correctly configured to point to this frontend application:

```env
# ... other backend configs

# Google OAuth2 Credentials
GOOGLE_CLIENT_ID='your_google_client_id'
GOOGLE_CLIENT_SECRET='your_google_client_secret'
GOOGLE_CALLBACK_URL='http://localhost:3003/auth/callback' # Must match this frontend's callback route

# GitHub OAuth2 Credentials
GITHUB_CLIENT_ID='your_github_client_id'
GITHUB_CLIENT_SECRET='your_github_client_secret'
GITHUB_CALLBACK_URL='http://localhost:3003/auth/callback' # Must match this frontend's callback route

# ...
FRONTEND_URL='http://localhost:3003' # Ensure this is correctly set in backend too
```

> **Note**: The default development port for this frontend is `3003`, which is reflected in the callback URLs above. The Vite preview server typically runs on `4173`, but `VITE_FRONTEND_PORT` dictates the port used for OAuth redirects.

### Running the Application

To start the development server:

```bash
pnpm run dev
```

This will start the development server, usually accessible at `http://localhost:3003`. You can then navigate to `/` to access the homepage, `/login` to authenticate, `/tts` for Text-to-Speech features, or `/planner` for AI Code Planner features.

### Building for Production

To compile the application for production:

```bash
pnpm run build
```

This command compiles the application for production, and the output will be in the `dist/` directory.

## Detailed Guides

For more in-depth information, refer to the following documentation files:

*   [**User Guide**](docs/USER_GUIDE.md): How to use the application's features.
*   [**Developer Guide**](docs/DEVELOPER_GUIDE.md): Detailed setup, coding standards, and project architecture for contributors.
*   [**Overview and Architecture**](docs/OVERVIEW_ARCHITECTURE.md): A comprehensive explanation of the system's design and architecture.
*   [**Deployment Guide**](docs/DEPLOYMENT.md): Instructions for deploying the application to various environments.
*   [**Project Roadmap**](docs/ROADMAP.md): Future vision and planned features for the project.

## Project Structure

```
text-to-speech/
├── public/                     # Static assets
├── src/                        # Main application source code
│   ├── api/                    # API client services (Axios) for authentication and TTS
│   │   ├── authService.ts
│   │   └── geminiTtsService.ts
│   ├── components/             # Reusable UI components
│   │   ├── Drawer/             # Custom Drawer component
│   │   │   └── CustomDrawer.tsx
│   │   ├── Layout.tsx          # Main application layout with navigation
│   │   ├── Loading.tsx         # Generic loading indicator
│   │   ├── planner/            # AI Code Planner specific components and logic
│   │   │   ├── api/            # Planner API services
│   │   │   │   └── plannerService.ts
│   │   │   ├── constants/      # AI prompt and schema constants
│   │   │   │   └── instructions.ts
│   │   │   ├── drawerContent/  # Drawer content for planner settings
│   │   │   │   ├── DirectoryPickerDrawer.tsx
│   │   │   │   ├── FileChangeEditorDrawer.tsx
│   │   │   │   ├── InstructionEditorDrawer.tsx
│   │   │   │   ├── PlanMetadataEditorDrawer.tsx # Editor for plan's high-level metadata
│   │   │   │   └── ScanPathsDrawer.tsx
│   │   │   ├── stores/         # Nanostore for planner state
│   │   │   │   └── plannerStore.ts
│   │   │   ├── PlanDisplay.tsx # Component to display generated AI plans
│   │   │   ├── PlanGenerator.tsx # Main component for AI plan generation
│   │   │   └── types.ts        # Type definitions for the planner
│   │   ├── ThemeToggle.tsx     # Light/Dark theme toggle
│   │   └── ui/                 # General UI components (e.g., GlobalActionButton)
│   │       └── GlobalActionButton.tsx
│   ├── hooks/                  # Custom React hooks (e.g., useAuth)
│   │   └── useAuth.ts
│   ├── pages/                  # Page-level components (routes)
│   │   ├── AuthCallback.tsx    # Handles OAuth redirects
│   │   ├── HomePage.tsx        # Main application homepage
│   │   ├── LoginPage.tsx
│   │   ├── PlannerLandingPage.tsx # Landing page for AI Planner features
│   │   ├── PlannerPage.tsx     # Actual AI Planner generator component
│   │   ├── TtsGeneratorPage.tsx # Actual TTS generator component
│   │   └── TtsLandingPage.tsx  # Landing page for TTS features
│   ├── stores/                 # Nanostores for global state management
│   │   ├── authStore.ts
│   │   ├── fileTreeStore.ts    # Stores global project root
│   │   ├── themeStore.ts
│   │   └── ttsStore.ts
│   ├── theme/                  # Material UI theme configuration
│   │   └── index.ts
│   ├── types/                  # TypeScript type definitions
│   │   ├── action.ts
│   │   ├── auth.ts
│   │   └── tts.ts
│   ├── utils/                  # Utility functions (e.g., persistentAtom)
│   │   └── persistentAtom.ts
│   ├── App.tsx                 # Main application component
│   └── main.tsx                # Entry point for React application
├── docs/                       # Project documentation (User, Developer, Overview, Deployment guides)
├── kubernetes/                 # Kubernetes deployment configurations
├── .env                        # Environment variables
├── .editorconfig               # Editor configuration
├── .eslintrc.ts                # ESLint configuration
├── .gitignore                  # Files ignored by Git
├── .dockerignore               # Files ignored by Docker
├── Dockerfile                  # Docker build instructions
├── package.json                # Project dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite build configuration
└── README.md                   # Project README (this file)
```

## Backend Endpoints

This frontend interacts with the following backend endpoints (assuming `VITE_APP_API_BASE_URL` is configured):

### Authentication Endpoints
-   `POST /api/auth/login`: Authenticates with email and password.
-   `POST /api/auth/logout`: Invalidates the server-side session/cookie.
-   `GET /api/auth/google`: Initiates Google OAuth2 login redirect.
-   `GET /api/auth/github`: Initiates GitHub OAuth2 login redirect.
-   `GET /api/auth/me`: Fetches the profile of the currently authenticated user.

### Google Gemini TTS Endpoints
-   `POST /api/google-tts/generate`: Generates speech audio from a structured dialogue `prompt` using Google Gemini's TTS model, supporting multiple named speakers and their voice profiles (requires authentication).
    -   **Description:** Generates speech audio from text using Google Gemini's TTS model, supporting multiple speakers.
    -   **Request Body (JSON):**
        ```json
        {
          "prompt": "Eddie: AI is changing everything!\nMarionette: And it's influencing fashion too.",
          "speakers": [
            { "speaker": "Eddie", "voiceName": "kore" },
            { "speaker": "Marionette", "voiceName": "puck" }
          ],
          "languageCode": "en-US" // Optional
        }
        ```
    -   **Response:** A `.wav` audio file (binary stream).

### AI Code Planner Endpoints
-   `POST /api/plan`: Generates a new code modification plan based on an LLM input prompt and project context (requires authentication).
    -   **Description:** Sends a user prompt, project context (root, scan paths, instructions), and expected output format to the backend to generate a detailed plan of file changes.
    -   **Request Body (JSON):** (Example, actual structure aligns with `ILlmInput` in `src/components/planner/types.ts`)
        ```json
        {
          "userPrompt": "Refactor the authentication logic to use a new service.",
          "projectRoot": "/path/to/project",
          "scanPaths": ["src/api", "src/stores"],
          "additionalInstructions": "Focus on clean architecture, use nanostores for state.",
          "expectedOutputFormat": "JSON",
          "requestType": "LLM_GENERATION",
          "output": "JSON"
        }
        ```
    -   **Response:** A JSON object containing the `planId` and the generated `plan` details (conforms to `IGeneratePlanResponse` in `src/components/planner/types.ts`).
-   `GET /api/plan/:planId`: Fetches the details of a specific AI-generated plan (requires authentication).
    -   **Description:** Retrieves a previously generated plan by its ID.
    -   **Response:** A JSON object containing the `plan` details (conforms to `{ plan: IPlan }`).
-   `POST /api/plan/apply`: Applies a specified AI-generated plan (all changes) to the local filesystem (requires authentication).
    -   **Description:** Executes the file modification instructions from a given plan (identified by `planId`) against the local project files.
    -   **Request Body (JSON):**
        ```json
        {
          "planId": "unique-plan-id",
          "projectRoot": "/path/to/project" // Optional, falls back to server-side configured root
        }
        ```
    -   **Response:** A JSON object indicating success or failure, with details of the application process (conforms to `IApplyPlanResult`).
-   `POST /api/plan/:planId/apply-chunk/:changeIndex`: Applies a specific file change from a given plan to the local filesystem (requires authentication).
    -   **Description:** Executes a single file modification instruction from a plan, identified by its index within the plan's `changes` array, against the local project files.
    -   **Request Body (JSON):便于
        ```json
        {
          "changeIndex": 0, // The 0-based index of the change within the plan's 'changes' array
          "projectRoot": "/path/to/project" // Optional, falls back to server-side configured root
        }
        ```
    -   **Response:** A JSON object indicating success or failure, with details of the application process (conforms to `IApplyPlanResult`).

## Customization

-   **Theme:** The Material UI theme can be customized in `src/theme/index.ts`.
-   **Tailwind CSS:** Modify `tailwind.config.js` for custom classes and design system adaptations.
-   **Voice Names (TTS):** The `voiceName` values in the speaker configurations depend on the available voices in your Google Gemini TTS setup. Refer to Google's documentation or your backend implementation for valid voice names.
-   **AI Planner Defaults:** The default AI instructions (system prompt) and expected output JSON schema for the AI Planner can be found and customized in `src/components/planner/constants/instructions.ts`. These values are loaded into the `plannerStore` on initialization.
-   **AI Planner Default Project Root:** The default local project root for the AI Planner can be configured in your `.env` file via `VITE_BASE_DIR`.

## Contributing

Contributions are welcome! Please see the [Contributing Guide](CONTRIBUTING.md) for details on how to get started.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgements

*   Thanks to Google Gemini for the powerful Text-to-Speech and AI capabilities.
*   Inspired by modern web development practices and tools.

## 📧 Contact

Eddie Villanueva - [evillan0315@gmail.com](mailto:evillan0315@gmail.com)
[LinkedIn](https://www.linkedin.com/in/eddie-villalon/)
[GitHub](https://github.com/evillan0315)
