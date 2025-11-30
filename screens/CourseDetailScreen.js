import React, { useEffect, useState } from 'react';
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

const CourseDetailScreen = ({ navigation, route }) => {
  
  // Get course data from navigation params or use default
  const courseData = route.params?.courseData || []
  const [materialsCount, setMaterialsCount] = useState(0);


  const handleBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    let count = 0;
    courseData.subjects.forEach((subject) => {
      count += subject.materials?.length || 0;
    });
    setMaterialsCount(count);
  }, [courseData.subjects]);

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Course Header with Image */}
        <View style={styles.courseHeader}>
          <View style={styles.courseImageContainer}>
            <Image 
              source={{ uri: courseData.imageUrl || 'https://example.com/default-course.jpg' }}
              style={styles.courseImage}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay} />
            <View style={styles.courseTitleContainer}>
              <Text style={styles.courseTitle}>{courseData.name}</Text>
              <View style={styles.courseMeta}>
                
                <View style={[styles.badge, styles.privateBadge]}>
                  <View style={styles.metaItem}>
                    <Icon name="time-outline" size={20} color="#ffffffff" />
                    <Text style={styles.metaText}>{courseData.duration} Hours</Text>
                  </View>
                </View>
                <View style={[styles.badge, styles.categoryBadge]}>
                  <Text style={styles.badgeText}>{courseData.course_type}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Course Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Icon name="book-outline" size={24} color="#b3b72b" />
            <Text style={styles.statNumber}>{courseData.subjects.length}</Text>
            <Text style={styles.statLabel}>Subjects</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="play-circle-outline" size={24} color="#b3b72b" />
            <Text style={styles.statNumber}>{materialsCount}</Text>
            <Text style={styles.statLabel}>Materials</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="time-outline" size={24} color="#b3b72b" />
            <Text style={styles.statNumber}>{courseData.duration} Hours</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
        </View>

        {/* Subjects Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subjects</Text>
          <View style={styles.subjectsGrid}>
            {courseData.subjects.map((subject, index) => (
              <TouchableOpacity 
                key={index}
                style={styles.subjectCard}
                onPress={() => navigation.navigate('SubjectDetail', { subjectData: subject, courseDetail: courseData })}
              >
                <View style={[styles.subjectIcon, { backgroundColor: '#fff' }]}>
                  <Icon name='book' size={30} color="#b3b72b" />
                </View>
                <Text style={styles.subjectName}>{subject.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <View style={styles.descriptionCard}>
            <RenderHTML 
              source={{html: courseData.description}}
              contentWidth={300}
              baseStyle={styles.description}
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
    paddingTop: 20
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
  // Course Header
  courseHeader: {
    marginBottom: 20,
  },
  courseImageContainer: {
    height: 200,
    position: 'relative',
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  courseImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  courseTitleContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  courseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  courseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 4,
    opacity: 0.9,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 4,
  },
  privateBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  categoryBadge: {
    backgroundColor: '#b3b72b',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'capitalize'
  },
  // Progress Section
  progressSection: {
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#b3b72b',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E9ECEF',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '0%',
    backgroundColor: '#b3b72b',
    borderRadius: 4,
  },
  // Sections
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  // Subjects Grid
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  subjectCard: {
    width: '48%',
    backgroundColor: '#b3b72b',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center'
  },
  subjectIcon: {
    width: 50,
    height: 50,
    borderRadius: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffffff',
    marginBottom: 8,
    textAlign: 'center'
  },
  checkboxContainer: {
    alignItems: 'flex-end',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#b3b72b',
    borderColor: '#b3b72b',
  },
  // Description
  descriptionCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  // Stats Section
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  // Action Buttons
  actionSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#b3b72b',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#b3b72b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#b3b72b',
  },
  secondaryButtonText: {
    color: '#b3b72b',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 20,
  },
});

export default CourseDetailScreen;