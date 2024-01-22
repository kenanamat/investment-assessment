# Investment Assessment Application

## Overview
This Vue.js application, integrated with TypeScript and Firebase, is designed as an interactive platform for user engagement in activities such as quizzes or games. It features user group management, administrative functionalities, and real-time data handling.

## Key Components

### Entry Point
- **File**: `main.ts`
- **Purpose**: Initializes the Vue application.
- **Details**: Imports and sets up Vue, root App component, Vue Router, Vuex store, and global styles.

### Root Component
- **File**: `App.vue`
- **Purpose**: Serves as the root Vue component.
- **Details**: Integrates the `Header` component and a dynamic `router-view`. Utilizes `Suspense` for handling asynchronous components.

### Components
1. **Header (`Header.vue`)**: Displays the application's header, including logo and user group information.
2. **Game Related (`Game.vue`, `FakeGame.vue`)**: Manages the game interface.
3. **Leaderboard (`Leaderboard.vue`, `FakeLeaderboard.vue`)**: Displays users' rankings.
4. **Questionnaire Components (`Question.vue`, `QuestionType.vue`)**: Handles displaying and managing quiz questions.
5. **Timer (`Timer.vue`)**: A countdown timer for the activities.

### Views (Pages)
1. **Home (`Home.vue`)**: The homepage where users can select a username and join a group.
2. **Admin Panel (`Admin.vue`)**: Provides administrative controls and monitoring.
3. **Questionnaire (`Questionnaire.vue`)**: Hosts the questionnaire or quiz interface.
4. **Thank You Page (`Thankyou.vue`)**: Displays a thank you message post-activity.
5. **Waiting Page (`Waiting.vue`)**: Shown during loading or waiting periods.

### Store (Vuex State Management)
- **File**: `store/index.ts`
- **Purpose**: Manages the application's global state.
- **Details**: Integrates Firebase with Vuex for real-time data synchronization. Manages various states like user, session, and game data.

### Routing
- **File**: `router/index.ts`
- **Purpose**: Manages navigation within the application.
- **Details**: Defines routes and their corresponding components. Utilizes Vue Router's `createWebHistory`.

### Data Handling
- **Directory**: `data`
- **Files**: `db.ts`, `english-adjectives.txt`, `english-nouns.txt`
- **Purpose**: Handles database configurations and provides textual data for the application.

## Getting Started

### Prerequisites
- Familiarity with Vue.js, Vuex, and Vue Router.
- Basic understanding of TypeScript and Firebase.
- Node.js and npm installed for dependency management.

### Installation
1. Clone the repository.
2. Navigate to the project directory.
3. Run `npm install` to install dependencies.

### Running the Application
Execute `npm run serve` to start the application on a local development server. Visit `http://localhost:8080/` to view the application.

### Project Structure
- `src/components`: Reusable Vue components.
- `src/views`: Vue components representing different pages.
- `src/store`: Vuex store modules for state management.
- `src/router`: Vue Router configurations for application navigation.
- `src/data`: Contains data files and database configurations.

## Contributing
New contributors can start by reviewing the `main.ts` and `App.vue` files to understand the application setup. Exploring the `components` and `views` directories will provide insights into the UI and user interactions. The Vuex store in the `store` directory and the Vue Router setup in the `router` directory are crucial for understanding state management and navigation.