import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';

const ComparisonScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Comparison Result</Text>
        </View>

        <View style={styles.resultSection}>
          <Text style={styles.sectionTitle}>Result</Text>
          
          <View style={styles.comparisonItem}>
            <Text style={styles.label}>You</Text>
            <Text style={styles.score}>33.5</Text>
          </View>
          
          <View style={styles.comparisonItem}>
            <Text style={styles.label}>Topper</Text>
            <Text style={styles.score}>95</Text>
          </View>
          
          <View style={styles.comparisonItem}>
            <Text style={styles.label}>Average</Text>
            <Text style={styles.score}>68</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.scoreSection}>
          <Text style={styles.sectionTitle}>Score</Text>
          
          <View style={styles.scoreBreakdown}>
            <View style={styles.scoreItem}>
              <View style={[styles.scoreDot, styles.correctDot]} />
              <Text style={styles.scoreLabel}>Correct</Text>
            </View>
            
            <View style={styles.scoreItem}>
              <View style={[styles.scoreDot, styles.incorrectDot]} />
              <Text style={styles.scoreLabel}>Incorrect</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </ScrollView>
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
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  resultSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  comparisonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
  score: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#b3b72b',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 20,
  },
  scoreSection: {
    marginBottom: 30,
  },
  scoreBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginBottom: 8,
  },
  correctDot: {
    backgroundColor: '#28a745',
  },
  incorrectDot: {
    backgroundColor: '#dc3545',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
  },
  backButton: {
    backgroundColor: '#b3b72b',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ComparisonScreen;