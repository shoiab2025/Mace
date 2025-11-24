import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { fetchPublicCourses, fetchPrivateCourses } from '../API_STORE/course_api';
import { fetchUserById } from '../API_STORE/user_api';
import RenderHTML from 'react-native-render-html';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [publicCourses, setPublicCourses] = useState([]);
  const [privateCourses, setPrivateCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('public');
  const [creators, setCreators] = useState({});
  const [loadingCreators, setLoadingCreators] = useState({});
  const navigation = useNavigation();

  const loadCourses = async () => {
    try {
      setError('');
      setLoading(true);
      
      const [pbCourses, pvCourses] = await Promise.all([
        fetchPublicCourses(),
        fetchPrivateCourses()
      ]);
      
      setPublicCourses(pbCourses || []);
      setPrivateCourses(pvCourses || []);
      
      // Load creator information for all courses
      await loadCreators([...(pbCourses || []), ...(pvCourses || [])]);
    } catch (err) {
      setError('Failed to load courses');
      console.error('Error loading courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCreators = async (courses) => {
    try {
      const uniqueCreatorIds = [...new Set(courses.map(course => course.created_by).filter(Boolean))];
      
      // Mark all creators as loading
      const loadingState = {};
      uniqueCreatorIds.forEach(id => {
        loadingState[id] = true;
      });
      setLoadingCreators(loadingState);

      const creatorPromises = uniqueCreatorIds.map(async (userId) => {
        try {
          // Correctly call fetchUserById with an object
          const user = await fetchUserById({ user_id: userId });
          return { userId, user };
        } catch (error) {
          console.error(`Error fetching user ${userId}:`, error);
          return { userId, user: null };
        }
      });

      const creatorResults = await Promise.all(creatorPromises);
      const creatorsMap = {};
      const newLoadingState = { ...loadingCreators };
      
      creatorResults.forEach(({ userId, user }) => {
        creatorsMap[userId] = user || { 
          name: 'Unknown Creator',
          username: 'unknown',
          email: 'unknown@example.com'
        };
        newLoadingState[userId] = false;
      });

      setCreators(creatorsMap);
      setLoadingCreators(newLoadingState);
    } catch (error) {
      console.error('Error loading creators:', error);
    }
  };

  const getUserName = (userId) => {
    if (!userId) return 'Unknown Creator';
    
    // Check if we're still loading this creator
    if (loadingCreators[userId]) {
      return 'Loading...';
    }
    
    const creator = creators[userId];
    if (!creator) return 'Unknown Creator';
    
    // Try different possible name fields
    return creator.name || creator.username || creator.full_name || 
           creator.first_name || creator.email?.split('@')[0] || 'Unknown Creator';
  };

  const getUserDisplayInfo = (userId) => {
    if (!userId) return { name: 'Unknown Creator', isLoading: false };
    
    const isLoading = loadingCreators[userId];
    const creator = creators[userId];
    
    if (isLoading) {
      return { name: 'Loading...', isLoading: true };
    }
    
    if (!creator) {
      return { name: 'Unknown Creator', isLoading: false };
    }
    
    const name = creator.name || creator.username || creator.full_name || 
                 creator.first_name || creator.email?.split('@')[0] || 'Unknown Creator';
    
    return { name, isLoading: false };
  };
 
  const onRefresh = async () => {
    setRefreshing(true);
    await loadCourses();
    setRefreshing(false);
  };

  useEffect(() => {
    loadCourses();
  }, []);

  // Get current courses based on active tab
  const getCurrentCourses = () => {
    return activeTab === 'public' ? publicCourses : privateCourses;
  };

  // Filter courses based on search query
  const getFilteredCourses = () => {
    const currentCourses = getCurrentCourses();
    if (!searchQuery.trim()) {
      return currentCourses;
    }

    const query = searchQuery.toLowerCase();
    return currentCourses.filter(course =>
      course.name?.toLowerCase().includes(query) ||
      getUserName(course.created_by)?.toLowerCase().includes(query)
    );
  };

  const handleLogin = () => {
    navigation.navigate('Login')
  };

  const navigateTo = (screenname, course) => {
    navigation.navigate(screenname, {courseData: course});
  }

  const filteredCourses = getFilteredCourses();

  // Format course data for display
  const formatCourseData = (courses) => {
    return courses.map((course, index) => ({
      id: course.id || `course-${index}`,
      title: course.title || course.name || 'Untitled Course',
      progress: course.progress || 0,
      color: getColorByIndex(index),
      icon: getIconByCategory(course.category),
      imageUrl: course.imageUrl,
      duration: course.duration || '15 min',
      category: course.category || 'General',
      creatorInfo: getUserDisplayInfo(course.created_by),
      ...course
    }));
  };

  // Helper functions for course styling
  const getColorByIndex = (index) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFD93D', '#6BCF7F'];
    return colors[index % colors.length];
  };

  const getIconByCategory = (category) => {
    const icons = {
      'reading': 'book',
      'math': 'calculator',
      'science': 'flask',
      'art': 'color-palette',
      'music': 'musical-notes',
    };
    return icons[category?.toLowerCase()] || 'school';
  };

  const displayCourses = formatCourseData(filteredCourses);

  const renderCourseCard = (course) => (
    <TouchableOpacity
      key={course.id}
      style={styles.courseCard}
      onPress={() => {
        navigateTo('CourseDetail', course)
      }}
    >
      {/* Course Thumbnail */}
      <View style={styles.thumbnailContainer}>
        <Image 
          source={{uri: course.imageUrl}}
          style={styles.thumbnailImage}
          resizeMode="cover"
          onError={(error) => {
            console.log('Image load error:', error);
            // Fallback to default image if there's an error
            course.imageUrl = require('../assets/images/default.png');
          }}
        />
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{course.duration} Hour</Text>
        </View>
      </View>

      {/* Course Info */}
      <View style={styles.courseInfo}>
        <View style={styles.courseHeader}>
          <View style={[styles.categoryIcon, { backgroundColor: course.color }]}>
            <Icon name={course.icon} size={16} color="#FFFFFF" />
          </View>
          <Text style={styles.courseCategory}>{course.course_type}</Text>
        </View>

        <Text style={styles.courseTitle} numberOfLines={2}>
          {course.title}
        </Text>
        
        {/* Display Creator Name */}
        <View style={styles.creatorContainer}>
          <Image 
            source={
              course.creatorInfo.profile_picture 
                ? { uri: course.creatorInfo.profile_picture }
                : require('../assets/images/creator.png')
            }
            style={{width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: '#4d4d4dff', marginRight: 10}}
            resizeMode="cover"
            onError={(error) => {
              console.log('Image load error:', error);
              // Note: You can't modify course.creatorInfo here as it's a prop
              // The fallback is already handled in the source prop above
            }}
          />
          <Text style={[
            styles.creatorText, 
            course.creatorInfo.isLoading && styles.creatorLoadingText
          ]} numberOfLines={2}>
            {course.creatorInfo.name}
          </Text>
          {course.creatorInfo.isLoading && (
            <ActivityIndicator size="small" color="#666" style={styles.creatorLoader} />
          )}
        </View>

      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Image
                source={require("../assets/images/logo.png")}
                style={styles.avatarImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.greeting}>Hello! 👋</Text>
              <Text style={styles.welcome}>Let's learn something fun!</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Courses..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Course Type Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'public' && styles.activeTab]}
          onPress={() => setActiveTab('public')}
        >
          <Text style={[styles.tabText, activeTab === 'public' && styles.activeTabText]}>
            Public Courses ({publicCourses.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'private' && styles.activeTab]}
          onPress={() => setActiveTab('private')}
        >
          <Text style={[styles.tabText, activeTab === 'private' && styles.activeTabText]}>
            Private Courses ({privateCourses.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF6B6B']}
            tintColor="#FF6B6B"
          />
        }
      >
        {/* Join Course Button */}
        <TouchableOpacity style={styles.joinButton}>
          <View style={styles.joinButtonContent}>
            <Icon name="add-circle" size={24} color="#4ECDC4" />
            <Text style={styles.joinButtonText}>Join New Course with Code</Text>
          </View>
        </TouchableOpacity>

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4ECDC4" />
            <Text style={styles.loadingText}>Loading courses...</Text>
          </View>
        )}

        {/* Error State */}
        {error && !loading && (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={48} color="#FF6B6B" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadCourses}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Courses List */}
        {!loading && !error && (
          <View style={styles.coursesSection}>
            <Text style={styles.sectionTitle}>
              {activeTab === 'public' ? 'Public Courses' : 'Private Courses'} 
              ({displayCourses.length})
            </Text>

            {displayCourses.length > 0 ? (
              displayCourses.map(renderCourseCard)
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  {searchQuery ? 'No courses found matching your search.' : 'No courses available.'}
                </Text>
              </View>
            )}
          </View>
        )}

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
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    margin: 16,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  // Tab Styles
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#b3b72b',
    fontWeight: 'bold',
  },
  joinButton: {
    backgroundColor: '#F0F8FF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4ECDC4',
    borderStyle: 'dashed',
  },
  joinButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4ECDC4',
    marginLeft: 12,
  },
  scrollView: {
    flex: 1,
  },
  // Loading and Error States
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Courses Section
  coursesSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  courseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  thumbnailContainer: {
    position: 'relative',
    height: 230,
    backgroundColor: '#F8F9FA',
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  courseInfo: {
    padding: 12,
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  courseCategory: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  creatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorText: {
    fontSize: 16,
    color: '#131313ff',
    fontStyle: 'italic',
    textTransform: 'capitalize'
  },
  creatorLoadingText: {
    color: '#999',
  },
  creatorLoader: {
    marginLeft: 8,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 20,
  },
});

export default HomeScreen;