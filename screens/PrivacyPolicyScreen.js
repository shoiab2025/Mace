import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { ChevronLeft, Shield, Lock, Eye, Share2, Users } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const PrivacyPolicyScreen = ({ navigation }) => {
  const sections = [
    {
      id: 1,
      title: 'Information We Collect',
      icon: '👤',
      color: '#b3b72b',
      items: [
        {
          label: 'Personal Information',
          text: 'Student name, ID, grade, contact details, and institution information.'
        },
        {
          label: 'Educational Information',
          text: 'Assignments, grades, course materials, discussions, and academic progress.'
        },
        {
          label: 'Device and Usage Data',
          text: 'IP address, device type, browser information, and usage statistics.'
        },
        {
          label: 'Communication Data',
          text: 'Messages, announcements, and interactions within the platform.'
        }
      ]
    },
    {
      id: 2,
      title: 'How We Use Your Information',
      icon: '🎯',
      color: '#4CAF50',
      items: [
        'Provide and maintain LMS functionality',
        'Facilitate communication between users',
        'Personalize the learning experience',
        'Track academic progress and performance',
        'Ensure platform security and integrity',
        'Comply with legal obligations'
      ]
    },
    {
      id: 3,
      title: 'Sharing and Disclosure',
      icon: '🤝',
      color: '#2196F3',
      content: 'We do not sell or rent your personal data. Information may be shared only with authorized school staff, verified service providers, or as legally required. We implement strict data protection measures to ensure your information remains confidential.'
    },
    {
      id: 4,
      title: 'Data Security',
      icon: '🔒',
      color: '#FF9800',
      items: [
        'End-to-end encryption for sensitive data',
        'Regular security audits and updates',
        'Secure data storage protocols',
        'Access control and authentication measures',
        'GDPR and privacy regulation compliance'
      ]
    },
    {
      id: 5,
      title: 'Your Rights',
      icon: '⚖️',
      color: '#9C27B0',
      items: [
        'Access your personal data',
        'Request data correction',
        'Delete your account and data',
        'Export your information',
        'Opt-out of non-essential communications'
      ]
    },
    {
      id: 6,
      title: 'Updates to Policy',
      icon: '📝',
      color: '#607D8B',
      content: 'We may update this Privacy Policy periodically. Significant changes will be communicated through the platform or via email. Continued use of the platform after changes constitutes acceptance of the updated policy.'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      {/* Main Content */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Introduction */}
        <View style={styles.introCard}>
          <View style={styles.introHeader}>
            <Text style={styles.introTitle}>Your Privacy Matters</Text>
            <Text style={styles.introIcon}>🔐</Text>
          </View>
          <Text style={styles.introText}>
            We are committed to protecting your personal information and ensuring 
            your data security. This policy explains how we collect, use, and 
            safeguard your information within our Learning Management System.
          </Text>
          
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>GDPR Compliant</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>End-to-End Encrypted</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Student-Focused</Text>
            </View>
          </View>
        </View>

        {/* Policy Sections */}
        {sections.map((section) => (
          <View key={section.id} style={styles.sectionCard}>
            {/* Section Header */}
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: `${section.color}15` }]}>
                <Text style={[styles.sectionIconText, { color: section.color }]}>
                  {section.icon}
                </Text>
              </View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>

            {/* Section Content */}
            {section.items && Array.isArray(section.items) ? (
              section.id === 1 ? (
                // Special layout for Information We Collect
                <View style={styles.infoGrid}>
                  {section.items.map((item, index) => (
                    <View key={index} style={styles.infoCard}>
                      <View style={[styles.infoIcon, { backgroundColor: `${section.color}20` }]}>
                        <Text style={[styles.infoIconText, { color: section.color }]}>
                          {index + 1}
                        </Text>
                      </View>
                      <Text style={styles.infoLabel}>{item.label}</Text>
                      <Text style={styles.infoText}>{item.text}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                // Regular list items
                <View style={styles.listContainer}>
                  {section.items.map((item, index) => (
                    <View key={index} style={styles.listItem}>
                      <View style={[styles.listBullet, { backgroundColor: section.color }]} />
                      <Text style={styles.listText}>{item}</Text>
                    </View>
                  ))}
                </View>
              )
            ) : (
              // Paragraph content
              <Text style={styles.paragraphText}>{section.content}</Text>
            )}

            {/* Decorative Line */}
            <View style={[styles.decorativeLine, { backgroundColor: `${section.color}30` }]} />
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 MACE App. All rights reserved.</Text>
          <Text style={styles.footerLink}>Terms of Service</Text>
          <Text style={styles.footerLink}>Cookie Policy</Text>
        </View>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonIcon: {
    fontSize: 24,
    color: '#333',
  },
  headerContent: {
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(179, 183, 43, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerIcon: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  introCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  introHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  introIcon: {
    fontSize: 28,
  },
  introText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    marginBottom: 20,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badge: {
    backgroundColor: 'rgba(179, 183, 43, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(179, 183, 43, 0.3)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#b3b72b',
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  sectionIconText: {
    fontSize: 22,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  infoCard: {
    flex: 1,
    minWidth: width > 400 ? (width - 88) / 2 : width - 88,
    backgroundColor: '#fafafa',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIconText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  listContainer: {
    paddingLeft: 10,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  listBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
    marginRight: 12,
  },
  listText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  paragraphText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    paddingLeft: 10,
  },
  decorativeLine: {
    height: 4,
    borderRadius: 2,
    marginTop: 20,
    width: '40%',
  },
  contactCard: {
    backgroundColor: 'rgba(179, 183, 43, 0.08)',
    borderRadius: 20,
    padding: 24,
    marginTop: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(179, 183, 43, 0.2)',
    alignItems: 'center',
  },
  contactIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(179, 183, 43, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactIcon: {
    fontSize: 28,
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
  },
  contactText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#b3b72b',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactButtonIcon: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
  },
  footerLink: {
    fontSize: 14,
    color: '#b3b72b',
    fontWeight: '500',
    marginBottom: 8,
  },
  floatingBackButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  floatingBackIcon: {
    fontSize: 24,
    color: '#333',
    fontWeight: 'bold',
  },
});

export default PrivacyPolicyScreen;