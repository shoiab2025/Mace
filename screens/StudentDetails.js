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
  Switch
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { fetchPublicCourses, fetchPrivateCourses, AddCourseJoin, updateJoinRequestStatus, ApprovalJoinRequest, fetchPrivateTeacherCourses } from '../API_STORE/course_api';
import { fetchUserById } from '../API_STORE/user_api';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../navigation/AuthContext';

const { width } = Dimensions.get('window');

const StudentDetailScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [publicCourses, setPublicCourses] = useState([]);
  const [privateCourses, setPrivateCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('students');
  const [creators, setCreators] = useState({});
  const [loadingCreators, setLoadingCreators] = useState({});
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isJoinCourseVisible, setIsJoinCourseVisible] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isStudentModalVisible, setIsStudentModalVisible] = useState(false);
  const [isCourseModalVisible, setIsCourseModalVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
  const navigation = useNavigation();
  const { authUser, setAuthUser } = useAuth();

  const searchSlideAnim = useRef(new Animated.Value(-width)).current;
  const joinModalAnim = useRef(new Animated.Value(0)).current;
  const studentModalAnim = useRef(new Animated.Value(0)).current;
  const courseModalAnim = useRef(new Animated.Value(0)).current;

  // Helper function to safely get string values
  const getSafeString = (value, defaultValue = '') => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    return defaultValue;
  };

  // Load students from course join requests
  const loadStudents = async () => {
    if (!authUser) return;
    
    try {
      setLoadingStudents(true);
      const allCourses = [...publicCourses, ...privateCourses];
      const studentsMap = new Map();

      // Iterate through all courses to find join requests
      allCourses.forEach(course => {
        if (course.joinRequests && Array.isArray(course.joinRequests)) {
          course.joinRequests.forEach(request => {
            if (request.user) {
              const studentId = request.user._id;
              
              if (!studentsMap.has(studentId)) {
                studentsMap.set(studentId, {
                  ...request.user,
                  courses: [],
                  pendingRequests: 0,
                  approvedRequests: 0,
                  rejectedRequests: 0
                });
              }
              
              const student = studentsMap.get(studentId);
              const courseInfo = {
                courseId: course._id,
                courseName: getSafeString(course.name || course.title, 'Untitled Course'),
                joinCode: getSafeString(course.join_code),
                requestId: request._id,
                status: getSafeString(request.status, 'pending'),
                requestedAt: request.requestedAt,
                courseCreator: course.created_by,
                courseData: course
              };
              
              student.courses.push(courseInfo);
              
              if (request.status === 'pending') {
                student.pendingRequests++;
              } else if (request.status === 'approved') {
                student.approvedRequests++;
              } else if (request.status === 'rejected') {
                student.rejectedRequests++;
              }
            }
          });
        }
      });

      const studentsList = Array.from(studentsMap.values());
      // Filter students who have at least one join request
      const studentsWithRequests = studentsList.filter(student => 
        student.courses.length > 0
      );
      setStudents(studentsWithRequests);
    } catch (error) {
      console.error('Error loading students:', error);
      Alert.alert('Error', 'Failed to load students');
    } finally {
      setLoadingStudents(false);
    }
  };

  // Update join request status
  const handleStatusToggle = async (studentId, courseId, newStatus) => {
    try {
      const response = await ApprovalJoinRequest({
        courseId: courseId,
        userId: studentId,
        action: newStatus
      });
      console.log(response)
      if (response) {
        // Update local state
        setStudents(prevStudents => 
          prevStudents.map(student => {
            if (student._id === studentId) {
              const updatedCourses = student.courses.map(course => 
                course.courseId === courseId 
                  ? { ...course, status: newStatus }
                  : course
              );
              
              const pendingRequests = updatedCourses.filter(c => c.status === 'pending').length;
              const approvedRequests = updatedCourses.filter(c => c.status === 'approved').length;
              const rejectedRequests = updatedCourses.filter(c => c.status === 'rejected').length;
              
              return {
                ...student,
                courses: updatedCourses,
                pendingRequests,
                approvedRequests,
                rejectedRequests
              };
            }
            return student;
          })
        );
        
        Alert.alert('Success', `Request ${newStatus} successfully`);
      } else {
        Alert.alert('Error', 'Failed to update request status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update request status');
    }
  };

  // Update join request status from course card
  const handleJoinRequestStatusUpdate = async (requestId, newStatus, courseId) => {
    try {
      const response = await updateJoinRequestStatus({
        requestId: requestId,
        status: newStatus
      });

      if (response) {
        // Update local state for courses
        setPublicCourses(prevCourses => 
          prevCourses.map(course => 
            course._id === courseId 
              ? {
                  ...course,
                  joinRequests: course.joinRequests.map(req => 
                    req._id === requestId ? { ...req, status: newStatus } : req
                  )
                }
              : course
          )
        );
        
        setPrivateCourses(prevCourses => 
          prevCourses.map(course => 
            course._id === courseId 
              ? {
                  ...course,
                  joinRequests: course.joinRequests.map(req => 
                    req._id === requestId ? { ...req, status: newStatus } : req
                  )
                }
              : course
          )
        );
        
        // Reload students to reflect changes
        loadStudents();
        
        Alert.alert('Success', `Request ${newStatus} successfully`);
      } else {
        Alert.alert('Error', 'Failed to update request status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update request status');
    }
  };

  const loadCourses = async () => {
    try {
      setError('');
      setLoading(true);

      const [pbCourses, pvCourses] = await Promise.all([
        fetchPublicCourses(),
        fetchPrivateTeacherCourses(authUser)
      ]);

      setPublicCourses(pbCourses || []);
      setPrivateCourses(pvCourses || []);

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

    const name = getSafeString(
      creator.name || creator.username || creator.full_name ||
      creator.first_name || creator.email?.split('@')[0] || 'Unknown Creator'
    );

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

  useEffect(() => {
    if (publicCourses.length > 0 || privateCourses.length > 0) {
      loadStudents();
    }
  }, [publicCourses, privateCourses, authUser]);

  // Search modal animation
  useEffect(() => {
    Animated.timing(searchSlideAnim, {
      toValue: isSearchVisible ? 0 : -width,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isSearchVisible]);

  // Modal animations
  useEffect(() => {
    Animated.timing(joinModalAnim, {
      toValue: isJoinCourseVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isJoinCourseVisible]);

  useEffect(() => {
    Animated.timing(studentModalAnim, {
      toValue: isStudentModalVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isStudentModalVisible]);

  useEffect(() => {
    Animated.timing(courseModalAnim, {
      toValue: isCourseModalVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isCourseModalVisible]);

  const getCurrentCourses = () => {
    return activeTab === 'public' ? publicCourses : privateCourses;
  };

  const getFilteredCourses = () => {
    const currentCourses = getCurrentCourses();
    if (!searchQuery.trim()) {
      return currentCourses;
    }

    const query = searchQuery.toLowerCase();
    return currentCourses.filter(course =>
      getSafeString(course.name).toLowerCase().includes(query) ||
      getUserDisplayInfo(course.created_by)?.name.toLowerCase().includes(query)
    );
  };

  const getFilteredStudents = () => {
    let filtered = students;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(student => 
        student.courses.some(course => course.status === statusFilter)
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(student =>
        getSafeString(student.name).toLowerCase().includes(query) ||
        getSafeString(student.username).toLowerCase().includes(query) ||
        getSafeString(student.email).toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const handleAuthAction = () => {
    if (authUser) {
      setAuthUser(null);
      Alert.alert("User Logout Successfully");
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

    setTimeout(async () => {
      setIsJoining(false);
      const response = await AddCourseJoin({joinCode: joinCode, userId: authUser._id});
      console.log(response);
      if (response) {
        Alert.alert(
          'Success!',
          `${response.message}`,
          [
            {
              text: 'OK',
              onPress: () => {
                handleJoinCourseClose();
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
  };

  // Copy join code to clipboard
  const copyJoinCode = (courseJoinCode) => {
    Clipboard.setString(courseJoinCode);
    Alert.alert('Copied!', 'Join code copied to clipboard');
  };

  const checkUserHasAccess = (course) => {
    // Implement your access check logic here
    return true; // Placeholder
  };

  // Student modal functions
  const openStudentModal = (student) => {
    setSelectedStudent(student);
    setIsStudentModalVisible(true);
  };

  const closeStudentModal = () => {
    setIsStudentModalVisible(false);
    setSelectedStudent(null);
  };

  // Course modal functions
  const openCourseModal = (course) => {
    setSelectedCourse(course);
    setIsCourseModalVisible(true);
  };

  const closeCourseModal = () => {
    setIsCourseModalVisible(false);
    setSelectedCourse(null);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
  };

  const filteredCourses = getFilteredCourses();
  const filteredStudents = getFilteredStudents();

  const formatCourseData = (courses) => {
    return courses.map((course, index) => ({
      id: course.id || `course-${index}`,
      title: getSafeString(course.title || course.name, 'Untitled Course'),
      progress: course.progress || 0,
      color: getColorByIndex(index),
      icon: getIconByCategory(course.category),
      imageUrl: course.imageUrl,
      duration: getSafeString(course.duration, '15 min'),
      category: getSafeString(course.category, 'General'),
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
    return icons[getSafeString(category).toLowerCase()] || 'school';
  };

  const displayCourses = formatCourseData(filteredCourses);

  // Render Student Card
  const renderStudentCard = (student) => (
    <TouchableOpacity
      key={student._id}
      style={styles.studentCard}
      onPress={() => openStudentModal(student)}
    >
      <View style={styles.studentHeader}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>
            {getSafeString(student.name || student.username, 'Unknown Student')}
          </Text>
          <Text style={styles.studentEmail}>{getSafeString(student.email)}</Text>
          <Text style={styles.studentInstitution}>{getSafeString(student.institution)}</Text>
        </View>
        <View style={styles.studentStats}>
          <View style={[styles.statBadge, styles.pendingBadge]}>
            <Text style={styles.statNumber}>{student.pendingRequests || 0}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={[styles.statBadge, styles.approvedBadge]}>
            <Text style={styles.statNumber}>{student.approvedRequests || 0}</Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>
          <View style={[styles.statBadge, styles.rejectedBadge]}>
            <Text style={styles.statNumber}>{student.rejectedRequests || 0}</Text>
            <Text style={styles.statLabel}>Rejected</Text>
          </View>
        </View>
      </View>

      <View style={styles.coursesList}>
        <Text style={styles.coursesTitle}>Course Requests:</Text>
        {student.courses && student.courses.slice(0, 2).map((course, index) => (
          <View key={`${student._id}-${course.requestId}-${index}`} style={styles.courseRequestItem}>
            <View style={styles.courseRequestInfo}>
              <Text style={styles.courseName}>{getSafeString(course.courseName)}</Text>
              <Text style={styles.courseCode}>Code: {getSafeString(course.joinCode)}</Text>
              <View style={styles.requestMeta}>
                <Text style={[
                  styles.requestStatus,
                  course.status === 'approved' ? styles.statusApproved : 
                  course.status === 'pending' ? styles.statusPending : styles.statusRejected
                ]}>
                  {getSafeString(course.status).toUpperCase()}
                </Text>
                <Text style={styles.requestDate}>
                  {course.requestedAt ? new Date(course.requestedAt).toLocaleDateString() : 'Unknown date'}
                </Text>
              </View>
            </View>
            
            <View style={styles.toggleContainer}>
              {course.status === 'pending' ? (
                <View style={styles.pendingActions}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleStatusToggle(
                        student._id, 
                        course.courseId,
                        'approved'
                      );
                    }}
                  >
                    <Icon name="checkmark" size={16} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleStatusToggle(
                        student._id, 
                        course.courseId,
                        'rejected'
                      );
                    }}
                  >
                    <Icon name="close" size={16} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.statusActions}>
                  <Text style={styles.currentStatusText}>
                    {course.status === 'approved' ? 'Rejected' : 'Approved'}
                  </Text>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.pendingButton]}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleStatusToggle(
                        student._id, 
                        course.courseId, 
                        course.status === 'approved' ? 'rejected' : 'approved'
                      );
                    }}
                  >
                    <Icon name="refresh" size={14} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>{course.status === 'approved' ? 'Reject' : 'Approve'}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        ))}
        {student.courses && student.courses.length > 2 && (
          <Text style={styles.viewMoreText}>
            +{student.courses.length - 2} more courses...
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  // Render Course Card with Join Requests
  const renderCourseCard = (course) => {
    const hasAccess = checkUserHasAccess(course);
    
    return (
      <TouchableOpacity
        key={course.id}
        style={styles.courseCard}
        onPress={() => openCourseModal(course)}
      >
        <View style={styles.thumbnailContainer}>
          <Image
            source={{ uri: getSafeString(course.imageUrl) }}
            style={styles.thumbnailImage}
            resizeMode="cover"
            onError={() => {
              course.imageUrl = require('../assets/images/default.png');
            }}
          />
          
          {course.join_code && (
            <View style={styles.joinCodeContainer}>
              <View style={styles.joinCodeBadge}>
                <Text style={styles.joinCodeLabel}>Join Code:</Text>
                <View style={styles.joinCodeValueContainer}>
                  <Text style={styles.joinCodeValue}>{getSafeString(course.join_code)}</Text>
                  <TouchableOpacity 
                    style={styles.copyButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      copyJoinCode(getSafeString(course.join_code));
                    }}
                  >
                    <Icon name="copy-outline" size={16} color="#b3b72b" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          
          {course.course_type === 'private' && (
            <View style={[
              styles.accessBadge,
              hasAccess ? styles.accessGrantedBadge : styles.accessRequiredBadge
            ]}>
              <Text style={styles.accessBadgeText}>
                {hasAccess ? '✓ Joined' : 'Private'}
              </Text>
            </View>
          )}
          
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{getSafeString(course.duration)} Hour</Text>
          </View>
        </View>

        <View style={styles.courseInfo}>
          <View style={styles.courseHeader}>
            <View style={[styles.categoryIcon, { backgroundColor: course.color }]}>
              <Icon name={course.icon} size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.courseCategory}>
              {getSafeString(course.course_type)}
            </Text>
          </View>

          <Text style={styles.courseTitle} numberOfLines={2}>
            {getSafeString(course.title)}
          </Text>

          <View style={styles.creatorContainer}>
            <Image
              source={
                course.creatorInfo.profile_picture
                  ? { uri: getSafeString(course.creatorInfo.profile_picture) }
                  : require('../assets/images/creator.png')
              }
              style={styles.creatorImage}
              resizeMode="cover"
            />
            <Text style={[
              styles.creatorText,
              course.creatorInfo.isLoading && styles.creatorLoadingText
            ]} numberOfLines={2}>
              {getSafeString(course.creatorInfo.name)}
            </Text>
            {course.creatorInfo.isLoading && (
              <ActivityIndicator size="small" color="#666" style={styles.creatorLoader} />
            )}
          </View>
          
          {/* Join Requests Section */}
          {course.joinRequests && course.joinRequests.length > 0 && (
            <View style={styles.joinRequestsSection}>
              <Text style={styles.joinRequestsTitle}>
                Join Requests ({course.joinRequests.length})
              </Text>
              {course.joinRequests.slice(0, 2).map((request, index) => (
                <View key={request._id || index} style={styles.joinRequestItem}>
                  <View style={styles.requestUserInfo}>
                    <Text style={styles.requestUserName}>
                      {getSafeString(request.user?.username || request.user?.email, 'Unknown User')}
                    </Text>
                    <Text style={styles.requestUserEmail}>
                      {getSafeString(request.user?.email)}
                    </Text>
                    {request.user?.institution && (
                      <Text style={styles.requestUserInstitution}>
                        {typeof request.user.institution === 'object' 
                          ? getSafeString(request.user.institution.name)
                          : getSafeString(request.user.institution)
                        }
                      </Text>
                    )}
                  </View>
                  <View style={styles.requestStatusContainer}>
                    <View style={[
                      styles.requestStatusBadge,
                      request.status === 'approved' ? styles.statusApproved : 
                      request.status === 'pending' ? styles.statusPending : styles.statusRejected
                    ]}>
                      <Text style={styles.requestStatusText}>
                        {getSafeString(request.status).toUpperCase()}
                      </Text>
                    </View>
                    {request.status === 'pending' && (
                      <View style={styles.requestActions}>
                        <TouchableOpacity 
                          style={[styles.actionButton, styles.approveButton]}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleJoinRequestStatusUpdate(request._id, 'approved', course._id);
                          }}
                        >
                          <Icon name="checkmark" size={14} color="#FFFFFF" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.actionButton, styles.rejectButton]}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleJoinRequestStatusUpdate(request._id, 'rejected', course._id);
                          }}
                        >
                          <Icon name="close" size={14} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                  <Text style={styles.requestDate}>
                    {new Date(request.requestedAt).toLocaleDateString()}
                  </Text>
                </View>
              ))}
              {course.joinRequests.length > 2 && (
                <Text style={styles.viewMoreText}>
                  +{course.joinRequests.length - 2} more requests...
                </Text>
              )}
            </View>
          )}
          
          {course.course_type === 'private' && !hasAccess && (
            <View style={styles.joinPrompt}>
              <Icon name="person-add" size={14} color="#b3b72b" />
              <Text style={styles.joinPromptText}>
                Use the join code above to access this course
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Student Detail Modal
  const renderStudentModal = () => {
    if (!selectedStudent) return null;

    return (
      <Modal
        visible={isStudentModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeStudentModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.detailModal,
              { 
                opacity: studentModalAnim,
                transform: [{ scale: studentModalAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                })}] 
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Student Details</Text>
              <TouchableOpacity onPress={closeStudentModal} style={styles.closeButton}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Student Basic Info */}
              <View style={styles.studentBasicInfo}>
                <View style={styles.studentAvatar}>
                  <Icon name="person-circle" size={60} color="#b3b72b" />
                </View>
                <View style={styles.studentDetails}>
                  <Text style={styles.studentNameLarge}>
                    {getSafeString(selectedStudent.name || selectedStudent.username, 'Unknown Student')}
                  </Text>
                  <Text style={styles.studentEmail}>{getSafeString(selectedStudent.email)}</Text>
                  <Text style={styles.studentInstitution}>
                    {getSafeString(selectedStudent.institution, 'No institution')}
                  </Text>
                </View>
              </View>

              {/* Statistics */}
              <View style={styles.statsGrid}>
                <View style={[styles.statItem, styles.pendingBadge]}>
                  <Text style={styles.statNumberLarge}>{selectedStudent.pendingRequests || 0}</Text>
                  <Text style={styles.statLabel}>Pending</Text>
                </View>
                <View style={[styles.statItem, styles.approvedBadge]}>
                  <Text style={styles.statNumberLarge}>{selectedStudent.approvedRequests || 0}</Text>
                  <Text style={styles.statLabel}>Approved</Text>
                </View>
                <View style={[styles.statItem, styles.rejectedBadge]}>
                  <Text style={styles.statNumberLarge}>{selectedStudent.rejectedRequests || 0}</Text>
                  <Text style={styles.statLabel}>Rejected</Text>
                </View>
                <View style={[styles.statItem, styles.totalBadge]}>
                  <Text style={styles.statNumberLarge}>{selectedStudent.courses?.length || 0}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
              </View>

              {/* Course Requests */}
              <View style={styles.courseRequestsSection}>
                <Text style={styles.sectionTitleModal}>Course Requests</Text>
                {selectedStudent.courses && selectedStudent.courses.map((course, index) => (
                  <View key={`${selectedStudent._id}-${course.requestId}-${index}`} style={styles.courseRequestDetail}>
                    <View style={styles.courseRequestHeader}>
                      <Text style={styles.courseName}>{getSafeString(course.courseName)}</Text>
                      <Text style={[
                        styles.requestStatus,
                        course.status === 'approved' ? styles.statusApproved : 
                        course.status === 'pending' ? styles.statusPending : styles.statusRejected
                      ]}>
                        {getSafeString(course.status).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.courseCode}>Join Code: {getSafeString(course.joinCode)}</Text>
                    <Text style={styles.requestDate}>
                      Requested: {course.requestedAt ? new Date(course.requestedAt).toLocaleDateString() : 'Unknown date'}
                    </Text>
                    <View style={styles.requestActions}>
                      {course.status === 'pending' ? (
                        <View style={styles.pendingActions}>
                          <TouchableOpacity 
                            style={[styles.actionButton, styles.approveButton]}
                            onPress={() => handleStatusToggle(
                              selectedStudent._id, 
                              course.courseId, 
                              course.requestId, 
                              'approved'
                            )}
                          >
                            <Icon name="checkmark" size={16} color="#FFFFFF" />
                            <Text style={styles.actionButtonText}>Approve</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={[styles.actionButton, styles.rejectButton]}
                            onPress={() => handleStatusToggle(
                              selectedStudent._id, 
                              course.courseId, 
                              course.requestId, 
                              'rejected'
                            )}
                          >
                            <Icon name="close" size={16} color="#FFFFFF" />
                            <Text style={styles.actionButtonText}>Reject</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View style={styles.statusActions}>
                          <Text style={styles.currentStatusText}>
                            Status: {course.status === 'approved' ? 'Approved' : 'Rejected'}
                          </Text>
                          <TouchableOpacity 
                            style={[styles.actionButton, styles.pendingButton]}
                            onPress={() => handleStatusToggle(
                              selectedStudent._id, 
                              course.courseId, 
                              course.requestId, 
                              'pending'
                            )}
                          >
                            <Icon name="refresh" size={14} color="#FFFFFF" />
                            <Text style={styles.actionButtonText}>Reset to Pending</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  // Course Detail Modal
  const renderCourseModal = () => {
    if (!selectedCourse) return null;

    const approvedRequests = selectedCourse.joinRequests?.filter(req => req.status === 'approved') || [];
    const pendingRequests = selectedCourse.joinRequests?.filter(req => req.status === 'pending') || [];
    const rejectedRequests = selectedCourse.joinRequests?.filter(req => req.status === 'rejected') || [];

    return (
      <Modal
        visible={isCourseModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeCourseModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.detailModal,
              { 
                opacity: courseModalAnim,
                transform: [{ scale: courseModalAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                })}] 
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Course Details</Text>
              <TouchableOpacity onPress={closeCourseModal} style={styles.closeButton}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Course Basic Info */}
              <View style={styles.courseBasicInfo}>
                <Image
                  source={{ uri: getSafeString(selectedCourse.imageUrl) }}
                  style={styles.courseImageLarge}
                  resizeMode="cover"
                  onError={() => {
                    selectedCourse.imageUrl = require('../assets/images/default.png');
                  }}
                />
                <View style={styles.courseDetails}>
                  <Text style={styles.courseTitleLarge}>{getSafeString(selectedCourse.title)}</Text>
                  <Text style={styles.courseCategory}>{getSafeString(selectedCourse.category, 'General')}</Text>
                  <Text style={styles.courseDuration}>{getSafeString(selectedCourse.duration)} Hour</Text>
                  <Text style={styles.courseType}>{getSafeString(selectedCourse.course_type)} Course</Text>
                  {selectedCourse.join_code && (
                    <View style={styles.joinCodeSection}>
                      <Text style={styles.joinCodeLabel}>Join Code:</Text>
                      <View style={styles.joinCodeValueContainer}>
                        <Text style={styles.joinCodeValueLarge}>{getSafeString(selectedCourse.join_code)}</Text>
                        <TouchableOpacity 
                          style={styles.copyButton}
                          onPress={() => copyJoinCode(getSafeString(selectedCourse.join_code))}
                        >
                          <Icon name="copy-outline" size={20} color="#b3b72b" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              </View>

              {/* Request Statistics */}
              <View style={styles.statsGrid}>
                <View style={[styles.statItem, styles.pendingBadge]}>
                  <Text style={styles.statNumberLarge}>{pendingRequests.length}</Text>
                  <Text style={styles.statLabel}>Pending</Text>
                </View>
                <View style={[styles.statItem, styles.approvedBadge]}>
                  <Text style={styles.statNumberLarge}>{approvedRequests.length}</Text>
                  <Text style={styles.statLabel}>Approved</Text>
                </View>
                <View style={[styles.statItem, styles.rejectedBadge]}>
                  <Text style={styles.statNumberLarge}>{rejectedRequests.length}</Text>
                  <Text style={styles.statLabel}>Rejected</Text>
                </View>
                <View style={[styles.statItem, styles.totalBadge]}>
                  <Text style={styles.statNumberLarge}>{selectedCourse.joinRequests?.length || 0}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
              </View>

              {/* Join Requests by Status */}
              <View style={styles.requestsByStatus}>
                {/* Pending Requests */}
                {pendingRequests.length > 0 && (
                  <View style={styles.requestStatusSection}>
                    <Text style={styles.sectionTitleModal}>Pending Requests ({pendingRequests.length})</Text>
                    {pendingRequests.map((request, index) => (
                      <View key={request._id || index} style={styles.requestItemDetail}>
                        <View style={styles.requestUserInfo}>
                          <Text style={styles.requestUserName}>
                            {getSafeString(request.user?.username || request.user?.email, 'Unknown User')}
                          </Text>
                          <Text style={styles.requestUserEmail}>
                            {getSafeString(request.user?.email)}
                          </Text>
                          {request.user?.institution && (
                            <Text style={styles.requestUserInstitution}>
                              {typeof request.user.institution === 'object' 
                                ? getSafeString(request.user.institution.name)
                                : getSafeString(request.user.institution)
                              }
                            </Text>
                          )}
                        </View>
                        <View style={styles.requestActions}>
                          <TouchableOpacity 
                            style={[styles.actionButton, styles.approveButton]}
                            onPress={() => handleJoinRequestStatusUpdate(request._id, 'approved', selectedCourse._id)}
                          >
                            <Icon name="checkmark" size={14} color="#FFFFFF" />
                            <Text style={styles.actionButtonText}>Approve</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={[styles.actionButton, styles.rejectButton]}
                            onPress={() => handleJoinRequestStatusUpdate(request._id, 'rejected', selectedCourse._id)}
                          >
                            <Icon name="close" size={14} color="#FFFFFF" />
                            <Text style={styles.actionButtonText}>Reject</Text>
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.requestDate}>
                          {new Date(request.requestedAt).toLocaleDateString()}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Approved Requests */}
                {approvedRequests.length > 0 && (
                  <View style={styles.requestStatusSection}>
                    <Text style={styles.sectionTitleModal}>Approved Requests ({approvedRequests.length})</Text>
                    {approvedRequests.map((request, index) => (
                      <View key={request._id || index} style={styles.requestItemDetail}>
                        <View style={styles.requestUserInfo}>
                          <Text style={styles.requestUserName}>
                            {getSafeString(request.user?.username || request.user?.email, 'Unknown User')}
                          </Text>
                          <Text style={styles.requestUserEmail}>
                            {getSafeString(request.user?.email)}
                          </Text>
                          <Text style={styles.requestStatusApproved}>APPROVED</Text>
                        </View>
                        <Text style={styles.requestDate}>
                          {new Date(request.requestedAt).toLocaleDateString()}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Rejected Requests */}
                {rejectedRequests.length > 0 && (
                  <View style={styles.requestStatusSection}>
                    <Text style={styles.sectionTitleModal}>Rejected Requests ({rejectedRequests.length})</Text>
                    {rejectedRequests.map((request, index) => (
                      <View key={request._id || index} style={styles.requestItemDetail}>
                        <View style={styles.requestUserInfo}>
                          <Text style={styles.requestUserName}>
                            {getSafeString(request.user?.username || request.user?.email, 'Unknown User')}
                          </Text>
                          <Text style={styles.requestUserEmail}>
                            {getSafeString(request.user?.email)}
                          </Text>
                          <Text style={styles.requestStatusRejected}>REJECTED</Text>
                        </View>
                        <Text style={styles.requestDate}>
                          {new Date(request.requestedAt).toLocaleDateString()}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
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
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.joinButton}
            onPress={handleJoinCourseOpen}
          >
            <Text style={styles.joinButtonText}>Join Course</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleAuthAction} style={styles.authButton}>
            <Icon 
              name={authUser ? "log-out-outline" : "log-in-outline"} 
              size={22} 
              color="#b3b72b" 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <View style={styles.searchBar}>
            <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search students or courses..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                <Icon name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tabs for Students and Courses */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'students' && styles.activeTab]}
            onPress={() => setActiveTab('students')}
          >
            <Text style={[styles.tabText, activeTab === 'students' && styles.activeTabText]}>
              Students ({students.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Status Filter for Students */}
        {activeTab === 'students' && (
          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Filter by Status:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {['all', 'pending', 'approved', 'rejected'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterButton,
                    statusFilter === status && styles.filterButtonActive
                  ]}
                  onPress={() => setStatusFilter(status)}
                >
                  <Text style={[
                    styles.filterButtonText,
                    statusFilter === status && styles.filterButtonTextActive
                  ]}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

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
              <Text style={styles.loadingText}>Loading...</Text>
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

          {/* Students List */}
          {!loading && !error && activeTab === 'students' && (
            <View style={styles.studentsSection}>
              <Text style={styles.sectionTitle}>
                Students with Join Requests ({filteredStudents.length})
                {statusFilter !== 'all' && ` - ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}`}
              </Text>

              {loadingStudents ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4ECDC4" />
                  <Text style={styles.loadingText}>Loading students...</Text>
                </View>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map(renderStudentCard)
              ) : (
                <View style={styles.emptyState}>
                  <Icon name="people-outline" size={48} color="#CCCCCC" />
                  <Text style={styles.emptyStateText}>
                    {searchQuery ? 'No students found matching your search.' : 'No students found with join requests.'}
                  </Text>
                  {statusFilter !== 'all' && (
                    <Text style={styles.emptyStateSubText}>
                      Try changing the status filter or search term.
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Courses List */}
          {!loading && !error && (activeTab === 'public' || activeTab === 'private') && (
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
      </View>

      {/* Search Modal */}
      <Modal
        visible={isSearchVisible}
        transparent={true}
        animationType="none"
        onRequestClose={handleSearchClose}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.searchModal,
              { transform: [{ translateX: searchSlideAnim }] }
            ]}
          >
            <View style={styles.searchHeader}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search courses or students..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus={true}
              />
              <TouchableOpacity onPress={handleSearchClose} style={styles.closeButton}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Join Course Modal */}
      <Modal
        visible={isJoinCourseVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleJoinCourseClose}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.joinModal,
              { 
                opacity: modalOpacity,
                transform: [{ scale: modalScale }] 
              }
            ]}
          >
            <View style={styles.joinModalHeader}>
              <Text style={styles.joinModalTitle}>Join a Course</Text>
              <TouchableOpacity onPress={handleJoinCourseClose} style={styles.closeButton}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.joinModalContent}>
              <Text style={styles.joinModalText}>
                Enter the course join code provided by your instructor
              </Text>
              
              <TextInput
                style={styles.joinCodeInput}
                placeholder="Enter join code"
                value={joinCode}
                onChangeText={setJoinCode}
                autoCapitalize="characters"
                autoCorrect={false}
              />
              
              <TouchableOpacity 
                style={[
                  styles.joinSubmitButton,
                  isJoining && styles.joinSubmitButtonDisabled
                ]}
                onPress={handleJoinCourse}
                disabled={isJoining}
              >
                {isJoining ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.joinSubmitButtonText}>Join Course</Text>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Student Detail Modal */}
      {renderStudentModal()}

      {/* Course Detail Modal */}
      {renderCourseModal()}
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
  joinButton: {
    backgroundColor: '#b3b72b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#b3b72b',
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
  // Search Bar Styles
  searchBarContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
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
  // Filter Styles
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterButtonActive: {
    backgroundColor: '#b3b72b',
    borderColor: '#b3b72b',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
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
  studentsSection: {
    paddingHorizontal: 16,
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
  // Student Card Styles
  studentCard: {
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
  studentHeader: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  studentEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  studentInstitution: {
    fontSize: 12,
    color: '#b3b72b',
    fontWeight: '500',
  },
  studentStats: {
    flexDirection: 'row',
    gap: 6,
  },
  statBadge: {
    alignItems: 'center',
    padding: 6,
    borderRadius: 6,
    minWidth: 50,
  },
  pendingBadge: {
    backgroundColor: '#FFF3CD',
  },
  approvedBadge: {
    backgroundColor: '#D1ECF1',
  },
  rejectedBadge: {
    backgroundColor: '#F8D7DA',
  },
  totalBadge: {
    backgroundColor: '#E2E3E5',
  },
  statNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 9,
    color: '#666',
    marginTop: 2,
  },
  coursesList: {
    padding: 16,
  },
  coursesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  courseRequestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  courseRequestInfo: {
    flex: 1,
    marginRight: 12,
  },
  courseName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  courseCode: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  requestMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requestStatus: {
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusPending: {
    backgroundColor: '#FFF3CD',
    color: '#856404',
  },
  statusApproved: {
    backgroundColor: '#D1ECF1',
    color: '#0C5460',
  },
  statusRejected: {
    backgroundColor: '#F8D7DA',
    color: '#721C24',
  },
  requestDate: {
    fontSize: 10,
    color: '#999',
    fontStyle: 'italic',
  },
  toggleContainer: {
    alignItems: 'flex-end',
    minWidth: 120,
  },
  pendingActions: {
    flexDirection: 'row',
    gap: 6,
  },
  statusActions: {
    alignItems: 'center',
    gap: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  approveButton: {
    backgroundColor: '#28a745',
  },
  rejectButton: {
    backgroundColor: '#dc3545',
  },
  pendingButton: {
    backgroundColor: '#6c757d',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  currentStatusText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  viewMoreText: {
    fontSize: 12,
    color: '#b3b72b',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  // Course Card Styles
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
  accessBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  accessGrantedBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
  },
  accessRequiredBadge: {
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
  },
  accessBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
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
  // Join Requests Styles
  joinRequestsSection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#b3b72b',
  },
  joinRequestsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  joinRequestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  requestUserInfo: {
    flex: 1,
  },
  requestUserName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  requestUserEmail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  requestUserInstitution: {
    fontSize: 11,
    color: '#b3b72b',
    fontStyle: 'italic',
  },
  requestStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requestStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  requestStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 4,
  },
  requestDate: {
    fontSize: 10,
    color: '#999',
    fontStyle: 'italic',
  },
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
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  bottomSpacer: {
    height: 20,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    height: '100%',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 12,
    fontSize: 16,
  },
  joinModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    width: '90%',
    maxWidth: 400,
  },
  joinModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  joinModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  joinModalContent: {
    alignItems: 'center',
  },
  joinModalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  joinCodeInput: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 20,
  },
  joinSubmitButton: {
    backgroundColor: '#b3b72b',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  joinSubmitButtonDisabled: {
    opacity: 0.6,
  },
  joinSubmitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Detail Modal Styles
  detailModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 20,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    padding: 20,
  },
  // Student Modal Styles
  studentBasicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  studentAvatar: {
    marginRight: 16,
  },
  studentDetails: {
    flex: 1,
  },
  studentNameLarge: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    minWidth: 70,
  },
  statNumberLarge: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  courseRequestsSection: {
    marginBottom: 20,
  },
  sectionTitleModal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  courseRequestDetail: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#b3b72b',
  },
  courseRequestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  // Course Modal Styles
  courseBasicInfo: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  courseImageLarge: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 16,
  },
  courseDetails: {
    flex: 1,
  },
  courseTitleLarge: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  courseDuration: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  courseType: {
    fontSize: 14,
    color: '#b3b72b',
    fontWeight: '500',
    marginBottom: 8,
  },
  joinCodeSection: {
    marginTop: 8,
  },
  joinCodeValueLarge: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#b3b72b',
    letterSpacing: 1,
  },
  requestsByStatus: {
    marginBottom: 20,
  },
  requestStatusSection: {
    marginBottom: 16,
  },
  requestItemDetail: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  requestStatusApproved: {
    color: '#28a745',
    fontWeight: 'bold',
    fontSize: 12,
  },
  requestStatusRejected: {
    color: '#dc3545',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default StudentDetailScreen;