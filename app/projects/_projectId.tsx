import React, { useMemo } from 'react';
import { StyleSheet, FlatList, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTaskContext } from '../../context/TaskContext';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { Task, Project } from '../../types';
import TaskItem from '../../components/TaskItem';
import { FontAwesome } from '@expo/vector-icons';
import { useThemeColor } from '../../hooks/useThemeColor';

export default function ProjectDetailScreen() {
  const { tasks, projects, isLoading } = useTaskContext();
  const router = useRouter();
  const { projectId: rawProjectId } = useLocalSearchParams();
  const projectId = Array.isArray(rawProjectId) ? rawProjectId[0] : rawProjectId;
  const activeColor = useThemeColor({ light: '#007AFF', dark: '#007AFF' }, 'tint');

  const handlePressTask = (task: Task) => {
    // Handle press on task - could open a menu or show options
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>Loading tasks...</ThemedText>
      </ThemedView>
    );
  }

  if (!projectId || typeof projectId !== 'string') {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>Invalid Project</ThemedText>
        <Pressable 
          style={[styles.backButton, { backgroundColor: activeColor }]} 
          onPress={() => router.back()}
        >
          <ThemedText style={{ color: 'white' }}>Go Back</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  const project = projects.find((p: Project) => p.id === projectId);
  const allProjectTasks = useMemo(() => 
    tasks.filter((task: Task) => task.projectId === projectId),
    [tasks, projectId]
  );
  const activeProjectTasks = useMemo(() => 
    allProjectTasks.filter((task: Task) => task.status !== 'completed'),
    [allProjectTasks]
  );

  if (!project) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>Project Not Found</ThemedText>
        <Pressable 
          style={[styles.backButton, { backgroundColor: activeColor }]} 
          onPress={() => router.back()}
        >
          <ThemedText style={{ color: 'white' }}>Go Back</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>{project.name}</ThemedText>
      {project.description && (
        <ThemedText style={styles.description}>{project.description}</ThemedText>
      )}

      <FlatList
        data={activeProjectTasks}
        renderItem={({ item }) => <TaskItem item={item} onPressTask={handlePressTask} />}
        keyExtractor={(item: Task) => item.id}
        style={styles.list}
        ItemSeparatorComponent={() => <ThemedView style={styles.separator} />}
        ListEmptyComponent={
          <ThemedText style={styles.emptyText}>No active tasks in this project.</ThemedText>
        }
      />
      <ThemedText style={styles.completedCount}>
        Completed: {allProjectTasks.filter((task: Task) => task.status === 'completed').length}
      </ThemedText>
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
  description: {
    fontSize: 16,
    marginBottom: 16,
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
  completedCount: {
    fontSize: 14,
    textAlign: 'right',
    marginTop: 10,
    marginBottom: 10,
    color: '#888',
    marginRight: 20,
  },
  backButton: {
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  separator: {
    height: 12,
  },
}); 