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
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { fetchPreTests, fetchPostTests } from '../API_STORE/test_api';
import { fetchUserById } from '../API_STORE/user_api';
import RenderHTML from 'react-native-render-html';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../navigation/AuthContext';

const { width } = Dimensions.get('window');

const TestListScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [preTests, setPreTests] = useState([]);
  const [postTests, setPostTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pre');
  const [creators, setCreators] = useState({});
  const [loadingCreators, setLoadingCreators] = useState({});
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const navigation = useNavigation();
  const { authUser, setAuthUser } = useAuth();

  const searchSlideAnim = useRef(new Animated.Value(-width)).current;

  const loadTests = async () => {
    try {
      setError('');
      setLoading(true);
      
      const [prTests, ptTests] = await Promise.all([
        fetchPreTests(),
        fetchPostTests()
      ]);
      
      setPreTests(prTests || []);
      setPostTests(ptTests || []);
      
      // Load creator information for all tests
      await loadCreators([...(prTests?.data || []), ...(ptTests?.data || [])]);
    } catch (err) {
      setError('Failed to load Tests');
      console.error('Error loading Tests:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCreators = async (tests) => {
    try {
      const uniqueCreatorIds = [...new Set(tests.map(test => test.created_by?._id || test.created_by).filter(Boolean))];
      
      // Mark all creators as loading
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

  const getCreatorFromTest = (test) => {
    // If test has created_by object with user info, use that directly
    if (test.created_by && typeof test.created_by === 'object' && test.created_by.username) {
      return {
        name: test.created_by.name || test.created_by.username || 'Unknown Creator',
        isLoading: false
      };
    }
    
    // Otherwise use the user ID to get creator info
    return getUserDisplayInfo(test.created_by);
  };

  const getCourseImage = (test) => {
    return test.test_subject?.imageUrl || require('../assets/images/default.png');
  };

  const getCourseName = (test) => {
    return test.test_subject?.name || 'Unknown Course';
  };

  const getLessonName = (test) => {
    return test.test_lesson?.name || 'General Test';
  };

  const getTestDuration = (test) => {
    const questionCount = test.test_questions?.length || 0;
    const estimatedMinutes = Math.ceil(questionCount * 1.5); // 1.5 minutes per question
    return `${estimatedMinutes} min`;
  };
 
  const onRefresh = async () => {
    setRefreshing(true);
    await loadTests();
    setRefreshing(false);
  };

  useEffect(() => {
    loadTests();
  }, []);

  // Search modal animation
  useEffect(() => {
    Animated.timing(searchSlideAnim, {
      toValue: isSearchVisible ? 0 : -width,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isSearchVisible]);

  // Get current tests based on active tab
  const getCurrentTests = () => {
    return activeTab === 'pre' ? preTests : postTests;
  };

  // Filter tests based on search query
  const getFilteredTests = () => {
    const currentTests = getCurrentTests();
    if (!searchQuery.trim()) {
      return currentTests;
    }

    const query = searchQuery.toLowerCase();
    return currentTests.filter(test =>
      test.test_name?.toLowerCase().includes(query) ||
      getCourseName(test)?.toLowerCase().includes(query) ||
      getLessonName(test)?.toLowerCase().includes(query) ||
      getCreatorFromTest(test).name?.toLowerCase().includes(query)
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

  const navigateToTest = (test) => {
    navigation.navigate('TestDetail', { testData: test });
  };

  const filteredTests = getFilteredTests();

  // Format test data for display
  const formatTestData = (tests) => {
    return tests.map((test, index) => ({
      id: test._id || `test-${index}`,
      title: test.test_name || 'Untitled Test',
      testType: test.test_type || 'pre-test',
      questionCount: test.test_questions?.length || 0,
      color: getColorByIndex(index),
      icon: getIconByTestType(test.test_type),
      imageUrl: getCourseImage(test),
      duration: getTestDuration(test),
      courseName: getCourseName(test),
      lessonName: getLessonName(test),
      creatorInfo: getCreatorFromTest(test),
      ...test
    }));
  };

  // Helper functions for test styling
  const getColorByIndex = (index) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFD93D', '#6BCF7F'];
    return colors[index % colors.length];
  };

  const getIconByTestType = (testType) => {
    const icons = {
      'pre-test': 'clipboard',
      'post-test': 'document-text',
    };
    return icons[testType?.toLowerCase()] || 'help-circle';
  };

  const displayTests = formatTestData(filteredTests);

  const renderTestCard = (test) => (
    <TouchableOpacity
      key={test.id}
      style={styles.testCard}
    >
      {/* Course Thumbnail */}
      <View style={styles.thumbnailContainer}>
        <Image 
          source={typeof test.imageUrl === 'string' ? { uri: test.imageUrl } : test.imageUrl}
          style={styles.thumbnailImage}
          resizeMode="cover"
          onError={(error) => {
            console.log('Image load error:', error);
            test.imageUrl = require('../assets/images/default.png');
          }}
        />
        <View style={[styles.testTypeBadge, 
          { backgroundColor: test.testType === 'pre-test' ? '#4ECDC4' : '#FF6B6B' }
        ]}>
          <Text style={styles.testTypeText}>
            {test.testType === 'pre-test' ? 'Pre Test' : 'Post Test'}
          </Text>
        </View>
        <View style={[styles.testSubjectBadge, 
          { backgroundColor: '#dcdcdcff' }
        ]}>
          <View style={styles.lessonContainer}>
            <View style={[styles.typeIcon, { backgroundColor: test.color }]}>
              <Icon name={test.icon} size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.testCategory}>{test.lessonName}</Text>
          </View>
        </View>
      </View>

      {/* Test Info */}
      <View style={styles.testInfo}>
        {/* First Row: Test Name and Question Count */}
        <View style={styles.firstRow}>
          <Text style={styles.testTitle} numberOfLines={2}>
            {test.title}
          </Text>
          <View style={styles.questionsContainer}>
            <Icon name="list" size={14} color="#666" />
            <Text style={styles.questionsText}>
              {test?.test_questions?.length} Qs
            </Text>
          </View>
        </View>

        {/* Second Row: Course Name and Creator */}
        <View style={styles.secondRow}>
          <Text style={styles.courseName} numberOfLines={1}>
            {test.courseName}
          </Text>
          <View style={styles.creatorContainer}>
            <Image 
              source={require('../assets/images/creator.png')}
              style={styles.creatorImage}
              resizeMode="cover"
              onError={(error) => {
                console.log('Creator image load error:', error);
              }}
            />
            <Text style={[
              styles.creatorText, 
              test.creatorInfo.isLoading && styles.creatorLoadingText
            ]} numberOfLines={1}>
              {test.creatorInfo.name}
            </Text>
            {test.creatorInfo.isLoading && (
              <ActivityIndicator size="small" color="#666" style={styles.creatorLoader} />
            )}
          </View>
        </View>

        {/* Third Row: Lesson Name and Action Buttons */}
        <View style={styles.thirdRow}>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.leaderboardButton}
              onPress={() => navigation.navigate('Leaderboard', { testId: test.id })}
            >
              <Icon name="trophy" size={16} color="#666" />
              <Text style={styles.leaderboardButtonText}>Leaderboard</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.takeTestButton}
              onPress={() => navigation.navigate('TestSession', { testData: test })}
            >
              <Text style={styles.takeTestButtonText}>Take Test</Text>
              <Icon name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        backgroundColor="#FFFFFF" 
        barStyle="dark-content" 
      />
      
      {/* HEADER - Same as HomeScreen */}
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

      {/* Search Modal - Same as HomeScreen */}
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
                placeholder="Search tests, courses, creators..."
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
                  {filteredTests.length > 0 ? (
                    filteredTests.map(test => (
                      <TouchableOpacity 
                        key={test.id} 
                        style={styles.searchResultItem}
                        onPress={() => {
                          navigateToTest(test);
                          handleSearchClose();
                        }}
                      >
                        <Text style={styles.searchResultText}>{test.title || test.test_name}</Text>
                        <Text style={styles.searchResultSubtext}>
                          by {getCreatorFromTest(test).name}
                        </Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.noResultsText}>No tests found</Text>
                  )}
                </View>
              )}
            </ScrollView>
          </Animated.View>
        </SafeAreaView>
      </Modal>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Test Type Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'pre' && styles.activeTab]}
            onPress={() => setActiveTab('pre')}
          >
            <Text style={[styles.tabText, activeTab === 'pre' && styles.activeTabText]}>
              Pre Tests ({preTests.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'post' && styles.activeTab]}
            onPress={() => setActiveTab('post')}
          >
            <Text style={[styles.tabText, activeTab === 'post' && styles.activeTabText]}>
              Post Tests ({postTests.length})
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
              <Text style={styles.loadingText}>Loading Tests...</Text>
            </View>
          )}

          {/* Error State */}
          {error && !loading && (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={48} color="#FF6B6B" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={loadTests}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Tests List */}
          {!loading && !error && (
            <View style={styles.testsSection}>
              <Text style={styles.sectionTitle}>
                {activeTab === 'pre' ? 'Pre Tests' : 'Post Tests'} 
                ({displayTests.length})
              </Text>

              {displayTests.length > 0 ? (
                displayTests.map(renderTestCard)
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    {searchQuery ? 'No tests found matching your search.' : 'No tests available.'}
                  </Text>
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
  // HEADER STYLES - Same as HomeScreen
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
  searchIconButton: {
    padding: 6,
  },
  authButton: {
    padding: 6,
  },
  // Search Modal Styles - Same as HomeScreen
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
  searchResultText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  searchResultSubtext: {
    fontSize: 14,
    color: '#666',
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  // Tab Styles
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
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
  // Tests Section
  testsSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  testCard: {
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
  // Adjusted Thumbnail Container
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    height: 160, // Reduced height for better proportion
    backgroundColor: '#F8F9FA',
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  testTypeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  testSubjectBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  testTypeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  testInfo: {
    padding: 16,
  },
  firstRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  testTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 12,
    lineHeight: 22,
    textTransform: 'capitalize'
  },
  questionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 60,
  },
  questionsText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginLeft: 4,
  },
  secondRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  courseName: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    flex: 1,
    marginRight: 12,
  },
  creatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '40%',
  },
  creatorImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4d4d4dff',
    marginRight: 6,
  },
  creatorText: {
    fontSize: 12,
    color: '#131313ff',
    fontStyle: 'italic',
  },
  creatorLoadingText: {
    color: '#999',
  },
  creatorLoader: {
    marginLeft: 4,
  },
  thirdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lessonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  testCategory: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  leaderboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  leaderboardButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginLeft: 4,
  },
  takeTestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#b3b72b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  takeTestButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
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

export default TestListScreen;