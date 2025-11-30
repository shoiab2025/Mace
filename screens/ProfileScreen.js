import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Linking,
  StatusBar,
  Share,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../navigation/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { authUser } = useAuth();

  // Handle case when user is not logged in
  if (!authUser) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#b3b72b" barStyle="light-content" />
        
        {/* Header */}
        <View style={styles.header} />

        <View style={styles.notLoggedInContainer}>
          <View style={styles.notLoggedInContent}>
            <Icon name="person-circle-outline" size={80} color="#b3b72b" />
            <Text style={styles.notLoggedInTitle}>Not Logged In</Text>
            <Text style={styles.notLoggedInMessage}>
              Please sign in to access your profile and settings
            </Text>
            
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginButtonText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.signupButton}
              onPress={() => navigation.navigate('SignUp')} // Adjust based on your navigation
            >
              <Text style={styles.signupButtonText}>Create Account</Text>
            </TouchableOpacity>
          </View>

          {/* App Version */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>MACE™ v2.8.0</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Original code for logged in user
  const userInfo = {
    name: authUser?.username,
    role: authUser?.role,
    phone: authUser?.phoneNumber,
    email: authUser?.email,
    joinDate: 'Joined Jan 2024',
    coursesCompleted: 12,
    testsTaken: 45
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handlePrivacyPolicy = () => {
    navigation.navigate('PrivacyPolicy');
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => navigation.navigate('Login')
        }
      ]
    );
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: 'Check out this amazing learning app - MAC™! Download it now.',
        url: 'https://your-app-link.com'
      });
    } catch (error) {
      console.log('Error sharing app:', error);
    }
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@macapp.com');
  };

  const handleRateApp = () => {
    Alert.alert('Rate App', 'Would you like to rate our app?', [
      { text: 'Later' },
      { text: 'Rate Now', onPress: () => Linking.openURL('your-app-store-link') }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#b3b72b" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userInfo.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity style={styles.editIcon} onPress={handleEditProfile}>
              <Icon name="camera-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userInfo.name}</Text>
            <Text style={styles.userRole}>{userInfo.role}</Text>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.contactList}>
            <View style={styles.contactItem}>
              <View style={styles.contactIcon}>
                <Icon name="call-outline" size={20} color="#b3b72b" />
              </View>
              <View style={styles.contactDetails}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>{userInfo.phone}</Text>
              </View>
            </View>

            <View style={styles.contactItem}>
              <View style={styles.contactIcon}>
                <Icon name="mail-outline" size={20} color="#b3b72b" />
              </View>
              <View style={styles.contactDetails}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>{userInfo.email}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.menuList}>
            <TouchableOpacity style={styles.menuItem} onPress={handleEditProfile}>
              <View style={styles.menuIcon}>
                <Icon name="person-outline" size={22} color="#b3b72b" />
              </View>
              <Text style={styles.menuText}>Edit Profile</Text>
              <Icon name="chevron-forward" size={18} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handlePrivacyPolicy}>
              <View style={styles.menuIcon}>
                <Icon name="shield-checkmark-outline" size={22} color="#b3b72b" />
              </View>
              <Text style={styles.menuText}>Privacy Policy</Text>
              <Icon name="chevron-forward" size={18} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleShareApp}>
              <View style={styles.menuIcon}>
                <Icon name="share-social-outline" size={22} color="#b3b72b" />
              </View>
              <Text style={styles.menuText}>Share App</Text>
              <Icon name="chevron-forward" size={18} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleContactSupport}>
              <View style={styles.menuIcon}>
                <Icon name="help-circle-outline" size={22} color="#b3b72b" />
              </View>
              <Text style={styles.menuText}>Contact Support</Text>
              <Icon name="chevron-forward" size={18} color="#ccc" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Icon name="log-out-outline" size={20} color="#dc3545" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>MACE™ v2.8.0</Text>
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
    backgroundColor: '#b3b72b',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    height: 150
  },
  // Not logged in styles
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -60,
  },
  notLoggedInContent: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    width: '90%',
  },
  notLoggedInTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  notLoggedInMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  loginButton: {
    backgroundColor: '#b3b72b',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signupButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#b3b72b',
    width: '100%',
    alignItems: 'center',
  },
  signupButtonText: {
    color: '#b3b72b',
    fontSize: 16,
    fontWeight: '600',
  },
  // Rest of your existing styles remain the same
  content: {
    flex: 1,
    marginTop: -60,
  },
  profileCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#b3b72b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  editIcon: {
    position: 'absolute',
    bottom: 5,
    right: '35%',
    backgroundColor: '#b3b72b',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: '#b3b72b',
    fontWeight: '500',
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
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
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 10,
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  contactList: {
    gap: 15,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fff8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#e8f5e8',
  },
  contactDetails: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  menuList: {
    gap: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderRadius: 8,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fff8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#e8f5e8',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffebee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  signOutText: {
    fontSize: 16,
    color: '#dc3545',
    fontWeight: '600',
    marginLeft: 8,
  },
  versionContainer: {
    alignItems: 'center',
    padding: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#999',
  },
});

export default ProfileScreen;