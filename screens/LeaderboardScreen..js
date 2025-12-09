import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../navigation/AuthContext';
import { fetchLeaderBoardForTest } from '../API_STORE/test_api';

const LeaderboardScreen = ({ navigation, route }) => {
  const { authUser } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Get testId from navigation params
  const testId = route.params?.testId;
  const testName = route.params?.testName || 'Test Leaderboard';

  useEffect(() => {
    loadLeaderboardData();
  }, [testId]);

  const loadLeaderboardData = async () => {
    try {
      setLoading(true);
      if (!testId) {
        throw new Error('Test ID is required');
      }

      const response = await fetchLeaderBoardForTest(testId);

      if (response && response.rankings) {
        // Transform the API data to match our UI structure
        const transformedData = transformLeaderboardData(response);
        setLeaderboardData(transformedData);
      } else {
        throw new Error('No leaderboard data found');
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      Alert.alert('Error', 'Failed to load leaderboard data');
      setLeaderboardData(null);
    } finally {
      setLoading(false);
    }
  };

  const transformLeaderboardData = (apiData) => {
    // Sort rankings by score (descending) and add ranks
    const sortedRankings = [...apiData.rankings].sort((a, b) => (b.score || 0) - (a.score || 0));

    const rankedData = sortedRankings.map((item, index) => ({
      ...item,
      rank: index + 1,
      // Ensure user object has proper name
      user: {
        ...item.user,
        name: item.user?.email || 'Unknown User'
      }
    }));

    // Calculate statistics based on actual data
    const scores = rankedData.map(item => item.score || 0);
    const totalParticipants = rankedData.length;
    const highestScore = totalParticipants > 0 ? Math.max(...scores) : 0;
    const averageScore = totalParticipants > 0
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / totalParticipants)
      : 0;

    // Find current user's position
    const currentUserRanking = rankedData.find(item =>
      item.user?._id === authUser?._id
    );

    return {
      rankings: rankedData,
      testInfo: {
        name: apiData.test?.test_name || testName,
        totalParticipants,
        averageScore,
        highestScore: apiData.best_score || highestScore,
        subject: apiData.subject?.title || apiData.subject?.name || 'General',
        lesson: apiData.lesson?.name || 'All Lessons',
        bestScore: apiData.best_score || 0
      },
      currentUser: currentUserRanking || null,
      metadata: {
        createdAt: apiData.createdAt,
        updatedAt: apiData.updatedAt
      }
    };
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboardData();
    setRefreshing(false);
  };

  const renderLeaderboardItem = ({ item, index }) => {
    const isCurrentUser = item.user?._id === authUser?._id;

    return (
      <View style={[
        styles.leaderboardItem,
        isCurrentUser && styles.currentUserItem,
        item.rank <= 3 && styles.podiumItem
      ]} key={index}>
        <View style={styles.rankContainer}>
          <View style={[
            styles.rankBadge,
            item.rank === 1 && styles.firstRank,
            item.rank === 2 && styles.secondRank,
            item.rank === 3 && styles.thirdRank,
          ]}>
            <Text style={[
              styles.rankText,
              item.rank <= 3 && styles.podiumRankText
            ]}>
              {item.rank}
            </Text>
          </View>
        </View>

        <View style={styles.studentInfo}>
          <Text style={[
            styles.studentName,
            isCurrentUser && styles.currentUserName
          ]}>
            {item.user?.name}
            {isCurrentUser && " (You)"}
          </Text>
          <Text style={styles.studentDetails}>
            Score: {item.score || 0}
          </Text>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={styles.score}>{item.score || 0}</Text>
          <Text style={styles.scoreLabel}>Points</Text>
        </View>
      </View>
    );
  };

  const renderPodium = () => {
    const topThree = leaderboardData.rankings.filter(item => item.rank <= 3);

    if (topThree.length === 0) return null;

    // Sort for podium display: 1st in middle, 2nd left, 3rd right
    const podiumOrder = [
      topThree.find(item => item.rank === 2),
      topThree.find(item => item.rank === 1),
      topThree.find(item => item.rank === 3)
    ].filter(Boolean);

    const getMedalIcon = (rank) => {
      switch (rank) {
        case 1: return '🏆';
        case 2: return '🥈';
        case 3: return '🥉';
        default: return '🎖️';
      }
    };

    const getPodiumHeight = (rank) => {
      switch (rank) {
        case 1: return 200;
        case 2: return 180;
        case 3: return 160;
        default: return 80;
      }
    };

    const getPodiumColor = (rank) => {
      switch (rank) {
        case 1: return ['#FFD700', '#FFEC8B']; // Gold gradient
        case 2: return ['#C0C0C0', '#E8E8E8']; // Silver gradient
        case 3: return ['#CD7F32', '#E6B17E']; // Bronze gradient
        default: return ['#667eea', '#764ba2']; // Purple gradient
      }
    };

    return (
      <View style={styles.podiumSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.trophyIconContainer}>
            <Icon name="trophy" size={28} color="#FFD700" />
          </View>
          <Text style={styles.sectionTitle}>Top Performers</Text>
        </View>

        <View style={styles.podiumContainer}>
          {podiumOrder.map((item, index) => {
            if (!item) return null;

            const isFirstPlace = item.rank === 1;
            const podiumHeight = getPodiumHeight(item.rank);
            const podiumColors = getPodiumColor(item.rank);

            return (
              <View
                key={item.user?._id || item.rank}
                style={styles.podiumColumn}
              >
                {/* User Avatar/Initial */}
                <View style={[
                  styles.podiumAvatar,
                  isFirstPlace && styles.firstPlaceAvatar
                ]}>
                  <Text style={[
                    styles.avatarText,
                    isFirstPlace && styles.firstPlaceAvatarText
                  ]}>
                    {item.user?.name?.charAt(0).toUpperCase() || '?'}
                  </Text>
                  <View style={styles.medalContainer}>
                    <Text style={styles.medalIcon}>
                      {getMedalIcon(item.rank)}
                    </Text>
                  </View>
                </View>

                {/* Podium Platform */}
                <View style={[
                  styles.podiumPlatform,
                  {
                    height: podiumHeight,
                    backgroundColor: podiumColors[0],
                    borderColor: podiumColors[1]
                  }
                ]}>
                  {/* Platform shine effect */}
                  <View style={styles.platformShine} />

                  {/* Rank Number */}
                  <View style={styles.platformRankContainer}>
                    <View style={[
                      styles.rankCircle,
                      { backgroundColor: podiumColors[1] }
                    ]}>
                      <Text style={styles.platformRankText}>{item.rank}</Text>
                    </View>
                  </View>

                  {/* User Name */}
                  <Text style={styles.platformName} numberOfLines={1}>
                    {item.user?.name || 'Unknown'}
                  </Text>

                  {/* Score */}
                  <Text style={styles.platformScore}>
                    {item.score || 0}
                  </Text>
                  <Text style={styles.platformPointsLabel}>points</Text>
                </View>

                {/* Base */}
                <View style={[
                  styles.podiumBase,
                  { backgroundColor: podiumColors[0] }
                ]} />
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderStats = () => (
    <View style={styles.statsSection}>
      <View style={styles.sectionHeader}>
        <Icon name="stats-chart" size={24} color="#b3b72b" />
        <Text style={styles.sectionTitle}>Test Statistics</Text>
      </View>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#E3F2FD' }]}>
            <Icon name="people" size={20} color="#1976D2" />
          </View>
          <Text style={styles.statNumber}>{leaderboardData.testInfo.totalParticipants}</Text>
          <Text style={styles.statLabel}>Participants</Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#E8F5E8' }]}>
            <Icon name="trophy" size={20} color="#388E3C" />
          </View>
          <Text style={styles.statNumber}>{leaderboardData.testInfo.highestScore}</Text>
          <Text style={styles.statLabel}>Top Score</Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#FFF3E0' }]}>
            <Icon name="analytics" size={20} color="#F57C00" />
          </View>
          <Text style={styles.statNumber}>{leaderboardData.testInfo.averageScore}</Text>
          <Text style={styles.statLabel}>Average</Text>
        </View>
      </View>

      {/* Best Score Information */}
      {leaderboardData.testInfo.bestScore > 0 && (
        <View style={styles.bestScoreContainer}>
          <View style={styles.bestScoreBadge}>
            <Icon name="star" size={16} color="#FFD700" />
            <Text style={styles.bestScoreText}>
              Best Score: {leaderboardData.testInfo.bestScore}
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderCurrentUserSection = () => {
    if (!leaderboardData.currentUser) {
      return (
        <View style={styles.currentUserSection}>
          <View style={[styles.currentUserCard, styles.notParticipatedCard]}>
            <Icon name="help-circle" size={24} color="#fff" />
            <Text style={styles.currentUserLabel}>You haven't taken this test yet</Text>
            <TouchableOpacity
              style={styles.takeTestButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.takeTestButtonText}>Take Test Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.currentUserSection}>
        <View style={styles.currentUserCard}>
          <Text style={styles.currentUserLabel}>Your Position</Text>
          <View style={styles.currentUserInfo}>
            <Text style={styles.currentUserRank}>#{leaderboardData.currentUser.rank}</Text>
            <Text style={styles.currentUserName}>You</Text>
            <Text style={styles.currentUserScore}>{leaderboardData.currentUser.score || 0} Points</Text>
          </View>
          {leaderboardData.currentUser.correctAnswers && (
            <Text style={styles.correctAnswers}>
              Correct Answers: {leaderboardData.currentUser.correctAnswers}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="trophy-outline" size={80} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No Leaderboard Data Yet</Text>
      <Text style={styles.emptyStateText}>
        Be the first to complete this test and appear on the leaderboard!
      </Text>
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.ctaButtonText}>Back to Tests</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#b3b72b" />
      <Text style={styles.loadingText}>Loading Leaderboard...</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderLoadingState()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}


      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#b3b72b']}
            tintColor="#b3b72b"
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Test Info */}
        {leaderboardData && (
          <View style={styles.testInfoCard}>
            <Text style={styles.testName}>{leaderboardData.testInfo.name}</Text>
            <Text style={styles.testSubtitle}>
              {leaderboardData.testInfo.subject} • {leaderboardData.testInfo.lesson}
            </Text>
            <View style={styles.lastUpdated}>
              <Icon name="time-outline" size={12} color="#666" />
              <Text style={styles.lastUpdatedText}>
                Updated: {new Date(leaderboardData.metadata.updatedAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}

        {/* Content */}
        {leaderboardData && leaderboardData.rankings.length > 0 ? (
          <View style={styles.leaderboardContainer}>
            {renderPodium()}
            {renderStats()}

            {/* Full Leaderboard List */}
            <View style={styles.leaderboardList}>
              <View style={styles.sectionHeader}>
                <Icon name="list" size={24} color="#666" />
                <Text style={styles.sectionTitle}>Full Ranking</Text>
                <Text style={styles.participantCount}>
                  ({leaderboardData.rankings.length} participants)
                </Text>
              </View>
              {leaderboardData.rankings.map((item, index) =>
                renderLeaderboardItem({ item, index })
              )}
            </View>

            {renderCurrentUserSection()}
          </View>
        ) : (
          renderEmptyState()
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  testInfoCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    textTransform: 'capitalize'
  },
  testSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  lastUpdated: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#666',
  },
  leaderboardContainer: {
    marginBottom: 20,
  },
  podiumSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  participantCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 'auto',
  },
  podiumSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  trophyIconContainer: {
    backgroundColor: '#FFF9E6',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  podiumColumn: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  podiumAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -30,
    zIndex: 2,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  firstPlaceAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: '#FFD700',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  firstPlaceAvatarText: {
    color: '#FFD700',
    fontSize: 22,
  },
  medalContainer: {
    position: 'absolute',
    bottom: -5,
    right: -5,
  },
  medalIcon: {
    fontSize: 20,
  },
  podiumPlatform: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  platformShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
  },
  platformRankContainer: {
    position: 'absolute',
    top: 35,
  },
  rankCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  platformRankText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  platformName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 5,
    textAlign: 'center',
    paddingHorizontal: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  platformScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  platformPointsLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  podiumBase: {
    width: '120%',
    height: 10,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginTop: -5,
  },
  statsSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
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
    textAlign: 'center',
  },
  bestScoreContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  bestScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  bestScoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  leaderboardList: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 8,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  currentUserItem: {
    backgroundColor: '#E8F5E8',
    borderColor: '#b3b72b',
    borderWidth: 2,
  },
  rankContainer: {
    marginRight: 15,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  firstRank: {
    backgroundColor: '#FFD700',
  },
  secondRank: {
    backgroundColor: '#C0C0C0',
  },
  thirdRank: {
    backgroundColor: '#CD7F32',
  },
  rankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  podiumRankText: {
    color: '#333',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  currentUserName: {
    color: '#b3b72b',
    fontWeight: 'bold',
  },
  studentDetails: {
    fontSize: 12,
    color: '#666',
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  score: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#b3b72b',
    marginBottom: 2,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#666',
  },
  currentUserSection: {
    margin: 16,
    marginTop: 8,
  },
  currentUserCard: {
    backgroundColor: '#b3b72b',
    padding: 15,
    borderRadius: 8,
  },
  notParticipatedCard: {
    alignItems: 'center',
    gap: 8,
  },
  currentUserLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 8,
  },
  currentUserInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentUserRank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  currentUserName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  currentUserScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  correctAnswers: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  takeTestButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  takeTestButtonText: {
    color: '#b3b72b',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  ctaButton: {
    backgroundColor: '#b3b72b',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
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

export default LeaderboardScreen;