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
  RefreshControl,
  Animated,
  Dimensions,
  StatusBar,
  Modal,
  Alert,
  Clipboard,
  Linking
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { fetchPublicCourses, fetchPrivateCourses, AddCourseJoin, fetchPrivateTeacherCourses } from '../API_STORE/course_api';
import { fetchUserById } from '../API_STORE/user_api';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../navigation/AuthContext';

const { width } = Dimensions.get('window');

const TeacherHomeScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [publicCourses, setPublicCourses] = useState([]);
  const [teacherCourses, setTeacherCourses] = useState([]);
  const [privateCourses, setPrivateCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('public'); // public, private, teacher
  const [creators, setCreators] = useState({});
  const [loadingCreators, setLoadingCreators] = useState({});
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isJoinCourseVisible, setIsJoinCourseVisible] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const navigation = useNavigation();
  const { authUser, setAuthUser } = useAuth();

  const searchSlideAnim = useRef(new Animated.Value(-width)).current;
  const joinModalAnim = useRef(new Animated.Value(0)).current;

  // Helper function to check if user has access to private course
  const checkUserHasAccess = (course) => {
    if (!authUser || course.course_type !== 'private') {
      return false;
    }
    
    // Check if user exists in joinRequests with approved status
    const userRequest = course.joinRequests?.find(
      request => request.user._id === authUser._id && request.status === 'approved'
    );
    
    return !!userRequest;
  };

  const loadCourses = async () => {
    try {
      setError('');
      setLoading(true);

      const [pbCourses, pvCourses, teacherCoursesData] = await Promise.all([
        fetchPublicCourses(),
        fetchPrivateCourses(),
        fetchPrivateTeacherCourses(authUser)
      ]);

      setPublicCourses(pbCourses || []);
      setPrivateCourses(pvCourses || []);
      setTeacherCourses(teacherCoursesData || []);

      console.log("the teacher course for teacher home", teacherCoursesData)

      // Load creators for all courses
      const allCourses = [
        ...(pbCourses || []),
        ...(pvCourses || []),
        ...(teacherCoursesData || [])
      ];
      await loadCreators(allCourses);
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
      const loadingState = {};
      uniqueCreatorIds.forEach(id => {
        loadingState[id] = true;
      });
      setLoadingCreators(loadingState);

      const creatorPromises = uniqueCreatorIds.map(async (userId) => {
        try {
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

  // Search modal animation
  useEffect(() => {
    Animated.timing(searchSlideAnim, {
      toValue: isSearchVisible ? 0 : -width,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isSearchVisible]);

  // Join course modal animation
  useEffect(() => {
    Animated.timing(joinModalAnim, {
      toValue: isJoinCourseVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isJoinCourseVisible]);

  // Get current courses based on active tab
  const getCurrentCourses = () => {
    switch (activeTab) {
      case 'public':
        return publicCourses;
      case 'private':
        return privateCourses;
      case 'teacher':
        return teacherCourses;
      default:
        return [];
    }
  };

  const getFilteredCourses = () => {
    const currentCourses = getCurrentCourses();
    if (!searchQuery.trim()) {
      return currentCourses;
    }

    const query = searchQuery.toLowerCase();
    return currentCourses.filter(course =>
      course.name?.toLowerCase().includes(query) ||
      getUserDisplayInfo(course.created_by)?.name.toLowerCase().includes(query)
    );
  };

  const handleAuthAction = () => {
    if (authUser) {
      setAuthUser(null)
      Alert.alert("User Logout Successfully")
    } else {
      navigation.navigate('Login');
    }
  };

  const handleSearchOpen = () => {
    setIsSearchVisible(true);
  };

  const handleSearchClose = () => {
    setIsSearchVisible(false);
    setSearchQuery('');
  };

  const handleJoinCourseOpen = async () => {
    if (!authUser) {
      Alert.alert(
        'Login Required',
        'Please login to join a course',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }
    setIsJoinCourseVisible(true);
  };

  const handleJoinCourseClose = () => {
    setIsJoinCourseVisible(false);
    setJoinCode('');
    setIsJoining(false);
  };

  const handleJoinCourse = async () => {
    if (!joinCode.trim()) {
      Alert.alert('Error', 'Please enter a course code');
      return;
    }

    if (!authUser) {
      Alert.alert('Error', 'Please login to join a course');
      return;
    }

    setIsJoining(true);

    // Simulate API call to join course
    setTimeout(async () => {
      setIsJoining(false);
      const response = await AddCourseJoin({joinCode: joinCode, userId: authUser._id});
      console.log(response)
      if (response) {
        Alert.alert(
          'Success!',
          `${response.message}`,
          [
            {
              text: 'OK',
              onPress: () => {
                handleJoinCourseClose();
                // Refresh courses to show the newly joined course
                loadCourses();
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Error',
          'Invalid course code. Please check the code and try again.',
          [{ text: 'OK' }]
        );
      }
    }, 2000);
  };

  const navigateTo = (screenname, course) => {
    navigation.navigate(screenname, { courseData: course });
  }

  // Copy join code to clipboard
  const copyJoinCode = (courseJoinCode) => {
    Clipboard.setString(courseJoinCode);
    Alert.alert('Copied!', 'Join code copied to clipboard');
  };

  const filteredCourses = getFilteredCourses();

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

  const getTabTitle = () => {
    switch (activeTab) {
      case 'public': return 'Public Courses';
      case 'private': return 'Private Courses';
      case 'teacher': return 'My Courses';
      default: return 'Courses';
    }
  };

  const getTabCount = () => {
    switch (activeTab) {
      case 'public': return publicCourses.length;
      case 'private': return privateCourses.length;
      case 'teacher': return teacherCourses.length;
      default: return 0;
    }
  };

  const displayCourses = formatCourseData(filteredCourses);

  // Render course card with different styles based on tab
  const renderCourseCard = (course) => {
    const hasAccess = checkUserHasAccess(course);
    const isTeacherCourse = activeTab === 'teacher';
    
    return (
      <TouchableOpacity
        key={course.id}
        style={styles.courseCard}
        onPress={() => navigateTo('CourseDetail', course)}
      >
        <View style={styles.thumbnailContainer}>
          <Image
            source={{ uri: course.imageUrl }}
            style={styles.thumbnailImage}
            resizeMode="cover"
            onError={() => {
              course.imageUrl = require('../assets/images/default.png');
            }}
          />
          
          {/* Join Code Display for Teacher's Private Courses */}
          {isTeacherCourse && course.course_type === 'private' && course.join_code && (
            <View style={styles.joinCodeContainer}>
              <View style={styles.joinCodeBadge}>
                <Text style={styles.joinCodeLabel}>Join Code:</Text>
                <View style={styles.joinCodeValueContainer}>
                  <Text style={styles.joinCodeValue}>{course.join_code}</Text>
                  <TouchableOpacity 
                    style={styles.copyButton}
                    onPress={() => copyJoinCode(course.join_code)}
                  >
                    <Icon name="copy-outline" size={16} color="#b3b72b" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          
          {/* Access Status Badge for Private Courses */}
          {course.course_type === 'private' && !isTeacherCourse && (
            <View style={[
              styles.accessBadge,
              hasAccess ? styles.accessGrantedBadge : styles.accessRequiredBadge
            ]}>
              <Text style={styles.accessBadgeText}>
                {hasAccess ? '✓ Joined' : 'Private'}
              </Text>
            </View>
          )}
          
          {/* Teacher Badge for Teacher Courses */}
          {isTeacherCourse && (
            <View style={styles.teacherBadge}>
              <Icon name="person" size={12} color="#FFFFFF" />
              <Text style={styles.teacherBadgeText}>My Course</Text>
            </View>
          )}
          
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{course.duration} Hour</Text>
          </View>
        </View>

        <View style={styles.courseInfo}>
          <View style={styles.courseHeader}>
            <View style={[styles.categoryIcon, { backgroundColor: course.color }]}>
              <Icon name={course.icon} size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.courseCategory}>
              {course.course_type} • {activeTab === 'teacher' ? 'Teacher' : 'Student'}
            </Text>
          </View>

          <Text style={styles.courseTitle} numberOfLines={2}>
            {course.title}
          </Text>

          <View style={styles.creatorContainer}>
            <Image
              source={
                course.creatorInfo.profile_picture
                  ? { uri: course.creatorInfo.profile_picture }
                  : require('../assets/images/creator.png')
              }
              style={styles.creatorImage}
              resizeMode="cover"
            />
            <Text style={[
              styles.creatorText,
              course.creatorInfo.isLoading && styles.creatorLoadingText
            ]} numberOfLines={2}>
              {course.creatorInfo.name}
              {isTeacherCourse && " (You)"}
            </Text>
            {course.creatorInfo.isLoading && (
              <ActivityIndicator size="small" color="#666" style={styles.creatorLoader} />
            )}
          </View>
          
          {/* Join Prompt for Private Courses without access */}
          {course.course_type === 'private' && !hasAccess && !isTeacherCourse && (
            <View style={styles.joinPrompt}>
              <Icon name="person-add" size={14} color="#b3b72b" />
              <Text style={styles.joinPromptText}>
                Use join code to access
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const modalScale = joinModalAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const modalOpacity = joinModalAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        backgroundColor="#FFFFFF" 
        barStyle="dark-content" 
      />
      
      {/* HEADER */}
      <View style={styles.header}>
        {/* Left: Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Right: Actions */}
        <View style={styles.actionsContainer}>
          {/* Create Course Button (only for teacher tab) */}

          {/* Join Course Button */}
          <TouchableOpacity 
            style={styles.joinButton}
            onPress={handleJoinCourseOpen}
          >
            <Text style={styles.joinButtonText}>Join Course</Text>
          </TouchableOpacity>

          {/* Search Icon */}
          <TouchableOpacity onPress={handleSearchOpen} style={styles.searchIconButton}>
            <Icon name="search" size={22} color="#666" />
          </TouchableOpacity>

          {/* Login/Logout Icon */}
          <TouchableOpacity onPress={handleAuthAction} style={styles.authButton}>
            <Icon 
              name={authUser ? "log-out-outline" : "log-in-outline"} 
              size={22} 
              color="#b3b72b" 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Modal */}
      <Modal
        visible={isSearchVisible}
        transparent={true}
        animationType="none"
        onRequestClose={handleSearchClose}
        statusBarTranslucent={true}
      >
        <SafeAreaView style={styles.searchModal}>
          <Animated.View 
            style={[
              styles.searchModalContent,
              { transform: [{ translateX: searchSlideAnim }] }
            ]}
          >
            <View style={styles.searchHeader}>
              <TouchableOpacity onPress={handleSearchClose} style={styles.backButton}>
                <Icon name="arrow-back" size={24} color="#333" />
              </TouchableOpacity>
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search courses, subjects, creators..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#999"
                autoFocus={true}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Icon name="close-circle" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>
            
            {/* Search Results */}
            <ScrollView style={styles.searchResults}>
              {searchQuery.length > 0 && (
                <View style={styles.searchResultsContent}>
                  <Text style={styles.searchResultsTitle}>
                    Search Results for "{searchQuery}"
                  </Text>
                  {filteredCourses.length > 0 ? (
                    filteredCourses.map(course => (
                      <TouchableOpacity 
                        key={course.id} 
                        style={styles.searchResultItem}
                        onPress={() => {
                          navigateTo('CourseDetail', course);
                          handleSearchClose();
                        }}
                      >
                        <View style={styles.searchResultItemHeader}>
                          <Text style={styles.searchResultText}>{course.title || course.name}</Text>
                          <View style={[
                            styles.courseTypeBadge,
                            course.course_type === 'private' ? styles.privateBadge : styles.publicBadge
                          ]}>
                            <Text style={styles.courseTypeText}>
                              {course.course_type === 'private' ? 'Private' : 'Public'}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.searchResultSubtext}>
                          by {getUserDisplayInfo(course.created_by).name}
                        </Text>
                        {course.course_type === 'private' && course.join_code && (
                          <Text style={styles.searchResultCode}>
                            Join Code: {course.join_code}
                          </Text>
                        )}
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.noResultsText}>No courses found</Text>
                  )}
                </View>
              )}
            </ScrollView>
          </Animated.View>
        </SafeAreaView>
      </Modal>

      {/* Join Course Modal */}
      <Modal
        visible={isJoinCourseVisible}
        transparent={true}
        animationType="none"
        onRequestClose={handleJoinCourseClose}
        statusBarTranslucent={true}
      >
        <View style={styles.joinModalOverlay}>
          <Animated.View 
            style={[
              styles.joinModalContent,
              {
                opacity: modalOpacity,
                transform: [{ scale: modalScale }]
              }
            ]}
          >
            <View style={styles.joinModalHeader}>
              <Text style={styles.joinModalTitle}>Join a Course</Text>
              <TouchableOpacity 
                onPress={handleJoinCourseClose}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.joinModalBody}>
              <View style={styles.instructionContainer}>
                <Icon name="school-outline" size={48} color="#b3b72b" style={styles.instructionIcon} />
                <Text style={styles.instructionTitle}>Enter Course Code</Text>
                <Text style={styles.instructionText}>
                  You can find the course code shared by your teacher or instructor. 
                  Enter the code below to join the course.
                </Text>
              </View>

              <View style={styles.codeInputContainer}>
                <Text style={styles.codeInputLabel}>Course Code</Text>
                <TextInput
                  style={styles.codeInput}
                  placeholder="Enter course code (e.g., MATH101)"
                  value={joinCode}
                  onChangeText={setJoinCode}
                  placeholderTextColor="#999"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={50}
                />
                <Text style={styles.codeHint}>
                  Usually 6-8 characters, case-sensitive
                </Text>
              </View>

            </View>

            <View style={styles.joinModalFooter}>
              <TouchableOpacity 
                style={[styles.joinActionButton, styles.cancelButton]}
                onPress={handleJoinCourseClose}
                disabled={isJoining}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.joinActionButton, 
                  styles.joinActionButtonPrimary,
                  (!joinCode.trim() || isJoining) && styles.joinButtonDisabled
                ]}
                onPress={handleJoinCourse}
                disabled={!joinCode.trim() || isJoining}
              >
                {isJoining ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Icon name="person-add" size={20} color="#FFFFFF" />
                    <Text style={styles.joinActionButtonText}>Join Course</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Course Type Tabs - Now with 3 tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'public' && styles.activeTab]}
            onPress={() => setActiveTab('public')}
          >
            <Text style={[styles.tabText, activeTab === 'public' && styles.activeTabText]}>
              Public ({publicCourses.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'private' && styles.activeTab]}
            onPress={() => setActiveTab('private')}
          >
            <Text style={[styles.tabText, activeTab === 'private' && styles.activeTabText]}>
              Private ({privateCourses.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'teacher' && styles.activeTab]}
            onPress={() => setActiveTab('teacher')}
          >
            <Text style={[styles.tabText, activeTab === 'teacher' && styles.activeTabText]}>
              My Courses ({teacherCourses.length})
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
          contentContainerStyle={styles.scrollContent}
        >
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
                {getTabTitle()} ({displayCourses.length})
              </Text>

              {displayCourses.length > 0 ? (
                displayCourses.map(renderCourseCard)
              ) : (
                <View style={styles.emptyState}>
                  {activeTab === 'teacher' ? (
                    <>
                      <Icon name="book-outline" size={60} color="#ccc" />
                      <Text style={styles.emptyStateTitle}>No Courses Created Yet</Text>
                      <Text style={styles.emptyStateText}>
                        Create your first course to start teaching
                      </Text>
                      <TouchableOpacity 
                        style={styles.ctaButton}
                         onPress={() => Linking.openURL('https://www.nexgen-e.com/home')}
                      >
                        <Text style={styles.ctaButtonText}>Create Your First Course</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <Icon name="school-outline" size={60} color="#ccc" />
                      <Text style={styles.emptyStateTitle}>
                        {activeTab === 'public' ? 'No Public Courses' : 'No Private Courses'}
                      </Text>
                      <Text style={styles.emptyStateText}>
                        {searchQuery 
                          ? 'No courses found matching your search.' 
                          : 'No courses available in this category.'}
                      </Text>
                      {activeTab === 'private' && (
                        <TouchableOpacity 
                          style={styles.ctaButton}
                          onPress={handleJoinCourseOpen}
                        >
                          <Text style={styles.ctaButtonText}>Join a Private Course</Text>
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                </View>
              )}
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  // HEADER STYLES
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 100
  },
  logoContainer: {
    flex: 1,
    alignSelf: 'flex-end'
  },
  logo: {
    width: 100,
    height: 50,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#b3b72b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#b3b72b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  joinButton: {
    backgroundColor: '#b3b72b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  searchIconButton: {
    padding: 6,
  },
  authButton: {
    padding: 6,
  },
  // Search Modal Styles
  searchModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  searchModalContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
    marginTop: StatusBar.currentHeight,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
  },
  searchResults: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchResultsContent: {
    padding: 16,
  },
  searchResultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  searchResultItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchResultItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  searchResultText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  courseTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  privateBadge: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  publicBadge: {
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  courseTypeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
  },
  searchResultSubtext: {
    fontSize: 14,
    color: '#666',
  },
  searchResultCode: {
    fontSize: 12,
    color: '#b3b72b',
    fontWeight: '500',
    marginTop: 2,
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  // Join Course Modal Styles
  joinModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  joinModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  joinModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  joinModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  joinModalBody: {
    padding: 20,
  },
  instructionContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  instructionIcon: {
    marginBottom: 12,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  codeInputContainer: {
    marginBottom: 24,
  },
  codeInputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  codeInput: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FAFAFA',
  },
  codeHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
    marginLeft: 4,
  },
  joinModalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 12,
  },
  joinActionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  joinActionButtonPrimary: {
    backgroundColor: '#b3b72b',
  },
  joinButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  joinActionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Tab Styles - Updated for 3 tabs
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
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
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#b3b72b',
    fontWeight: 'bold',
  },
  
  // Join Code Display Styles
  joinCodeContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
  },
  joinCodeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#b3b72b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  joinCodeLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  joinCodeValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  joinCodeValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#b3b72b',
    letterSpacing: 1,
  },
  copyButton: {
    padding: 4,
  },
  
  // Access Badge Styles
  accessBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  accessGrantedBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.9)', // Green
  },
  accessRequiredBadge: {
    backgroundColor: 'rgba(244, 67, 54, 0.9)', // Red
  },
  accessBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  
  // Teacher Badge
  teacherBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(179, 183, 43, 0.9)', // Green
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  teacherBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  
  // Duration Badge
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
  
  // Join Prompt
  joinPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#b3b72b',
  },
  joinPromptText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 6,
    fontStyle: 'italic',
  },
  
  // Teacher Actions
  teacherActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  editButtonText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '500',
  },
  statsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  statsButtonText: {
    fontSize: 12,
    color: '#388E3C',
    fontWeight: '500',
  },
  studentsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  studentsButtonText: {
    fontSize: 12,
    color: '#F57C00',
    fontWeight: '500',
  },
  
  // Course Card Styles
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
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
    width: '100%',
    height: 190,
    backgroundColor: '#F8F9FA',
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
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
  creatorImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#4d4d4dff',
    marginRight: 10,
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
  emptyState: {
    alignItems: 'center',
    padding: 40,
    gap: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  ctaButton: {
    backgroundColor: '#b3b72b',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 20,
  },
});

export default TeacherHomeScreen;