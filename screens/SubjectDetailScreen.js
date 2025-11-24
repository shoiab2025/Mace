import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import RenderHTML from 'react-native-render-html';
import Icon from 'react-native-vector-icons/Ionicons';

const SubjectDetailScreen = ({ navigation, route }) => {
  const { subject } = route.params || { subject: 'English' };
  const {subjectData, courseDetail} = route?.params;
  console.log("Subject", subjectData)
  const subjectIcons = {
    'English': { icon: 'book', color: '#FF6B6B' },
    'Maths': { icon: 'calculator', color: '#4ECDC4' },
    'Science': { icon: 'flask', color: '#45B7D1' },
    'E-Book': { icon: 'document-text', color: '#FFD93D' },
    'History': { icon: 'time', color: '#6BCF7F' },
    'Geography': { icon: 'globe', color: '#FF8B6B' },
  };

  const currentSubject = subjectIcons[subjectData.name] || { icon: 'school', color: '#b3b72b' };

  const materials = [
    { name: 'Grammar Basics PDF', type: 'pdf', duration: '30 min', completed: true },
    { name: 'Vocabulary List', type: 'doc', duration: '20 min', completed: true },
    { name: 'Reading Comprehension', type: 'pdf', duration: '45 min', completed: false },
    { name: 'Writing Exercises', type: 'doc', duration: '35 min', completed: false },
  ];

  const handleBack = () => {
    navigation.goBack();
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >

        {/* Subject Header */}
        <View style={styles.subjectHeader}>
          <View style={[styles.subjectIcon, { backgroundColor: currentSubject.color }]}>
            <Icon name={currentSubject.icon} size={32} color="#FFFFFF" />
          </View>
          <View style={styles.subjectInfo}>
            <Text style={styles.courseTitle}>{courseDetail?.name}</Text>
            <Text style={styles.subjectTitle}>{subjectData.name}</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Icon name="document-text" size={20} color="#b3b72b" />
            <Text style={styles.statNumber}>{subjectData.materials.length}</Text>
            <Text style={styles.statLabel}>Materials</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Icon name="time" size={20} color="#b3b72b" />
            <Text style={styles.statNumber}>{courseDetail.duration} Hours</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
        </View>

       <TouchableOpacity 
          style={styles.lessonPlanCard}
          onPress={() => navigation.navigate('Materials', { materials: subjectData.materials })}
        >
          <View style={styles.lessonPlanContent}>
            <Icon name="list" size={24} color="#FFFFFF" />
            <View style={styles.lessonPlanText}>
              <Text style={styles.lessonPlanTitle}>Learning Materials</Text>
              <Text style={styles.lessonPlanSubtitle}>Structured learning path</Text>
            </View>
            <Icon name="chevron-forward" size={20} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
          <View style={[styles.lessonPlanContent, {paddingInline: 10, flexDirection: 'column', alignItems: 'flex-start'}]}>
            <Icon name="list" size={24} color="#FFFFFF" />
            <View style={styles.lessonPlanText}>
              <Text style={[styles.lessonPlanTitle, {color: '#000'}]}>Lesson plan</Text>
              <RenderHTML
                source={{html: subjectData?.description}}
                baseStyle={[styles.lessonPlanSubtitle, {color: '#000'}]}
              />
            </View>
          </View>
      

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Header Styles (Same as HomeScreen)
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 100,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  userDetails: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#b3b72b',
    marginBottom: 4,
  },
  welcome: {
    fontSize: 14,
    color: 'rgba(48, 47, 47, 0.9)',
  },
  loginButton: {
    backgroundColor: 'rgba(16, 16, 16, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(35, 35, 35, 0.5)',
  },
  loginButtonText: {
    color: '#b3b72b',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingTop: 10
  },
  // Back Button
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  backText: {
    fontSize: 16,
    color: '#b3b72b',
    marginLeft: 8,
    fontWeight: '600',
  },
  // Subject Header
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 20,
  },
  subjectIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  subjectInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  subjectTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#b3b72b',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  // Sections
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#b3b72b',
    fontWeight: '600',
    marginRight: 4,
  },
  // Materials Grid
  materialsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  materialCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  materialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  materialIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  materialInfo: {
    flex: 1,
  },
  materialName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  materialDuration: {
    fontSize: 12,
    color: '#666',
  },
  completedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#b3b72b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Assessment Grid
  assessmentGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  assessmentCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  preTestCard: {
    borderColor: '#FF6B6B',
  },
  postTestCard: {
    borderColor: '#4ECDC4',
  },
  assessmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 4,
  },
  assessmentSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  assessmentButton: {
    backgroundColor: '#b3b72b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  assessmentButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Leaderboard Card
  leaderboardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  leaderboardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaderboardText: {
    flex: 1,
    marginLeft: 12,
  },
  leaderboardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  leaderboardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  // Lesson Plan Card
  lessonPlanCard: {
    backgroundColor: '#b3b72b',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#b3b72b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  lessonPlanContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonPlanText: {
    flex: 1,
    marginLeft: 12,
  },
  lessonPlanTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  lessonPlanSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  // Grammar Section
  grammarSection: {
    backgroundColor: '#F8F9FA',
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 20,
    borderRadius: 12,
  },
  grammarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  grammarText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 20,
  },
});

export default SubjectDetailScreen;