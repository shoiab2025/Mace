import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Animated,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const TestResultScreen = ({ navigation, route }) => {
  const { testData, userAnswers, submissionData, totalQuestions } = route.params || {};
  
  const correctAnswers = Object.keys(userAnswers || {}).filter(index => {
    const question = testData?.test_questions?.[index];
    const userAnswer = userAnswers[index];
    if (!question || userAnswer === undefined) return false;
    
    const userAnswerLetter = String.fromCharCode(65 + userAnswer);
    return question.correct_options.includes(userAnswerLetter);
  }).length;

  const scoreData = {
    correct: correctAnswers,
    total: totalQuestions || 1,
    percentage: totalQuestions ? `${((correctAnswers / totalQuestions) * 100).toFixed(1)}%` : '0.0%',
    submissionData: submissionData || 0,
    skipped: totalQuestions - Object.keys(userAnswers || {}).length,
    incorrect: Object.keys(userAnswers || {}).length - correctAnswers
  };

  const progressAnim = new Animated.Value(0);

  React.useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (correctAnswers / totalQuestions) || 0,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, []);

  const handleRetakeTest = () => {
    navigation.navigate('TestSession', { testData });
  };

  const handleSolutions = () => {
    navigation.navigate('Solutions', { 
      testData, 
      userAnswers, 
      submissionData,
      scoreData 
    });
  };

  const handleLeaderboard = () => {
    navigation.navigate('Leaderboard', { testId: testData?._id });
  };

  const handleHome = () => {
    navigation.navigate('Dashboard');
  };

  const getPerformanceMessage = () => {
    const percentage = (correctAnswers / totalQuestions) * 100;
    if (percentage >= 90) return "Excellent! 🎉";
    if (percentage >= 75) return "Great Job! 👍";
    if (percentage >= 60) return "Good Work! 👏";
    if (percentage >= 40) return "Keep Practicing! 💪";
    return "Don't Give Up! 🌟";
  };

  const getPerformanceColor = () => {
    const percentage = (correctAnswers / totalQuestions) * 100;
    if (percentage >= 90) return "#4ECDC4";
    if (percentage >= 75) return "#45B7D1";
    if (percentage >= 60) return "#FFD93D";
    if (percentage >= 40) return "#FFA726";
    return "#FF6B6B";
  };

  const widthAnim = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#f8f9fa" barStyle="dark-content" />
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Score Card */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreHeader}>
            <Text style={styles.courseName}>
              {testData?.test_subject?.name || 'Test Course'}
            </Text>
            <Text style={styles.testName}>
              {testData?.test_name || 'Test'}
            </Text>
          </View>

          <View style={styles.scoreCircle}>
            <View style={[styles.circle, { borderColor: getPerformanceColor() }]}>
              <Text style={styles.scoreText}>{scoreData.correct}</Text>
              <Text style={styles.scoreDivider}>/</Text>
              <Text style={styles.totalText}>{scoreData.total}</Text>
            </View>
            <Text style={styles.percentage}>{scoreData.percentage}</Text>
            <Text style={[styles.performance, { color: getPerformanceColor() }]}>
              {getPerformanceMessage()}
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <Animated.View 
                style={[
                  styles.progressFill,
                  { 
                    width: widthAnim,
                    backgroundColor: getPerformanceColor()
                  }
                ]} 
              />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>0%</Text>
              <Text style={styles.progressLabel}>50%</Text>
              <Text style={styles.progressLabel}>100%</Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#4ECDC4' }]}>
              <Icon name="checkmark-circle" size={20} color="#fff" />
            </View>
            <Text style={styles.statNumber}>{scoreData.correct}</Text>
            <Text style={styles.statLabel}>Correct</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#FF6B6B' }]}>
              <Icon name="close-circle" size={20} color="#fff" />
            </View>
            <Text style={styles.statNumber}>{scoreData.incorrect}</Text>
            <Text style={styles.statLabel}>Incorrect</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#FFD93D' }]}>
              <Icon name="remove-circle" size={20} color="#fff" />
            </View>
            <Text style={styles.statNumber}>{scoreData.skipped}</Text>
            <Text style={styles.statLabel}>Skipped</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#45B7D1' }]}>
              <Icon name="time" size={20} color="#fff" />
            </View>
            <Text style={styles.statNumber}>{scoreData.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        {/* Score Breakdown */}
        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>Score Breakdown</Text>
          
          <View style={styles.scoreRow}>
            <View style={styles.scoreInfo}>
              <Text style={styles.scoreType}>Correct Answers</Text>
              <Text style={styles.scoreDetail}>+{scoreData.correct} points</Text>
            </View>
            <Text style={[styles.scorePoints, { color: '#4ECDC4' }]}>
              +{scoreData.correct * (testData?.test_questions?.[0]?.positive_mark || 1)}
            </Text>
          </View>

          <View style={styles.scoreRow}>
            <View style={styles.scoreInfo}>
              <Text style={styles.scoreType}>Incorrect Answers</Text>
              <Text style={styles.scoreDetail}>-{scoreData.incorrect} points</Text>
            </View>
            <Text style={[styles.scorePoints, { color: '#FF6B6B' }]}>
              -{scoreData.incorrect * (testData?.test_questions?.[0]?.negative_mark || 0)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.scoreRow}>
            <View style={styles.scoreInfo}>
              <Text style={styles.finalScore}>Final Score</Text>
              <Text style={styles.scoreDetail}>Total points earned</Text>
            </View>
            <Text style={styles.finalPoints}>{scoreData.score}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleSolutions}
          >
            <Icon name="document-text" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>View Solutions</Text>
          </TouchableOpacity>

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={handleRetakeTest}
            >
              <Icon name="refresh" size={20} color="#b3b72b" />
              <Text style={styles.secondaryButtonText}>Retake Test</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={handleLeaderboard}
            >
              <Icon name="trophy" size={20} color="#b3b72b" />
              <Text style={styles.secondaryButtonText}>Leaderboard</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Performance Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Performance Tips</Text>
          <View style={styles.tipItem}>
            <Icon name="checkmark-circle" size={16} color="#4ECDC4" />
            <Text style={styles.tipText}>
              Focus on areas where you got questions wrong
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Icon name="time" size={16} color="#FFD93D" />
            <Text style={styles.tipText}>
              Practice time management for better scores
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Icon name="book" size={16} color="#45B7D1" />
            <Text style={styles.tipText}>
              Review the study materials before retaking
            </Text>
          </View>
        </View>
      </ScrollView>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  scoreCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  scoreHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  courseName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  testName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scoreCircle: {
    alignItems: 'center',
    marginBottom: 20,
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 10,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  scoreDivider: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
    marginHorizontal: 4,
  },
  totalText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
  },
  percentage: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  performance: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 10,
  },
  progressBackground: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  breakdownCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreInfo: {
    flex: 1,
  },
  scoreType: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  scoreDetail: {
    fontSize: 14,
    color: '#666',
  },
  scorePoints: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  finalScore: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
  },
  finalPoints: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#b3b72b',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12,
  },
  actionSection: {
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButton: {
    backgroundColor: '#b3b72b',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: '#b3b72b',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  tipsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default TestResultScreen;