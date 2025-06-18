import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Task, Project, TaskStatus, Context } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Default data for initial app state
const defaultContexts: Context[] = [
    { id: '1', name: '@computer' },
    { id: '2', name: '@home' },
    { id: '3', name: '@errands' },
    { id: '4', name: '@office' }
];

const defaultProjects: Project[] = [
    { id: '1', name: 'Personal', createdAt: new Date() },
    { id: '2', name: 'Work', createdAt: new Date() }
];

interface TaskContextType {
    tasks: Task[];
    projects: Project[];
    contexts: Context[];
    isLoading: boolean;
    addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    addProject: (project: Omit<Project, 'id' | 'createdAt'>) => string;
    updateProject: (id: string, updates: Partial<Project>) => void;
    deleteProject: (id: string) => void;
    addContext: (context: Omit<Context, 'id'>) => string;
    updateContext: (id: string, updates: Partial<Context>) => void;
    deleteContext: (id: string) => void;
    getTasksByStatus: (status: TaskStatus) => Task[];
    getTasksByContext: (contextId: string) => Task[];
    getTasksByProject: (projectId: string) => Task[];
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<Project[]>(defaultProjects);
    const [contexts, setContexts] = useState<Context[]>(defaultContexts);
    const [isLoading, setIsLoading] = useState(true);

    // Load data from AsyncStorage
    useEffect(() => {
        const loadData = async () => {
            try {
                const [storedTasks, storedProjects, storedContexts] = await Promise.all([
                    AsyncStorage.getItem('tasks'),
                    AsyncStorage.getItem('projects'),
                    AsyncStorage.getItem('contexts')
                ]);

                if (storedTasks) {
                    const parsedTasks = JSON.parse(storedTasks).map((task: any) => ({
                        ...task,
                        createdAt: new Date(task.createdAt),
                        ...(task.completedAt && { completedAt: new Date(task.completedAt) })
                    }));
                    setTasks(parsedTasks);
                }

                if (storedProjects) {
                    setProjects(JSON.parse(storedProjects).map((project: any) => ({
                        ...project,
                        createdAt: new Date(project.createdAt)
                    })));
                } else {
                    setProjects(defaultProjects);
                }

                if (storedContexts) {
                    setContexts(JSON.parse(storedContexts));
                } else {
                    setContexts(defaultContexts);
                }
            } catch (e) {
                console.error("Failed to load data from storage", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    // Save data to AsyncStorage
    useEffect(() => {
        const saveData = async () => {
            try {
                await Promise.all([
                    AsyncStorage.setItem('tasks', JSON.stringify(tasks)),
                    AsyncStorage.setItem('projects', JSON.stringify(projects)),
                    AsyncStorage.setItem('contexts', JSON.stringify(contexts))
                ]);
            } catch (e) {
                console.error("Failed to save data to storage", e);
            }
        };
        saveData();
    }, [tasks, projects, contexts]);

    // Task management
    const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt'>) => {
        const newTask = { ...task, id: Date.now().toString(), createdAt: new Date() };
        setTasks(prev => {
            const updatedTasks = [...prev, newTask];
            return updatedTasks;
        });
    }, []);

    const updateTask = useCallback((id: string, updates: Partial<Task>) => {
        setTasks(prev => {
            const updatedTasks = prev.map(task => task.id === id ? { ...task, ...updates } : task);
            return updatedTasks;
        });
    }, []);

    const deleteTask = useCallback((id: string) => {
        setTasks(prev => prev.filter(task => task.id !== id));
    }, []);

    // Project management
    const addProject = useCallback((project: Omit<Project, 'id' | 'createdAt'>) => {
        const newProject = { ...project, id: Date.now().toString(), createdAt: new Date() };
        setProjects(prev => [...prev, newProject]);
        return newProject.id;
    }, []);

    const updateProject = useCallback((id: string, updates: Partial<Project>) => {
        setProjects(prev => prev.map(project => project.id === id ? { ...project, ...updates } : project));
    }, []);

    const deleteProject = useCallback((id: string) => {
        setProjects(prev => prev.filter(project => project.id !== id));
    }, []);

    // Context management
    const addContext = useCallback((context: Omit<Context, 'id'>) => {
        const newContext = { ...context, id: Date.now().toString() };
        setContexts(prev => [...prev, newContext]);
        return newContext.id;
    }, []);

    const updateContext = useCallback((id: string, updates: Partial<Context>) => {
        setContexts(prev => prev.map(context => context.id === id ? { ...context, ...updates } : context));
    }, []);

    const deleteContext = useCallback((id: string) => {
        setContexts(prev => prev.filter(context => context.id !== id));
        setTasks(prev => prev.map(task => task.context === id ? { ...task, context: undefined } : task));
    }, []);

    // Task filtering
    const getTasksByStatus = useCallback((status: TaskStatus) => 
        tasks.filter(task => task.status === status), [tasks]);

    const getTasksByContext = useCallback((contextId: string) => 
        tasks.filter(task => task.context === contextId), [tasks]);

    const getTasksByProject = useCallback((projectId: string) => 
        tasks.filter(task => task.projectId === projectId), [tasks]);

    return (
        <TaskContext.Provider value={{
            tasks, projects, contexts, isLoading,
            addTask, updateTask, deleteTask,
            addProject, updateProject, deleteProject,
            addContext, updateContext, deleteContext,
            getTasksByStatus, getTasksByContext, getTasksByProject
        }}>
            {children}
        </TaskContext.Provider>
    );
};

export const useTaskContext = () => {
    const context = useContext(TaskContext);
    if (!context) throw new Error('useTaskContext must be used within a TaskProvider');
    return context;
}; 