import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  SectionList,
} from 'react-native';

const LeaderboardScreen = ({ navigation }) => {
  const [selectedTest, setSelectedTest] = useState('pre');
  
  // Mock data for leaderboard
  const leaderboardData = {
    pre: [
      { id: '1', name: 'Student1', score: 95, rank: 1 },
      { id: '2', name: 'Student2', score: 88, rank: 2 },
      { id: '3', name: 'Student3', score: 82, rank: 3 },
      { id: '4', name: 'Student4', score: 78, rank: 4 },
      { id: '5', name: 'Student5', score: 75, rank: 5 },
    ],
    post: [
      { id: '1', name: 'Student1', score: 98, rank: 1 },
      { id: '2', name: 'Student2', score: 92, rank: 2 },
      { id: '3', name: 'Student3', score: 85, rank: 3 },
      { id: '4', name: 'Student4', score: 80, rank: 4 },
      { id: '5', name: 'Student5', score: 76, rank: 5 },
    ]
  };

  const currentData = leaderboardData[selectedTest];
  const hasData = currentData && currentData.length > 0;

  const renderLeaderboardItem = ({ item, index }) => (
    <View style={[
      styles.leaderboardItem,
      index === 0 && styles.topRankItem,
      item.rank <= 3 && styles.podiumItem
    ]}>
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
        <Text style={styles.studentName}>{item.name}</Text>
        <Text style={styles.studentId}>ID: {item.id}</Text>
      </View>
      
      <View style={styles.scoreContainer}>
        <Text style={styles.score}>{item.score}</Text>
        <Text style={styles.scoreLabel}>Points</Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No leaderboard data available</Text>
      <Text style={styles.emptyStateText}>
        Scores will appear once students complete the test.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Leaderboard</Text>
        </View>

        {/* Test Type Selector */}
        <View style={styles.testSelector}>
          <TouchableOpacity
            style={[
              styles.testButton,
              selectedTest === 'pre' && styles.selectedTestButton
            ]}
            onPress={() => setSelectedTest('pre')}
          >
            <Text style={[
              styles.testButtonText,
              selectedTest === 'pre' && styles.selectedTestButtonText
            ]}>
              Pre-Test
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.testButton,
              selectedTest === 'post' && styles.selectedTestButton
            ]}
            onPress={() => setSelectedTest('post')}
          >
            <Text style={[
              styles.testButtonText,
              selectedTest === 'post' && styles.selectedTestButtonText
            ]}>
              Post-Test
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Leaderboard Content */}
        {hasData ? (
          <View style={styles.leaderboardContainer}>
            {/* Podium for top 3 */}
            {currentData.filter(item => item.rank <= 3).length > 0 && (
              <View style={styles.podiumSection}>
                <Text style={styles.sectionTitle}>Top Performers</Text>
                <View style={styles.podium}>
                  {currentData
                    .filter(item => item.rank <= 3)
                    .sort((a, b) => a.rank - b.rank)
                    .map((item) => (
                      <View 
                        key={item.id} 
                        style={[
                          styles.podiumItem,
                          item.rank === 1 && styles.firstPlace,
                          item.rank === 2 && styles.secondPlace,
                          item.rank === 3 && styles.thirdPlace,
                        ]}
                      >
                        <View style={styles.podiumRank}>
                          <Text style={styles.podiumRankText}>
                            {item.rank}
                          </Text>
                        </View>
                        <Text style={styles.podiumName} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text style={styles.podiumScore}>
                          {item.score}
                        </Text>
                      </View>
                    ))}
                </View>
              </View>
            )}

            {/* Full Leaderboard List */}
            <View style={styles.leaderboardList}>
              <Text style={styles.sectionTitle}>Full Ranking</Text>
              {currentData.map((item, index) => renderLeaderboardItem({ item, index }))}
            </View>

            {/* Current User Position (if applicable) */}
            <View style={styles.currentUserSection}>
              <View style={styles.currentUserCard}>
                <Text style={styles.currentUserLabel}>Your Position</Text>
                <View style={styles.currentUserInfo}>
                  <Text style={styles.currentUserRank}>#6</Text>
                  <Text style={styles.currentUserName}>You</Text>
                  <Text style={styles.currentUserScore}>68 Points</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          renderEmptyState()
        )}

        {/* Statistics Section */}
        {hasData && (
          <View style={styles.statsSection}>
            <Text style={styles.statsTitle}>Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{currentData.length}</Text>
                <Text style={styles.statLabel}>Total Students</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {Math.max(...currentData.map(item => item.score))}
                </Text>
                <Text style={styles.statLabel}>Highest Score</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {Math.round(currentData.reduce((sum, item) => sum + item.score, 0) / currentData.length)}
                </Text>
                <Text style={styles.statLabel}>Average</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Text style={styles.tabText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.tabText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 25,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  testSelector: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
  },
  testButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  selectedTestButton: {
    backgroundColor: '#b3b72b',
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  selectedTestButtonText: {
    color: '#fff',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  leaderboardContainer: {
    marginBottom: 20,
  },
  podiumSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  podiumItem: {
    alignItems: 'center',
    flex: 1,
    padding: 10,
  },
  firstPlace: {
    height: 100,
    backgroundColor: '#FFD700',
    borderRadius: 8,
    justifyContent: 'space-between',
  },
  secondPlace: {
    height: 80,
    backgroundColor: '#C0C0C0',
    borderRadius: 8,
    justifyContent: 'space-between',
  },
  thirdPlace: {
    height: 70,
    backgroundColor: '#CD7F32',
    borderRadius: 8,
    justifyContent: 'space-between',
  },
  podiumRank: {
    marginBottom: 5,
  },
  podiumRankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  podiumName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  podiumScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  leaderboardList: {
    marginBottom: 20,
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
  topRankItem: {
    backgroundColor: '#fff9e6',
    borderColor: '#ffd700',
  },
  podiumItem: {
    backgroundColor: '#f0f8ff',
    borderColor: '#b3b72b',
  },
  rankContainer: {
    marginRight: 15,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6c757d',
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
  studentId: {
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
    marginTop: 20,
  },
  currentUserCard: {
    backgroundColor: '#b3b72b',
    padding: 15,
    borderRadius: 8,
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
  statsSection: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 8,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#b3b72b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  tabItem: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  tabText: {
    color: '#b3b72b',
    fontWeight: '500',
  },
});

export default LeaderboardScreen;