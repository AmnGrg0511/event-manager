import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { useTaskContext } from '../../context/TaskContext';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { ThemedTextInput } from '../../components/ThemedTextInput';
import TaskItem from '../../components/TaskItem';
import { useThemeColor } from '../../hooks/useThemeColor';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Task } from '../../types';
import ProcessTaskSheet from '../../components/ProcessTaskSheet';

export default function InboxScreen() {
    const { tasks, addTask, isLoading, updateTask } = useTaskContext();
    const router = useRouter();
    const params = useLocalSearchParams();

    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [selectedTaskForProcessing, setSelectedTaskForProcessing] = useState<Task | null>(null);
    const textColor = useThemeColor({}, 'text');
    const borderColor = useThemeColor({ light: '#ddd', dark: '#555' }, 'background');

    useEffect(() => {
        if (params.newProjectId && params.originalInboxTaskId) {
            const originalInboxTaskId = params.originalInboxTaskId as string;
            const newProjectId = params.newProjectId as string;
            updateTask(originalInboxTaskId, { status: 'active', projectId: newProjectId });
            router.setParams({ newProjectId: undefined, originalInboxTaskId: undefined });
        } else if (params.targetProjectId) {
            router.setParams({ targetProjectId: undefined });
        }
    }, [params, updateTask, router]);

    const inboxTasks = useMemo(() => 
        tasks.filter(task => task.status === 'inbox' && !task.projectId && !task.context)
    , [tasks]);

    const handleAddTask = useCallback(() => {
        if (newTaskTitle.trim()) {
            const targetProjectId = params.targetProjectId as string | undefined;
            addTask({
                title: newTaskTitle.trim(),
                status: targetProjectId ? 'active' : 'inbox',
                projectId: targetProjectId ? String(targetProjectId) : undefined,
                context: undefined,
            });
            setNewTaskTitle('');
            if (targetProjectId) {
                router.replace({ pathname: '/projects/_projectId', params: { projectId: targetProjectId } });
            }
        }
    }, [newTaskTitle, addTask, params.targetProjectId, router]);

    const handleProcessTask = useCallback((task: Task) => {
        setSelectedTaskForProcessing(task);
    }, []);

    const handleCloseProcessSheet = useCallback(() => {
        setSelectedTaskForProcessing(null);
    }, []);

    if (isLoading) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText style={styles.title}>Loading tasks...</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <ThemedView style={styles.header}>
                <ThemedText style={styles.headerSubtitle}>
                    Capture tasks here, then process them by adding context or project
                </ThemedText>
            </ThemedView>

            <ThemedView style={styles.inputContainer}>
                <ThemedTextInput
                    style={[styles.input, { borderColor: borderColor, color: textColor } ]}
                    placeholder="Add a new task..."
                    value={newTaskTitle}
                    onChangeText={setNewTaskTitle}
                    onSubmitEditing={handleAddTask}
                    placeholderTextColor={textColor}
                />
            </ThemedView>

            <FlatList
                data={inboxTasks}
                renderItem={({ item }) => <TaskItem item={item} onPressTask={handleProcessTask} />}
                keyExtractor={(item: Task) => item.id}
                style={styles.list}
                ListEmptyComponent={
                    <ThemedText style={styles.emptyText}>No tasks in your inbox. Great job!</ThemedText>
                }
            />

            {selectedTaskForProcessing && (
                <ProcessTaskSheet
                    visible={!!selectedTaskForProcessing}
                    onClose={handleCloseProcessSheet}
                    task={selectedTaskForProcessing}
                />
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    header: {
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#888',
    },
    inputContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        borderRadius: 8,
        overflow: 'hidden',
    },
    input: {
        flex: 1,
        padding: 12,
        fontSize: 16,
        borderWidth: 1,
        borderRadius: 8,
    },
    list: {
        flex: 1,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
        color: '#888',
    },
}); 