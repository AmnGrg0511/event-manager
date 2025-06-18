import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, FlatList, Pressable, Alert } from 'react-native';
import { useTaskContext } from '../../context/TaskContext';
import { Project, Task } from '../../types';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { ThemedTextInput } from '../../components/ThemedTextInput';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useThemeColor } from '../../hooks/useThemeColor';
import { FontAwesome } from '@expo/vector-icons';

export default function ProjectsScreen() {
    const { projects, tasks, addProject, updateTask, updateProject, deleteProject } = useTaskContext();
    const router = useRouter();
    const params = useLocalSearchParams();
    const inboxTaskId = params.inboxTaskId as string | undefined;

    const [newProjectName, setNewProjectName] = useState('');
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    const [editedProjectName, setEditedProjectName] = useState('');

    const progressContainerBg = useThemeColor({ light: '#eee', dark: '#555' }, 'background');
    const progressBarColor = useThemeColor({ light: '#007AFF', dark: '#007AFF' }, 'tint');
    const textColor = useThemeColor({}, 'text');
    const activeColor = useThemeColor({ light: '#007AFF', dark: '#007AFF' }, 'tint');
    const projectItemBorderColor = useThemeColor({ light: '#eee', dark: '#555' }, 'background');

    const handleAddProject = useCallback(() => {
        if (newProjectName.trim()) {
            const newProjectId = addProject({
                name: newProjectName.trim(),
            });
            setNewProjectName('');

            if (inboxTaskId) {
                updateTask(inboxTaskId, { status: 'active', projectId: newProjectId });
                router.replace({ pathname: '/(tabs)/inbox', params: { newProjectId: newProjectId, originalInboxTaskId: inboxTaskId } });
            }
        }
    }, [newProjectName, addProject, inboxTaskId, updateTask, router]);

    const getProjectTasks = useCallback((projectId: string) => {
        return tasks.filter(task => task.projectId === projectId);
    }, [tasks]);

    const handleEditProject = useCallback((project: Project) => {
        setEditingProjectId(project.id);
        setEditedProjectName(project.name);
    }, []);

    const handleSaveProject = useCallback((id: string) => {
        if (editedProjectName.trim()) {
            updateProject(id, { name: editedProjectName.trim() });
            setEditingProjectId(null);
            setEditedProjectName('');
        }
    }, [editedProjectName, updateProject]);

    const handleDeleteProject = useCallback((id: string) => {
        const projectTasks = getProjectTasks(id);
        if (projectTasks.length > 0) {
            Alert.alert(
                "Cannot Delete Project",
                "This project contains tasks. Please remove or reassign all tasks before deleting the project.",
                [{ text: "OK" }]
            );
            return;
        }

        Alert.alert(
            "Delete Project",
            "Are you sure you want to delete this project?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    onPress: () => {
                        deleteProject(id);
                    },
                    style: "destructive",
                },
            ],
            { cancelable: true }
        );
    }, [deleteProject, getProjectTasks]);

    const renderProject = useCallback(({ item }: { item: Project }) => {
        const projectTasks = getProjectTasks(item.id);
        const completedTasks = projectTasks.filter(task => task.status === 'completed');
        const progress = projectTasks.length > 0 ? (completedTasks.length / projectTasks.length) * 100 : 0;

        return (
            <ThemedView style={[styles.projectItem, { borderBottomColor: projectItemBorderColor }]}>
                <Pressable
                    style={styles.projectContent}
                    onPress={() => {
                        if (editingProjectId !== item.id) {
                            router.push({ pathname: '/projects/_projectId', params: { projectId: item.id } });
                        }
                    }}>
                    {editingProjectId === item.id ? (
                        <ThemedTextInput
                            value={editedProjectName}
                            onChangeText={setEditedProjectName}
                            style={[styles.editableField, { color: textColor }]}
                            autoFocus
                            onBlur={() => handleSaveProject(item.id)}
                            onSubmitEditing={() => handleSaveProject(item.id)}
                        />
                    ) : (
                        <ThemedText style={styles.projectName}>{item.name}</ThemedText>
                    )}
                    <ThemedView style={[styles.progressContainer, { backgroundColor: progressContainerBg }]}>
                        <ThemedView style={[styles.progressBar, { width: `${progress}%`, backgroundColor: progressBarColor }]} />
                    </ThemedView>
                    <ThemedText style={[styles.progressText, { color: textColor }]}>
                        {completedTasks.length} of {projectTasks.length} tasks completed
                    </ThemedText>
                </Pressable>
                <ThemedView style={styles.projectActions}>
                    {editingProjectId === item.id ? (
                        <Pressable onPress={() => handleSaveProject(item.id)} style={styles.actionIcon}>
                            <FontAwesome name="save" size={20} color={activeColor} />
                        </Pressable>
                    ) : (
                        <Pressable onPress={() => handleEditProject(item)} style={styles.actionIcon}>
                            <FontAwesome name="edit" size={20} color={activeColor} />
                        </Pressable>
                    )}
                    <Pressable onPress={() => handleDeleteProject(item.id)} style={styles.actionIcon}>
                        <FontAwesome name="trash" size={20} color="red" />
                    </Pressable>
                </ThemedView>
            </ThemedView>
        );
    }, [editingProjectId, editedProjectName, getProjectTasks, handleEditProject, handleDeleteProject, handleSaveProject, projectItemBorderColor, router, progressContainerBg, progressBarColor, textColor, activeColor]);

    return (
        <ThemedView style={styles.container}>
            <ThemedView style={styles.inputContainer}>
                <ThemedTextInput
                    value={newProjectName}
                    onChangeText={setNewProjectName}
                    placeholder="Add a new project..."
                    onSubmitEditing={handleAddProject}
                    returnKeyType="done"
                    style={[styles.input, { borderColor: projectItemBorderColor, color: textColor } ]}
                    placeholderTextColor={textColor}
                />
            </ThemedView>
            <FlatList
                data={projects}
                renderItem={renderProject}
                keyExtractor={item => item.id}
                style={styles.list}
                ListEmptyComponent={
                    <ThemedText style={styles.emptyText}>No projects found. Add one above!</ThemedText>
                }
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
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
    projectItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
    },
    projectContent: {
        flex: 1,
        marginRight: 10,
    },
    projectName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    progressContainer: {
        height: 8,
        borderRadius: 4,
        marginBottom: 8,
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 14,
    },
    projectActions: {
        flexDirection: 'row',
        marginLeft: 10,
    },
    actionIcon: {
        marginLeft: 15,
    },
    editableField: {
        fontSize: 18,
        fontWeight: 'bold',
        paddingVertical: 5,
        paddingHorizontal: 0,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
        color: '#888',
    },
}); 