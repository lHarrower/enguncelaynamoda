import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '@/hooks/useAuth';
import { useEfficiencyScore } from '@/hooks/useEfficiencyScore';
import { EfficiencyGoal } from '@/services/efficiencyScoreService';
import { IoniconsName } from '@/types/icons';

const { width } = Dimensions.get('window');

interface EfficiencyGoalsProps {
  onGoalCreated?: (goal: EfficiencyGoal) => void;
  onGoalSelected?: (goal: EfficiencyGoal) => void;
}

export const EfficiencyGoals: React.FC<EfficiencyGoalsProps> = ({
  onGoalCreated,
  onGoalSelected,
}) => {
  const { user } = useAuth();
  const { goals, efficiencyScore, createGoal, refreshGoals, error, clearError, getScoreColor } =
    useEfficiencyScore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    type: 'utilization' as EfficiencyGoal['type'],
    target: 80,
    description: '',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    refreshGoals();
  }, [refreshGoals]);

  const goalTypes = [
    {
      key: 'utilization',
      label: 'Utilization',
      icon: 'shirt-outline',
      description: 'Wear more of your wardrobe regularly',
    },
    {
      key: 'cost_efficiency',
      label: 'Cost Efficiency',
      icon: 'cash-outline',
      description: 'Optimize cost per wear',
    },
    {
      key: 'sustainability',
      label: 'Sustainability',
      icon: 'leaf-outline',
      description: 'Improve item care and longevity',
    },
    {
      key: 'versatility',
      label: 'Versatility',
      icon: 'shuffle-outline',
      description: 'Create more outfit combinations',
    },
    {
      key: 'curation',
      label: 'Curation',
      icon: 'star-outline',
      description: 'Build a quality, cohesive wardrobe',
    },
  ];

  const getCurrentScore = (type: EfficiencyGoal['type']): number => {
    if (!efficiencyScore) {
      return 0;
    }

    switch (type) {
      case 'utilization':
        return efficiencyScore.breakdown.utilization;
      case 'cost_efficiency':
        return efficiencyScore.breakdown.costEfficiency;
      case 'sustainability':
        return efficiencyScore.breakdown.sustainability;
      case 'versatility':
        return efficiencyScore.breakdown.versatility;
      case 'curation':
        return efficiencyScore.breakdown.curation;
      default:
        return 0;
    }
  };

  const handleCreateGoal = async () => {
    if (!user?.id) {
      return;
    }

    if (!newGoal.description.trim()) {
      Alert.alert('Error', 'Please enter a goal description');
      return;
    }

    if (newGoal.target <= getCurrentScore(newGoal.type)) {
      Alert.alert('Error', 'Target score must be higher than your current score');
      return;
    }

    try {
      const goalData = {
        userId: user.id,
        type: newGoal.type,
        target: newGoal.target,
        current: getCurrentScore(newGoal.type),
        deadline: newGoal.deadline,
        description: newGoal.description,
        milestones: [
          {
            value: Math.floor((getCurrentScore(newGoal.type) + newGoal.target) / 2),
            achieved: false,
          },
          { value: newGoal.target, achieved: false },
        ],
      };

      await createGoal(goalData);
      setShowCreateModal(false);
      setNewGoal({
        type: 'utilization',
        target: 80,
        description: '',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      onGoalCreated?.(goalData as EfficiencyGoal);
    } catch (err) {
      Alert.alert('Error', 'Failed to create goal');
    }
  };

  const calculateProgress = (goal: EfficiencyGoal): number => {
    const currentScore = getCurrentScore(goal.type);
    const progress = ((currentScore - goal.current) / (goal.target - goal.current)) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  const getDaysRemaining = (deadline: Date): number => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getGoalStatusColor = (goal: EfficiencyGoal): string => {
    const daysRemaining = getDaysRemaining(goal.deadline);
    const progress = calculateProgress(goal);

    if (progress >= 100) {
      return '#4CAF50';
    } // Completed
    if (daysRemaining <= 7 && progress < 50) {
      return '#F44336';
    } // At risk
    if (progress >= 50) {
      return '#FF9800';
    } // On track
    return '#9E9E9E'; // Behind
  };

  const renderGoalCard = (goal: EfficiencyGoal) => {
    const goalType = goalTypes.find((t) => t.key === goal.type);
    const progress = calculateProgress(goal);
    const daysRemaining = getDaysRemaining(goal.deadline);
    const statusColor = getGoalStatusColor(goal);
    const currentScore = getCurrentScore(goal.type);

    return (
      <TouchableOpacity
        key={goal.id}
        style={styles.goalCard}
        onPress={() => onGoalSelected?.(goal)}
        accessibilityRole="button"
        accessibilityLabel={`${goalType?.label} goal: ${goal.description}`}
        accessibilityHint="Tap to view goal details and progress"
      >
        <View style={styles.goalHeader}>
          <View style={styles.goalTypeContainer}>
            <Ionicons name={goalType?.icon as IoniconsName} size={24} color={statusColor} />
            <View style={styles.goalTypeText}>
              <Text style={styles.goalTypeLabel}>{goalType?.label}</Text>
              <Text style={styles.goalDescription}>{goal.description}</Text>
            </View>
          </View>
          <View style={styles.goalScores}>
            <Text style={styles.currentScore}>{currentScore}</Text>
            <Text style={styles.scoreArrow}>→</Text>
            <Text style={styles.targetScore}>{goal.target}</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%`,
                  backgroundColor: statusColor,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </View>

        <View style={styles.goalFooter}>
          <View style={styles.deadlineContainer}>
            <Ionicons name="time-outline" size={16} color="#64748B" />
            <Text style={styles.deadlineText}>
              {daysRemaining > 0 ? `${daysRemaining} days left` : 'Overdue'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>
              {progress >= 100
                ? 'Completed'
                : daysRemaining <= 7 && progress < 50
                  ? 'At Risk'
                  : progress >= 50
                    ? 'On Track'
                    : 'Behind'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCreateGoalModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowCreateModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            onPress={() => setShowCreateModal(false)}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            accessibilityHint="Tap to cancel creating a new goal"
          >
            <Text style={styles.modalCancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Create Efficiency Goal</Text>
          <TouchableOpacity
            onPress={handleCreateGoal}
            accessibilityRole="button"
            accessibilityLabel="Create goal"
            accessibilityHint="Tap to create the new efficiency goal"
          >
            <Text style={styles.modalCreateButton}>Create</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Goal Type</Text>
            <View style={styles.goalTypeSelector}>
              {goalTypes.map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.goalTypeOption,
                    newGoal.type === type.key && styles.goalTypeOptionSelected,
                  ]}
                  onPress={() =>
                    setNewGoal((prev) => ({ ...prev, type: type.key as EfficiencyGoal['type'] }))
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${type.label} goal type`}
                  accessibilityHint={`Tap to select ${type.label} as your goal type`}
                  accessibilityState={{ selected: newGoal.type === type.key }}
                >
                  <Ionicons
                    name={type.icon as IoniconsName}
                    size={20}
                    color={newGoal.type === type.key ? '#6366F1' : '#64748B'}
                  />
                  <Text
                    style={[
                      styles.goalTypeOptionText,
                      newGoal.type === type.key && styles.goalTypeOptionTextSelected,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.goalTypeDescription}>
              {goalTypes.find((t) => t.key === newGoal.type)?.description}
            </Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Current Score: {getCurrentScore(newGoal.type)}</Text>
            <Text style={styles.formLabel}>Target Score</Text>
            <View style={styles.targetScoreContainer}>
              <TouchableOpacity
                style={styles.scoreButton}
                onPress={() =>
                  setNewGoal((prev) => ({
                    ...prev,
                    target: Math.max(prev.target - 5, getCurrentScore(newGoal.type) + 1),
                  }))
                }
                accessibilityRole="button"
                accessibilityLabel="Decrease target score"
                accessibilityHint="Tap to decrease the target score by 5 points"
              >
                <Ionicons name="remove" size={20} color="#6366F1" />
              </TouchableOpacity>
              <Text style={styles.targetScoreValue}>{newGoal.target}</Text>
              <TouchableOpacity
                style={styles.scoreButton}
                onPress={() =>
                  setNewGoal((prev) => ({ ...prev, target: Math.min(prev.target + 5, 100) }))
                }
                accessibilityRole="button"
                accessibilityLabel="Increase target score"
                accessibilityHint="Tap to increase the target score by 5 points"
              >
                <Ionicons name="add" size={20} color="#6366F1" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Description</Text>
            <TextInput
              style={styles.descriptionInput}
              value={newGoal.description}
              onChangeText={(text) => setNewGoal((prev) => ({ ...prev, description: text }))}
              placeholder="Describe your goal..."
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Deadline</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
              accessibilityRole="button"
              accessibilityLabel="Select deadline date"
              accessibilityHint="Tap to open date picker and select a deadline for your goal"
            >
              <Ionicons name="calendar-outline" size={20} color="#6366F1" />
              <Text style={styles.dateButtonText}>{newGoal.deadline.toLocaleDateString()}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {showDatePicker && (
          <DateTimePicker
            value={newGoal.deadline}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setNewGoal((prev) => ({ ...prev, deadline: selectedDate }));
              }
            }}
          />
        )}
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Efficiency Goals</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
          accessibilityRole="button"
          accessibilityLabel="Create new goal"
          accessibilityHint="Tap to open the create goal modal"
        >
          <Ionicons name="add" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {goals.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="flag-outline" size={64} color="#CBD5E1" />
          <Text style={styles.emptyStateTitle}>No Goals Yet</Text>
          <Text style={styles.emptyStateText}>
            Set efficiency goals to track your wardrobe optimization progress
          </Text>
          <TouchableOpacity
            style={styles.emptyStateButton}
            onPress={() => setShowCreateModal(true)}
            accessibilityRole="button"
            accessibilityLabel="Create your first goal"
            accessibilityHint="Tap to create your first efficiency goal"
          >
            <Text style={styles.emptyStateButtonText}>Create Your First Goal</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.goalsList} showsVerticalScrollIndicator={false}>
          {goals.map(renderGoalCard)}
        </ScrollView>
      )}

      {renderCreateGoalModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    flex: 1,
  },
  createButton: {
    alignItems: 'center',
    backgroundColor: '#6366F1',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  currentScore: {
    color: '#1E293B',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dateButton: {
    alignItems: 'center',
    borderColor: '#E2E8F0',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 12,
  },
  dateButtonText: {
    color: '#1E293B',
    fontSize: 16,
    marginLeft: 8,
  },
  deadlineContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  deadlineText: {
    color: '#64748B',
    fontSize: 12,
    marginLeft: 4,
  },
  descriptionInput: {
    borderColor: '#E2E8F0',
    borderRadius: 8,
    borderWidth: 1,
    color: '#1E293B',
    fontSize: 16,
    padding: 12,
    textAlignVertical: 'top',
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateButton: {
    backgroundColor: '#6366F1',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyStateText: {
    color: '#64748B',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyStateTitle: {
    color: '#1E293B',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
  },
  formLabel: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  formSection: {
    marginBottom: 24,
  },
  goalCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  goalDescription: {
    color: '#64748B',
    fontSize: 14,
    marginTop: 2,
  },
  goalFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  goalScores: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  goalTypeContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
  },
  goalTypeDescription: {
    color: '#64748B',
    fontSize: 14,
    fontStyle: 'italic',
  },
  goalTypeLabel: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '600',
  },
  goalTypeOption: {
    alignItems: 'center',
    borderColor: '#E2E8F0',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 8,
    padding: 12,
  },
  goalTypeOptionSelected: {
    backgroundColor: '#F0F4FF',
    borderColor: '#6366F1',
  },
  goalTypeOptionText: {
    color: '#64748B',
    fontSize: 16,
    marginLeft: 12,
  },
  goalTypeOptionTextSelected: {
    color: '#6366F1',
    fontWeight: '600',
  },
  goalTypeSelector: {
    marginBottom: 8,
  },
  goalTypeText: {
    flex: 1,
    marginLeft: 12,
  },
  goalsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 10,
  },
  modalCancelButton: {
    color: '#64748B',
    fontSize: 16,
  },
  modalContainer: {
    backgroundColor: '#F8FAFC',
    flex: 1,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalCreateButton: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: '600',
  },
  modalHeader: {
    alignItems: 'center',
    borderBottomColor: '#E2E8F0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  modalTitle: {
    color: '#1E293B',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBar: {
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    flex: 1,
    height: 8,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  progressFill: {
    borderRadius: 4,
    height: '100%',
  },
  progressText: {
    color: '#1E293B',
    fontSize: 14,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
  scoreArrow: {
    color: '#64748B',
    fontSize: 16,
    marginHorizontal: 8,
  },
  scoreButton: {
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  targetScore: {
    color: '#6366F1',
    fontSize: 18,
    fontWeight: 'bold',
  },
  targetScoreContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  targetScoreValue: {
    color: '#1E293B',
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 24,
    minWidth: 60,
    textAlign: 'center',
  },
  title: {
    color: '#1E293B',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default EfficiencyGoals;
