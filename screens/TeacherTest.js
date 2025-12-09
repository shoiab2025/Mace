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
    Switch,
    Linking
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { fetchPreTests, fetchPostTests, fetchTeacherTests, fetchTeacherPreTests, updateTestStatus } from '../API_STORE/test_api';
import { fetchUserById } from '../API_STORE/user_api';
import RenderHTML from 'react-native-render-html';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../navigation/AuthContext';

const { width } = Dimensions.get('window');

const TeacherTest = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [preTests, setPreTests] = useState([]);
    const [postTests, setPostTests] = useState([]);
    const [teacherTests, setTeacherTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('teacher');
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

            const [prTests, ptTests, teacherTestData] = await Promise.all([
                fetchTeacherPreTests(authUser),
                fetchPostTests(),
                fetchTeacherTests(authUser)
            ]);

            const combinedPrePostTests = [
                ...(prTests || []),
                ...(ptTests || [])
            ];

            setPreTests(prTests || []);
            setPostTests(ptTests || []);
            setTeacherTests(teacherTestData || []);
            console.log("the teacher test", teacherTests);

            await loadCreators([...combinedPrePostTests, ...(teacherTestData?.data || [])]);
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
        if (test.created_by && typeof test.created_by === 'object' && test.created_by.username) {
            return {
                name: test.created_by.name || test.created_by.username || 'Unknown Creator',
                isLoading: false
            };
        }

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
        const estimatedMinutes = Math.ceil(questionCount * 1.5);
        return `${estimatedMinutes} min`;
    };

    const toggleTestStatus = async (testId) => {
        try {
            const testToUpdate = teacherTests.find(test => test._id === testId);
            if (!testToUpdate) {
                Alert.alert('Error', 'Test not found');
                return;
            }

            const currentStatus = testToUpdate.test_status || 'enabled';
            const newStatus = currentStatus === 'enabled' ? 'disabled' : 'enabled';
            const result = await updateTestStatus(testId, {
                status: currentStatus
            });

            if (result && result.success !== false) {
                onRefresh()
                Alert.alert(
                    'Success',
                    `Test has been ${newStatus === 'enabled' ? 'enabled' : 'disabled'}`,
                    [{ text: 'OK' }]
                );
            } else {
                throw new Error(result?.error || 'Failed to update status');
            }

        } catch (error) {
            console.error('Error toggling test status:', error);
            Alert.alert(
                'Error',
                error.message || 'Failed to update test status. Please try again.'
            );
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadTests();
        setRefreshing(false);
    };

    useEffect(() => {
        loadTests();
    }, []);

    useEffect(() => {
        Animated.timing(searchSlideAnim, {
            toValue: isSearchVisible ? 0 : -width,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [isSearchVisible]);

    const getCurrentTests = () => {
        switch (activeTab) {
            case 'pre':
                return preTests;
            case 'post':
                return postTests;
            case 'teacher':
                return teacherTests;
            default:
                return [];
        }
    };

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

    const formatTestData = (tests) => {
        return tests.map((test, index) => ({
            id: test._id || `test-${index}`,
            title: test.test_name || 'Untitled Test',
            testType: test.test_type || 'pre-test',
            questionCount: test.test_questions?.length || 0,
            test_status: test.test_status || 'enabled',
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

    const getColorByIndex = (index) => {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFD93D', '#6BCF7F'];
        return colors[index % colors.length];
    };

    const getIconByTestType = (testType) => {
        const icons = {
            'pre-test': 'clipboard',
            'post-test': 'document-text',
            'teacher-test': 'school'
        };
        return icons[testType?.toLowerCase()] || 'help-circle';
    };

    const getTabTitle = () => {
        switch (activeTab) {
            case 'pre': return 'Pre Tests';
            case 'post': return 'Post Tests';
            case 'teacher': return 'My Created Tests';
            default: return 'Tests';
        }
    };

    const getTestCount = () => {
        switch (activeTab) {
            case 'pre': return preTests.length;
            case 'post': return postTests.length;
            case 'teacher': return teacherTests.length;
            default: return 0;
        }
    };

    const displayTests = formatTestData(filteredTests);

    const renderTeacherTestCard = (test) => (
        <View
            key={test.id}
            style={[
                styles.testCard
            ]}
        >
            <View style={styles.statusContainer}>
                <View style={[
                    styles.statusBadge,
                    test.test_status === 'enabled' ? styles.enabledBadge : styles.disabledBadge
                ]}>
                    <Text style={styles.statusText}>
                        {test.test_status === 'enabled' ? 'Enabled' : 'Disabled'}
                    </Text>
                </View>
            </View>

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
                { backgroundColor: test.color }
                ]}>
                    <Text style={styles.testTypeText}>
                        {test.testType === 'teacher-test' ? 'My Test' : test.testType}
                    </Text>
                </View>
            </View>

            <View style={styles.testInfo}>
                <View style={styles.firstRow}>
                    <Text style={[
                        styles.testTitle,
                        test.test_status === 'disabled' && styles.disabledText
                    ]} numberOfLines={2}>
                        {test.title}
                    </Text>
                    <View style={styles.questionsContainer}>
                        <Icon name="list" size={14} color="#666" />
                        <Text style={styles.questionsText}>
                            {test?.test_questions?.length} Qs
                        </Text>
                    </View>
                </View>

                <View style={styles.secondRow}>
                    <Text style={styles.courseName} numberOfLines={1}>
                        {test.courseName}
                    </Text>
                    <View style={styles.lessonContainer}>
                        <View style={[styles.typeIcon, { backgroundColor: test.color }]}>
                            <Icon name={test.icon} size={16} color="#FFFFFF" />
                        </View>
                        <Text style={styles.testCategory}>{test.lessonName}</Text>
                    </View>
                </View>

                <View style={styles.thirdRow}>
                    <View style={styles.statusSwitchContainer}>
                        <Text style={styles.statusLabel}>
                            {test.test_status === 'enabled' ? 'Active' : 'Inactive'}
                        </Text>
                        <Switch
                            value={test.test_status === 'enabled'}
                            onValueChange={() => toggleTestStatus(test.id)}
                            trackColor={{ false: '#767577', true: '#b3b72b' }}
                            thumbColor={test.test_status === 'enabled' ? '#ffffff' : '#f4f3f4'}
                            ios_backgroundColor="#3e3e3e"
                        />
                    </View>

                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={styles.leaderboardButton}
                            onPress={() => navigation.navigate('Leaderboard', { testId: test._id })}
                        >
                            <Icon name="trophy" size={16} color="#666" />
                            <Text style={styles.leaderboardButtonText}>Leaderboard</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.joinPrompt}>
                    <Icon name="information-circle" size={18} color="#b3b72b" />
                    <Text style={styles.joinPromptText}>
                        Enable or disable the test for students
                    </Text>
                </View>
            </View>
        </View>
    );

    const renderStudentTestCard = (test) => (
        <TouchableOpacity
            key={test.id}
            style={styles.testCard}
            onPress={() => navigateToTest(test)}
        >
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

            <View style={styles.testInfo}>
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
                            onPress={() => {
                                if (authUser) {
                                    navigation.navigate('TestSession', { testData: test })
                                }
                                else {
                                    Alert.alert(
                                        "Login Required",
                                        "You need to login to take the test."
                                    );
                                }
                            }}
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
                    {/* Search Icon in header removed since we have search bar above tabs */}
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
                {/* Search Bar Above Tabs */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search tests, courses, lessons..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholderTextColor="#999"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                                <Icon name="close-circle" size={18} color="#666" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Test Type Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'teacher' && styles.activeTab]}
                        onPress={() => setActiveTab('teacher')}
                    >
                        <Text style={[styles.tabText, activeTab === 'teacher' && styles.activeTabText]}>
                            My Tests ({teacherTests.length})
                        </Text>
                    </TouchableOpacity>
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

                {/* Search Results Info */}
                {searchQuery.length > 0 && (
                    <View style={styles.searchResultsInfo}>
                        <Text style={styles.searchResultsCount}>
                            Found {filteredTests.length} result{filteredTests.length !== 1 ? 's' : ''} for "{searchQuery}"
                        </Text>
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Text style={styles.clearSearchText}>Clear</Text>
                        </TouchableOpacity>
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
                            {searchQuery.length === 0 && (
                                <Text style={styles.sectionTitle}>
                                    {getTabTitle()} ({displayTests.length})
                                </Text>
                            )}

                            {displayTests.length > 0 ? (
                                displayTests.map(test =>
                                    activeTab === 'teacher'
                                        ? renderTeacherTestCard(test)
                                        : renderStudentTestCard(test)
                                )
                            ) : (
                                <View style={styles.emptyState}>
                                    {activeTab === 'teacher' ? (
                                        <>
                                            <Icon name="document-text-outline" size={60} color="#ccc" />
                                            <Text style={styles.emptyStateTitle}>
                                                {searchQuery ? 'No Tests Found' : 'No Tests Created Yet'}
                                            </Text>
                                            <Text style={styles.emptyStateText}>
                                                {searchQuery
                                                    ? `No tests found matching "${searchQuery}"`
                                                    : 'Create your first test to get started'}
                                            </Text>
                                            {!searchQuery && (
                                                <TouchableOpacity
                                                    style={styles.ctaButton}
                                                    onPress={() => Linking.openURL('https://www.nexgen-e.com/home')}
                                                >
                                                    <Text style={styles.ctaButtonText}>Create Your First Test</Text>
                                                </TouchableOpacity>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <Icon name="trophy-outline" size={60} color="#ccc" />
                                            <Text style={styles.emptyStateTitle}>
                                                {searchQuery ? 'No Tests Found' : 'No Tests Available'}
                                            </Text>
                                            <Text style={styles.emptyStateText}>
                                                {searchQuery
                                                    ? `No tests found matching "${searchQuery}"`
                                                    : 'No tests available in this category.'}
                                            </Text>
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
    authButton: {
        padding: 6,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
        gap: 12,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        padding: 0,
    },
    clearButton: {
        padding: 4,
    },
    advancedSearchButton: {
        backgroundColor: '#F5F5F5',
        padding: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    searchResultsInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#F8F9FA',
        marginHorizontal: 16,
        marginBottom: 8,
        borderRadius: 8,
    },
    searchResultsCount: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    clearSearchText: {
        fontSize: 12,
        color: '#b3b72b',
        fontWeight: '600',
    },
    // Rest of the styles remain the same...
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
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginVertical: 8,
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
    testsSection: {
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 16,
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
    statusContainer: {
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 2,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    enabledBadge: {
        backgroundColor: '#4CAF50',
    },
    disabledBadge: {
        backgroundColor: '#F44336',
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    thumbnailContainer: {
        position: 'relative',
        width: '100%',
        height: 160,
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
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 6,
        width: '25%'
    },
    testTypeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '500',
        textTransform: 'capitalize',
        textAlign: 'center'
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
    statusSwitchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
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
        gap: 4,
    },
    leaderboardButtonText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
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
    lessonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
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
    testSubjectBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
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
});

export default TeacherTest;