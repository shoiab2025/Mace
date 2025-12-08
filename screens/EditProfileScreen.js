import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../navigation/AuthContext';
import { getInstitutions, userUpdate } from '../API_STORE/user_api'; // Import the API function

// Education levels and college degrees
const educationLevels = ['High School', 'Undergraduate', 'Graduate', 'PhD'];
const collegeDegrees = [
  { value: 'bs', label: 'Bachelor of Science' },
  { value: 'ba', label: 'Bachelor of Arts' },
  { value: 'ms', label: 'Master of Science' },
  { value: 'ma', label: 'Master of Arts' },
  { value: 'phd', label: 'PhD' },
  { value: 'other', label: 'Other' },
];

const EditProfileScreen = ({ navigation, route }) => {
  // Get user data from props or route params
  const { authUser, setAuthUser } = useAuth() || {};
  const [userData, setUserData] = useState(authUser || {});
  const [showInstitutionModal, setShowInstitutionModal] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showDegreeModal, setShowDegreeModal] = useState(false);
  const [showExpertiseModal, setShowExpertiseModal] = useState(false);
  
  // Add states for institutions
  const [institutions, setInstitutions] = useState([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);

  // Initialize user data
  useEffect(() => {
    if (authUser) {
      setUserData(authUser);
    }
  }, [authUser]);

  // Fetch institutions on component mount
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        setLoadingInstitutions(true);
        const institutionsData = await getInstitutions();
        if (institutionsData) {
          setInstitutions(institutionsData);
        }
      } catch (error) {
        console.error('Error fetching institutions:', error);
        Alert.alert('Error', 'Failed to load institutions. Please try again.');
      } finally {
        setLoadingInstitutions(false);
      }
    };

    fetchInstitutions();
  }, []);

  console.log("the authuser", authUser);

  const isTeacher = userData.role === 'admin' || userData.role === 'teacher';
  const isStudent = userData.role === 'student';

  const handleSaveChanges = async () => {
    try {
      if (!authUser?._id) {
        Alert.alert('Error', 'User ID not found. Please try again.');
        return;
      }

      // Create a clean data object to send to the API
      const updateData = {
        username: userData.username?.trim() || '',
        phoneNumber: userData.phoneNumber?.toString() || '',
        institution: userData.institution || '',
        otherInstitution: userData.otherInstitution || '',
        educationLevel: userData.educationLevel || '',
        schoolClass: userData.schoolClass || '',
        experience: userData.experience || '',
        expertise: userData.expertise || '',
        collegeDegree: userData.collegeDegree || '',
        customCollegeDegree: userData.customCollegeDegree || '',
      };

      // Only include fields that have been changed (optional optimization)
      // You can compare with original authUser data if you want

      console.log('Updating user data:', updateData);
      
      // Call the API
      const response = await userUpdate(authUser._id, updateData);
      
      console.log('Update response:', response);
      
      if (response.success) {
        Alert.alert('Success', response.message || 'Profile updated successfully!');
        setAuthUser(response?.data?.user)
        setTimeout(() => {
          navigation.goBack();
        }, 1000); // Small delay to show success message
      }
      
    } catch (error) {
      console.error('Error Saving User Data:', error);
      
      let errorMessage = 'Failed to update profile. Please try again.';
      
      // Handle different error types
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.message || error.response.data?.error || errorMessage;
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  const updateField = (field, value) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Update getInstitutionName to handle different institution formats
  const getInstitutionName = (institutionId) => {
    if (!institutionId) return 'Select Institution';
    
    // Check if it's an "other" institution
    if (institutionId === 'other' && userData.otherInstitution) {
      return userData.otherInstitution;
    }
    
    // Check if it's an object or string
    if (typeof institutionId === 'object' && institutionId.name) {
      return institutionId.name;
    }
    
    // Check if it's a string ID
    if (typeof institutionId === 'string') {
      const institution = institutions.find(inst => 
        inst._id === institutionId || inst.id === institutionId
      );
      return institution ? institution.name : 'Custom Institution';
    }
    
    return 'Select Institution';
  };

  const getCollegeDegreeLabel = (value) => {
    const degree = collegeDegrees.find(d => d.value === value);
    return degree ? degree.label : 'Select Degree';
  };

  const renderInstitutionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => {
        if (item.name === 'Other') {
          updateField('institution', 'other');
          // Optionally show input for custom institution
        } else {
          updateField('institution', item._id || item.id);
        }
        setShowInstitutionModal(false);
      }}
    >
      <Text style={styles.modalItemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderEducationLevelItem = ({ item }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => {
        updateField('educationLevel', item);
        setShowEducationModal(false);
      }}
    >
      <Text style={styles.modalItemText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderDegreeItem = ({ item }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => {
        if (item.value === 'other') {
          updateField('collegeDegree', 'other');
          // Optionally show input for custom degree
        } else {
          updateField('collegeDegree', item.value);
        }
        setShowDegreeModal(false);
      }}
    >
      <Text style={styles.modalItemText}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Edit Profile</Text>
          <Text style={styles.subtitle}>
            Update your {isTeacher ? 'teacher' : 'student'} account details
          </Text>
          {isTeacher && (
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>Teacher Profile</Text>
            </View>
          )}
        </View>

        <View style={styles.form}>
          {/* Common Fields */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={userData.username}
              onChangeText={(value) => updateField('username', value)}
              placeholder="Enter username"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={userData.email}
              onChangeText={(value) => updateField('email', value)}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={false} // Email might not be editable
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={userData.phoneNumber ? userData.phoneNumber.toString() : ''}
              onChangeText={(value) => updateField('phoneNumber', value)}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
          </View>

          {/* Teacher Specific Fields */}
          {isTeacher && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Teacher Information</Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Experience (Years)</Text>
                <TextInput
                  style={styles.input}
                  value={userData.experience ? userData.experience.toString() : ''}
                  onChangeText={(value) => updateField('experience', parseInt(value) || 0)}
                  placeholder="Enter years of experience"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Expertise</Text>
                <TouchableOpacity
                  style={styles.selectInput}
                  onPress={() => setShowExpertiseModal(true)}
                >
                  <Text style={styles.selectText}>
                    {userData.expertise || 'Select Expertise'}
                  </Text>
                  <Text style={styles.dropdownIcon}>▼</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>College Degree</Text>
                <TouchableOpacity
                  style={styles.selectInput}
                  onPress={() => setShowDegreeModal(true)}
                >
                  <Text style={styles.selectText}>
                    {getCollegeDegreeLabel(userData.collegeDegree)}
                  </Text>
                  <Text style={styles.dropdownIcon}>▼</Text>
                </TouchableOpacity>
              </View>

              {userData.collegeDegree === 'other' && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Custom Degree</Text>
                  <TextInput
                    style={styles.input}
                    value={userData.customCollegeDegree || ''}
                    onChangeText={(value) => updateField('customCollegeDegree', value)}
                    placeholder="Enter your degree"
                  />
                </View>
              )}
            </>
          )}

          {/* Student Specific Fields */}
          {isStudent && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Student Information</Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Education Level</Text>
                <TouchableOpacity
                  style={styles.selectInput}
                  onPress={() => setShowEducationModal(true)}
                >
                  <Text style={styles.selectText}>
                    {userData.educationLevel || 'Select Education Level'}
                  </Text>
                  <Text style={styles.dropdownIcon}>▼</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>School/Class</Text>
                <TextInput
                  style={styles.input}
                  value={userData.schoolClass || ''}
                  onChangeText={(value) => updateField('schoolClass', value)}
                  placeholder="Enter your class (e.g., 10th Grade)"
                />
              </View>
            </>
          )}

          {/* Common Institution Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Institution</Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => setShowInstitutionModal(true)}
              disabled={loadingInstitutions}
            >
              {loadingInstitutions ? (
                <View style={styles.loadingContainerSmall}>
                  <ActivityIndicator size="small" color="#b3b72b" />
                  <Text style={[styles.selectText, styles.loadingText]}>
                    Loading institutions...
                  </Text>
                </View>
              ) : (
                <>
                  <Text style={styles.selectText}>
                    {getInstitutionName(userData.institution)}
                  </Text>
                  <Text style={styles.dropdownIcon}>▼</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Show "Other Institution" input if institution is 'other' */}
          {(userData.institution === 'other' || !userData.institution) && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                {userData.institution === 'other' ? 'Custom Institution' : 'Other Institution'}
              </Text>
              <TextInput
                style={styles.input}
                value={userData.otherInstitution || ''}
                onChangeText={(value) => updateField('otherInstitution', value)}
                placeholder="Enter institution name"
              />
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSaveChanges}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Institution Selection Modal */}
      <Modal
        visible={showInstitutionModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowInstitutionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Institution</Text>
            
            {loadingInstitutions ? (
              <View style={styles.modalLoadingContainer}>
                <ActivityIndicator size="large" color="#b3b72b" />
                <Text style={styles.modalLoadingText}>Loading institutions...</Text>
              </View>
            ) : (
              <FlatList
                data={[...institutions, { _id: 'other', name: 'Other' }]}
                renderItem={renderInstitutionItem}
                keyExtractor={(item) => item._id || item.id || 'other'}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No institutions available</Text>
                  </View>
                }
              />
            )}
            
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowInstitutionModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Education Level Modal */}
      <Modal
        visible={showEducationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEducationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Education Level</Text>
            <FlatList
              data={educationLevels}
              renderItem={renderEducationLevelItem}
              keyExtractor={(item) => item}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowEducationModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Degree Selection Modal */}
      <Modal
        visible={showDegreeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDegreeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select College Degree</Text>
            <FlatList
              data={collegeDegrees}
              renderItem={renderDegreeItem}
              keyExtractor={(item) => item.value}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowDegreeModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  roleBadge: {
    backgroundColor: '#b3b72b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  form: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  selectInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fafafa',
  },
  selectText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#b3b72b',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
  modalCloseButton: {
    padding: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#b3b72b',
    fontWeight: '600',
  },
  loadingContainerSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    color: '#666',
  },
  modalLoadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  modalLoadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default EditProfileScreen;