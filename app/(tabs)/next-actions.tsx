import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, FlatList, Pressable, Alert, ScrollView } from 'react-native';
import { useTaskContext } from '../../context/TaskContext';
import { Task, Context } from '../../types';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { ThemedTextInput } from '../../components/ThemedTextInput';
import { FontAwesome } from '@expo/vector-icons';
import { useThemeColor } from '../../hooks/useThemeColor';
import TaskItem from '../../components/TaskItem';
import ProcessTaskSheet from '../../components/ProcessTaskSheet';

export default function NextActionsScreen() {
    const { tasks, contexts, addContext, updateContext, deleteContext, getTasksByContext } = useTaskContext();
    const [newContextName, setNewContextName] = useState('');
    const [editingContextId, setEditingContextId] = useState<string | null>(null);
    const [editedContextName, setEditedContextName] = useState('');
    const [selectedContext, setSelectedContext] = useState<string | null>(null);
    const [selectedTaskForProcessing, setSelectedTaskForProcessing] = useState<Task | null>(null);

    const activeColor = useThemeColor({ light: '#007AFF', dark: '#007AFF' }, 'tint');
    const borderColor = useThemeColor({ light: '#eee', dark: '#555' }, 'background');
    const textColor = useThemeColor({}, 'text');

    const handleAddContext = useCallback(() => {
        if (newContextName.trim()) {
            addContext({ name: newContextName.trim() });
            setNewContextName('');
        }
    }, [newContextName, addContext]);

    const handleEditContext = useCallback((context: Context) => {
        setEditingContextId(context.id);
        setEditedContextName(context.name);
    }, []);

    const handleSaveContext = useCallback((id: string) => {
        if (editedContextName.trim()) {
            updateContext(id, { name: editedContextName.trim() });
            setEditingContextId(null);
            setEditedContextName('');
        }
    }, [editedContextName, updateContext]);

    const handleDeleteContext = useCallback((id: string) => {
        const tasksInContext = getTasksByContext(id);
        if (tasksInContext.length > 0) {
            Alert.alert(
                "Cannot Delete Context",
                "This context is currently assigned to tasks. Please remove it from all tasks before deleting.",
                [{ text: "OK" }]
            );
            return;
        }

        Alert.alert(
            "Delete Context",
            "Are you sure you want to delete this context?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    onPress: () => {
                        deleteContext(id);
                        if (selectedContext === id) {
                            setSelectedContext(null);
                        }
                    },
                    style: "destructive",
                },
            ],
            { cancelable: true }
        );
    }, [deleteContext, getTasksByContext, selectedContext]);

    const activeTasks = useMemo(() => tasks.filter(task => task.status === 'active'), [tasks]);
    const filteredTasks = useMemo(() => 
        selectedContext
            ? activeTasks.filter(task => task.context === selectedContext)
            : activeTasks
    , [selectedContext, activeTasks]);

    const handleProcessTask = useCallback((task: Task) => {
        setSelectedTaskForProcessing(task);
    }, []);

    const handleCloseProcessSheet = useCallback(() => {
        setSelectedTaskForProcessing(null);
    }, []);

    const renderContextItem = useCallback(({ item }: { item: Context }) => (
        <Pressable
            key={item.id}
            style={[
                styles.contextItem,
                selectedContext === item.id && { backgroundColor: activeColor + '20' },
                { borderColor }
            ]}
            onLongPress={() => handleEditContext(item)}
            onPress={() => setSelectedContext(selectedContext === item.id ? null : item.id)}
        >
            {editingContextId === item.id ? (
                <ThemedTextInput
                    value={editedContextName}
                    onChangeText={setEditedContextName}
                    style={[styles.editableField, { color: textColor }]}
                    autoFocus
                    onBlur={() => handleSaveContext(item.id)}
                    onSubmitEditing={() => handleSaveContext(item.id)}
                />
            ) : (
                <ThemedView style={styles.contextContent}>
                    <ThemedText style={styles.contextName}>{item.name}</ThemedText>
                    <ThemedView style={styles.contextActions}>
                        <Pressable onPress={() => handleDeleteContext(item.id)} style={styles.actionIcon}>
                            <FontAwesome name="trash" size={16} color="red" />
                        </Pressable>
                    </ThemedView>
                </ThemedView>
            )}
        </Pressable>
    ), [editingContextId, editedContextName, selectedContext, activeColor, borderColor, textColor, handleSaveContext, handleEditContext, handleDeleteContext]);

    const renderTask = useCallback(({ item }: { item: Task }) => (
        <TaskItem item={item} onPressTask={handleProcessTask} />
    ), [handleProcessTask]);

    return (
        <ThemedView style={styles.container}>
            <ThemedView style={styles.header}>
                <ThemedText style={styles.headerSubtitle}>
                    Tasks with contexts - organize by where you can do them
                </ThemedText>
            </ThemedView>

            <ThemedView style={styles.contextsSection}>
                <ThemedText style={styles.sectionTitle}>Contexts</ThemedText>
                <ThemedView style={styles.inputContainer}>
                    <ThemedTextInput
                        value={newContextName}
                        onChangeText={setNewContextName}
                        placeholder="Add a new context..."
                        onSubmitEditing={handleAddContext}
                        returnKeyType="done"
                        style={[styles.input, { color: textColor } ]}
                        placeholderTextColor={textColor}
                    />
                </ThemedView>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.contextsList}>
                    {contexts.map(context => renderContextItem({ item: context }))}
                </ScrollView>
            </ThemedView>

            <ThemedView style={styles.tasksSection}>
                <ThemedText style={styles.sectionTitle}>
                    {selectedContext
                        ? `Tasks in ${contexts.find(c => c.id === selectedContext)?.name}`
                        : 'All Active Tasks'}
                </ThemedText>
                <FlatList
                    data={filteredTasks}
                    renderItem={renderTask}
                    keyExtractor={item => item.id}
                    style={styles.list}
                    ListEmptyComponent={
                        <ThemedView style={styles.emptyState}>
                            <FontAwesome name="inbox" style={styles.emptyIcon} />
                            <ThemedText style={styles.emptyText}>No next actions. You are free, pick up something.</ThemedText>
                        </ThemedView>
                    }
                />
            </ThemedView>

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
    header: {
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#888',
        marginBottom: 12,
    },
    contextsSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        marginBottom: 10,
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#444',
        backgroundColor: '#181818',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#fff',
        backgroundColor: 'transparent',
        borderWidth: 0,
    },
    contextsList: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    contextItem: {
        padding: 10,
        borderRadius: 8,
        marginRight: 10,
        borderWidth: 1,
    },
    contextContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    contextName: {
        fontSize: 16,
        fontWeight: '500',
    },
    contextActions: {
        flexDirection: 'row',
        marginLeft: 10,
    },
    actionIcon: {
        marginLeft: 8,
    },
    editableField: {
        fontSize: 16,
        padding: 0,
        borderWidth: 0,
        height: 18,
    },
    tasksSection: {
        flex: 1,
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
    taskRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 8,
        borderRadius: 10,
        marginBottom: 6,
        backgroundColor: '#232323',
    },
    taskTitle: {
        flex: 1,
        fontSize: 17,
        color: '#fff',
        marginLeft: 12,
    },
    deleteButton: {
        padding: 12,
        marginLeft: 8,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 40,
    },
    emptyIcon: {
        fontSize: 40,
        color: '#888',
        marginBottom: 8,
    },
}); 