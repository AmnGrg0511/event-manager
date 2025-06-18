import React, { useState, useCallback, useEffect } from 'react';
import { Modal, StyleSheet, Pressable, View, Platform, Alert } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useThemeColor } from '../hooks/useThemeColor';
import { Task } from '../types';
import { useTaskContext } from '../context/TaskContext';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';

interface ProcessTaskSheetProps {
  visible: boolean;
  onClose: () => void;
  task: Task;
}

const ProcessTaskSheet: React.FC<ProcessTaskSheetProps> = ({
  visible,
  onClose,
  task,
}) => {
  const { updateTask, projects, contexts } = useTaskContext();
  const router = useRouter();

  const [selectedContext, setSelectedContext] = useState<string | ''>('');
  const [selectedProject, setSelectedProject] = useState<string | ''>('');

  const modalBackgroundColor = useThemeColor({ light: 'white', dark: '#333' }, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#ccc', dark: '#555' }, 'background');
  const pickerBackgroundColor = useThemeColor({ light: 'white', dark: '#444' }, 'background');
  const pickerItemBackgroundColor = useThemeColor({ light: 'white', dark: '#333' }, 'background');

  useEffect(() => {
    if (visible) {
      setSelectedContext(task.context || '');
      setSelectedProject(task.projectId || '');
    }
  }, [visible, task]);

  const handleContextChange = useCallback((itemValue: string | '') => {
    setSelectedContext(itemValue);
    if (itemValue) {
      const selectedContextName = contexts.find(c => c.id === itemValue)?.name;
      Alert.alert(
        "Move to Next Actions",
        `This will move "${task.title}" to Next Actions under ${selectedContextName} context. Continue?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Move Task",
            onPress: () => {
              updateTask(task.id, { status: 'active', context: itemValue, projectId: undefined });
              onClose();
            }
          }
        ]
      );
    }
  }, [task.id, task.title, updateTask, onClose, contexts]);

  const handleProjectChange = useCallback((itemValue: string) => {
    setSelectedProject(itemValue);
    if (itemValue === 'new-project') {
      router.push({ pathname: '/(tabs)/projects', params: { inboxTaskId: task.id } });
      onClose();
    } else if (itemValue) {
      const selectedProjectName = projects.find(p => p.id === itemValue)?.name;
      Alert.alert(
        "Move to Project",
        `This will move "${task.title}" to the ${selectedProjectName} project. Continue?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Move Task",
            onPress: () => {
              updateTask(task.id, { status: 'active', projectId: itemValue, context: undefined });
              onClose();
            }
          }
        ]
      );
    }
  }, [task.id, task.title, updateTask, onClose, router, projects]);

  const projectItems = projects.map(p => ({ label: p.name, value: p.id }));

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <ThemedView style={[styles.sheetContainer, { backgroundColor: modalBackgroundColor }]}>
          <ThemedView style={styles.handle} />
          <ThemedText style={[styles.title, { color: textColor }]}>Process: {task.title}</ThemedText>

          <ThemedText style={[styles.label, { color: textColor }]}>Context (moves to Next Actions):</ThemedText>
          <View style={[styles.pickerContainer, { borderColor, backgroundColor: pickerBackgroundColor }]}>
            <Picker
              selectedValue={selectedContext}
              onValueChange={handleContextChange}
              style={[styles.picker, { color: textColor, backgroundColor: pickerBackgroundColor }]}
              itemStyle={{ color: textColor, backgroundColor: pickerItemBackgroundColor }}
            >
              <Picker.Item 
                label="-- Select Context (Optional) --" 
                value="" 
                color={textColor}
                style={{ backgroundColor: pickerItemBackgroundColor }}
              />
              {contexts.map(c => (
                <Picker.Item 
                  key={c.id} 
                  label={c.name} 
                  value={c.id} 
                  color={textColor}
                  style={{ backgroundColor: pickerItemBackgroundColor }}
                />
              ))}
            </Picker>
          </View>

          <ThemedText style={[styles.label, { color: textColor }]}>Project:</ThemedText>
          <View style={[styles.pickerContainer, { borderColor, backgroundColor: pickerBackgroundColor }]}>
            <Picker
              selectedValue={selectedProject}
              onValueChange={handleProjectChange}
              style={[styles.picker, { color: textColor, backgroundColor: pickerBackgroundColor }]}
              itemStyle={{ color: textColor, backgroundColor: pickerItemBackgroundColor }}
            >
              <Picker.Item 
                label="-- Select Project (Optional) --" 
                value="" 
                color={textColor}
                style={{ backgroundColor: pickerItemBackgroundColor }}
              />
              {[...projectItems, { label: '+ New Project', value: 'new-project' }].map(item => (
                <Picker.Item 
                  key={item.value} 
                  label={item.label} 
                  value={item.value} 
                  color={textColor}
                  style={{ backgroundColor: pickerItemBackgroundColor }}
                />
              ))}
            </Picker>
          </View>
        </ThemedView>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheetContainer: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
    alignSelf: 'center',
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    marginTop: 10,
    fontWeight: '600',
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: Platform.OS === 'ios' ? 150 : 50,
  },
});

export default ProcessTaskSheet; 