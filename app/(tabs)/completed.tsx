import React, { useMemo, useState, useCallback } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { useTaskContext } from '../../context/TaskContext';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { Task } from '../../types';
import TaskItem from '../../components/TaskItem';
import ProcessTaskSheet from '../../components/ProcessTaskSheet';

export default function CompletedTasksScreen() {
  const { tasks } = useTaskContext();
  const [selectedTaskForProcessing, setSelectedTaskForProcessing] = useState<Task | null>(null);

  const completedTasks = useMemo(() => 
    tasks.filter(task => task.status === 'completed')
  , [tasks]);

  const handleProcessTask = useCallback((task: Task) => {
    setSelectedTaskForProcessing(task);
  }, []);

  const handleCloseProcessSheet = useCallback(() => {
    setSelectedTaskForProcessing(null);
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Completed Tasks</ThemedText>
      <FlatList
        data={completedTasks}
        renderItem={({ item }) => <TaskItem item={item} onPressTask={handleProcessTask} />}
        keyExtractor={(item: Task) => item.id}
        style={styles.list}
        ListEmptyComponent={
          <ThemedText style={styles.emptyText}>No tasks completed yet.</ThemedText>
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
}); 