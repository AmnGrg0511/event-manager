import React from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import { Task } from '../types';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { FontAwesome } from '@expo/vector-icons';
import { useThemeColor } from '../hooks/useThemeColor';
import { useTaskContext } from '../context/TaskContext';

interface TaskItemProps {
    item: Task;
    onPressTask: (task: Task) => void;
}

export default function TaskItem({ item, onPressTask }: TaskItemProps) {
    const { updateTask, deleteTask } = useTaskContext();
    const activeColor = useThemeColor({ light: '#007AFF', dark: '#007AFF' }, 'tint');

    const handleStatusChange = () => {
        updateTask(item.id, {
            ...item,
            status: item.status === 'completed' ? 'active' : 'completed'
        });
    };

    const handleDelete = () => {
        deleteTask(item.id);
    };

    return (
        <ThemedView style={styles.container}>
            <Pressable 
                style={styles.checkbox} 
                onPress={handleStatusChange}
            >
                <FontAwesome 
                    name={item.status === 'completed' ? 'check-square-o' : 'square-o'} 
                    size={24} 
                    color={activeColor} 
                />
            </Pressable>

            <Pressable style={styles.content} onPress={() => onPressTask(item)}>
                <ThemedText 
                    style={[
                        styles.title,
                        item.status === 'completed' && styles.completedTitle
                    ]}
                >
                    {item.title}
                </ThemedText>
            </Pressable>

            <Pressable 
                style={styles.deleteButton} 
                onPress={handleDelete}
            >
                <FontAwesome name="trash" size={20} color="#FF3B30" />
            </Pressable>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginVertical: 4,
        borderRadius: 8,
        backgroundColor: 'transparent'
    },
    checkbox: {
        marginRight: 12
    },
    content: {
        flex: 1
    },
    title: {
        fontSize: 16
    },
    completedTitle: {
        textDecorationLine: 'line-through',
        color: '#888'
    },
    deleteButton: {
        padding: 8
    },
}); 