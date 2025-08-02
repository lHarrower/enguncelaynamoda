import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEfficiencyScore } from '@/hooks/useEfficiencyScore';
import { EfficiencyGoal } from '@/services/efficiencyScoreService';
import { useAuth } from '@/hooks/useAuth';

const { width } = Dimensions.get('window');

interface EfficiencyGoalsProps {
  onGoalCreated?: (goal: EfficiencyGoal) => void;
  onGoalSelected?: (goal: EfficiencyGoal) => void;
}

export const EfficiencyGoals: React.FC<EfficiencyGoalsProps> = ({
  onGoalCreated,
  onGoalSelected
}) => {
  const { user } = useAuth();
  const {
    goals,
    efficiencyScore,
    createGoal,
    refreshGoals,
    error,
    clearError,
    getScoreColor
  } = useEfficiencyScore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    type: 'utilization' as EfficiencyGoal['type'],
    target: 80,
    description: '',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    refreshGoals();
  }, []);

  const goalTypes = [
    { key: 'utilization', label: 'Utilization', icon: 'shirt-outline', description: 'Wear more of your wardrobe regularly' },
    { key: 'cost_efficiency', label: 'Cost Efficiency', icon: 'cash-outline', description: 'Optimize cost per wear' },
    { key: 'sustainability', label: 'Sustainability', icon: 'leaf-outline', description: 'Improve item care and longevity' },
    { key: 'versatility', label: 'Versatility', icon: 'shuffle-outline', description: 'Create more outfit combinations' },
    { key: 'curation', label: 'Curation', icon: 'star-outline', description: 'Build a quality, cohesive wardrobe' }
  ];

  const getCurrentScore = (type: EfficiencyGoal['type']): number => {
    if (!efficiencyScore) return 0;
    
    switch (type) {
      case 'utilization': return efficiencyScore.breakdown.utilization;
      case 'cost_efficiency': return efficiencyScore.breakdown.costEfficiency;
      case 'sustainability': return efficiencyScore.breakdown.sustainability;
      case 'versatility': return efficiencyScore.breakdown.versatility;
      case 'curation': return efficiencyScore.breakdown.curation;
      default: return 0;
    }
  };

  const handleCreateGoal = async () => {
    if (!user?.id) return;
    
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
          { value: Math.floor((getCurrentScore(newGoal.type) + newGoal.target) / 2), achieved: false },
          { value: newGoal.target, achieved: false }
        ]
      };
      
      await createGoal(goalData);
      setShowCreateModal(false);
      setNewGoal({
        type: 'utilization',
        target: 80,
        description: '',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
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
    
    if (progress >= 100) return '#4CAF50'; // Completed
    if (daysRemaining <= 7 && progress < 50) return '#F44336'; // At risk
    if (progress >= 50) return '#FF9800'; // On track
    return '#9E9E9E'; // Behind
  };

  const renderGoalCard = (goal: EfficiencyGoal) => {
    const goalType = goalTypes.find(t => t.key === goal.type);
    const progress = calculateProgress(goal);
    const daysRemaining = getDaysRemaining(goal.deadline);
    const statusColor = getGoalStatusColor(goal);
    const currentScore = getCurrentScore(goal.type);
    
    return (
      <TouchableOpacity
        key={goal.id}
        style={styles.goalCard}
        onPress={() => onGoalSelected?.(goal)}
      >
        <View style={styles.goalHeader}>
          <View style={styles.goalTypeContainer}>
            <Ionicons
              name={goalType?.icon as any}
              size={24}
              color={statusColor}
            />
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
                  backgroundColor: statusColor
                }
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
              {progress >= 100 ? 'Completed' : 
               daysRemaining <= 7 && progress < 50 ? 'At Risk' :
               progress >= 50 ? 'On Track' : 'Behind'}
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
          <TouchableOpacity onPress={() => setShowCreateModal(false)}>
            <Text style={styles.modalCancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Create Efficiency Goal</Text>
          <TouchableOpacity onPress={handleCreateGoal}>
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
                    newGoal.type === type.key && styles.goalTypeOptionSelected
                  ]}
                  onPress={() => setNewGoal(prev => ({ ...prev, type: type.key as EfficiencyGoal['type'] }))}
                >
                  <Ionicons
                    name={type.icon as any}
                    size={20}
                    color={newGoal.type === type.key ? '#6366F1' : '#64748B'}
                  />
                  <Text style={[
                    styles.goalTypeOptionText,
                    newGoal.type === type.key && styles.goalTypeOptionTextSelected
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.goalTypeDescription}>
              {goalTypes.find(t => t.key === newGoal.type)?.description}
            </Text>
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Current Score: {getCurrentScore(newGoal.type)}</Text>
            <Text style={styles.formLabel}>Target Score</Text>
            <View style={styles.targetScoreContainer}>
              <TouchableOpacity
                style={styles.scoreButton}
                onPress={() => setNewGoal(prev => ({ ...prev, target: Math.max(prev.target - 5, getCurrentScore(newGoal.type) + 1) }))}
              >
                <Ionicons name="remove" size={20} color="#6366F1" />
              </TouchableOpacity>
              <Text style={styles.targetScoreValue}>{newGoal.target}</Text>
              <TouchableOpacity
                style={styles.scoreButton}
                onPress={() => setNewGoal(prev => ({ ...prev, target: Math.min(prev.target + 5, 100) }))}
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
              onChangeText={(text) => setNewGoal(prev => ({ ...prev, description: text }))}
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
            >
              <Ionicons name="calendar-outline" size={20} color="#6366F1" />
              <Text style={styles.dateButtonText}>
                {newGoal.deadline.toLocaleDateString()}
              </Text>
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
                setNewGoal(prev => ({ ...prev, deadline: selectedDate }));
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
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B'
  },
  createButton: {
    backgroundColor: '#6366F1',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24
  },
  emptyStateButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  goalsList: {
    flex: 1,
    paddingHorizontal: 20
  },
  goalCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  goalTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  goalTypeText: {
    marginLeft: 12,
    flex: 1
  },
  goalTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B'
  },
  goalDescription: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2
  },
  goalScores: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  currentScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B'
  },
  scoreArrow: {
    fontSize: 16,
    color: '#64748B',
    marginHorizontal: 8
  },
  targetScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6366F1'
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12
  },
  progressFill: {
    height: '100%',
    borderRadius: 4
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    minWidth: 40,
    textAlign: 'right'
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  deadlineText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  modalCancelButton: {
    fontSize: 16,
    color: '#64748B'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B'
  },
  modalCreateButton: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '600'
  },
  modalContent: {
    flex: 1,
    padding: 20
  },
  formSection: {
    marginBottom: 24
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8
  },
  goalTypeSelector: {
    marginBottom: 8
  },
  goalTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8
  },
  goalTypeOptionSelected: {
    borderColor: '#6366F1',
    backgroundColor: '#F0F4FF'
  },
  goalTypeOptionText: {
    fontSize: 16,
    color: '#64748B',
    marginLeft: 12
  },
  goalTypeOptionTextSelected: {
    color: '#6366F1',
    fontWeight: '600'
  },
  goalTypeDescription: {
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic'
  },
  targetScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  scoreButton: {
    backgroundColor: '#F0F4FF',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  targetScoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginHorizontal: 24,
    minWidth: 60,
    textAlign: 'center'
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1E293B',
    textAlignVertical: 'top'
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8
  },
  dateButtonText: {
    fontSize: 16,
    color: '#1E293B',
    marginLeft: 8
  }
});

export default EfficiencyGoals;