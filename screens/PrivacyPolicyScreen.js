import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';

const PrivacyPolicyScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Privacy Policy</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionNumber}>1.</Text>
          <Text style={styles.sectionTitle}>Information We Collect</Text>
          
          <View style={styles.subsection}>
            <Text style={styles.subsectionLabel}>a. Personal Information:</Text>
            <Text style={styles.subsectionText}>
              Includes student name, ID, grade, and contact info.
            </Text>
          </View>
          
          <View style={styles.subsection}>
            <Text style={styles.subsectionLabel}>b. Educational Information:</Text>
            <Text style={styles.subsectionText}>
              Assignments, grades, discussions.
            </Text>
          </View>
          
          <View style={styles.subsection}>
            <Text style={styles.subsectionLabel}>c. Device and Usage Data:</Text>
            <Text style={styles.subsectionText}>
              IP address, device info, usage stats.
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionNumber}>2.</Text>
          <Text style={styles.sectionTitle}>How We Use Your Information</Text>
          
          <View style={styles.list}>
            <Text style={styles.listItem}>• To provide and maintain LMS functionality.</Text>
            <Text style={styles.listItem}>• To facilitate communication.</Text>
            <Text style={styles.listItem}>• To personalize the learning experience.</Text>
            <Text style={styles.listItem}>• To comply with legal obligations.</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionNumber}>3.</Text>
          <Text style={styles.sectionTitle}>Sharing and Disclosure</Text>
          
          <Text style={styles.paragraph}>
            We do not sell or rent your data. Information may be shared with school staff, 
            service providers, or as legally required.
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back to Profile</Text>
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
  section: {
    marginBottom: 25,
  },
  sectionNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#b3b72b',
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  subsection: {
    marginBottom: 12,
    marginLeft: 10,
  },
  subsectionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  subsectionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginLeft: 10,
  },
  list: {
    marginLeft: 10,
  },
  listItem: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginLeft: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 20,
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

export default PrivacyPolicyScreen;