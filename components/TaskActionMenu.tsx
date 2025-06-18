import React, { useCallback } from 'react';
import { Modal, StyleSheet, Pressable, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useThemeColor } from '../hooks/useThemeColor';

interface TaskActionMenuProps {
  visible: boolean;
  onClose: () => void;
  onProcess: () => void;
  onComplete: () => void;
  onDelete: () => void;
}

const TaskActionMenu: React.FC<TaskActionMenuProps> = ({
  visible,
  onClose,
  onProcess,
  onComplete,
  onDelete,
}) => {
  const modalBackgroundColor = useThemeColor({ light: 'white', dark: '#333' }, 'background');
  const textColor = useThemeColor({}, 'text');
  const separatorColor = useThemeColor({ light: '#eee', dark: '#555' }, 'background');

  const handleProcess = useCallback(() => {
    onProcess();
    onClose();
  }, [onProcess, onClose]);

  const handleComplete = useCallback(() => {
    onComplete();
    onClose();
  }, [onComplete, onClose]);

  const handleDelete = useCallback(() => {
    onDelete();
    onClose();
  }, [onDelete, onClose]);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <ThemedView style={[styles.menuContainer, { backgroundColor: modalBackgroundColor }]}>
          <Pressable style={styles.menuItem} onPress={handleProcess}>
            <ThemedText style={[styles.menuText, { color: textColor }]}>Process Task</ThemedText>
          </Pressable>
          <View style={[styles.separator, { backgroundColor: separatorColor }]} />
          <Pressable style={styles.menuItem} onPress={handleComplete}>
            <ThemedText style={[styles.menuText, { color: textColor }]}>Complete Task</ThemedText>
          </Pressable>
          <View style={[styles.separator, { backgroundColor: separatorColor }]} />
          <Pressable style={styles.menuItem} onPress={handleDelete}>
            <ThemedText style={[styles.menuText, { color: 'red' }]}>Delete Task</ThemedText>
          </Pressable>
        </ThemedView>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    width: '80%',
    maxWidth: 300,
  },
  menuItem: {
    padding: 15,
    alignItems: 'center',
  },
  menuText: {
    fontSize: 18,
  },
  separator: {
    height: 1,
    width: '100%',
  },
});

export default TaskActionMenu; 