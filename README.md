# GTD Task Manager

A React Native Expo application implementing the Getting Things Done (GTD) methodology for personal productivity management.

## Features

- **Task Management**
  - Capture tasks in the inbox
  - Process tasks with contexts and projects
  - Track task completion status
  - Filter tasks by status, context, or project

- **Project Organization**
  - Create and manage projects
  - View tasks within projects
  - Track project completion progress

- **Context Management**
  - Create and manage contexts (e.g., @computer, @home)
  - Filter tasks by context
  - Organize tasks based on where they can be done

- **Data Persistence**
  - Automatic saving of tasks, projects, and contexts
  - Persistent storage using AsyncStorage
  - Default projects and contexts for quick start

## Technical Architecture

### Core Components

1. **TaskContext (`context/TaskContext.tsx`)**
   - Central state management using React Context
   - Handles all CRUD operations for tasks, projects, and contexts
   - Manages data persistence with AsyncStorage
   - Provides loading state for data synchronization

2. **Screens**
   - `Inbox`: Task capture and initial processing
   - `Next Actions`: Context-based task management
   - `Projects`: Project organization and tracking
   - `Completed`: View completed tasks

3. **Components**
   - `TaskItem`: Reusable task display component
   - `ThemedView`: Consistent styling wrapper
   - `ThemedText`: Typography component
   - `ThemedTextInput`: Input component

### Data Structure

```typescript
interface Task {
  id: string;
  title: string;
  status: 'inbox' | 'active' | 'completed';
  projectId?: string;
  context?: string;
  createdAt: Date;
  completedAt?: Date;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
}

interface Context {
  id: string;
  name: string;
}
```

## Setup and Installation

1. **Prerequisites**
   - Node.js (v14 or later)
   - npm or yarn
   - Expo CLI

2. **Installation**
   ```bash
   # Clone the repository
   git clone [repository-url]

   # Navigate to project directory
   cd event-manager

   # Install dependencies
   npm install
   # or
   yarn install

   # Start the development server
   npm start
   # or
   yarn start
   ```

3. **Running the App**
   - Use Expo Go app on your mobile device
   - Scan the QR code from the terminal
   - Or run on an emulator/simulator

## Development Guidelines

### State Management
- Use `useTaskContext` hook for accessing and modifying data
- All data modifications should go through context methods
- Handle loading states appropriately in components

### Styling
- Use the themed components for consistent styling
- Follow the existing style patterns for new components
- Maintain dark mode compatibility

### Data Persistence
- All data is automatically saved to AsyncStorage
- No manual saving required
- Default data is provided for first-time users

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
