import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  Dimensions,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { getInstitutions, userSignUp } from '../API_STORE/user_api';

const { width, height } = Dimensions.get('window');

/* ---------------------------- ICON COMPONENTS ---------------------------- */

const PasswordIcon = ({ show, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.eyeButton}>
    <View style={styles.eyeIconContainer}>
      <Text style={styles.eyeIcon}>
        {show ? '👁️' : '👁️‍🗨️'}
      </Text>
    </View>
  </TouchableOpacity>
);

const ClearIcon = ({ onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.clearButton}>
    <View style={styles.clearIconContainer}>
      <Text style={styles.clearIcon}>×</Text>
    </View>
  </TouchableOpacity>
);

/* --------------------------- REGISTRATION SCREEN --------------------------- */

const RegisterScreen = ({ navigation }) => {
  /* ---------------------------- STATE ---------------------------- */
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    role: 'student',
    isAdmin: false,
    institution: '',
    otherInstitution: '',
    educationLevel: '',
    schoolClass: '',
    collegeDegree: '',
    customCollegeDegree: '',
    experience: '',
    expertise: '',
    profilePicture: '',
    preferences: {},
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showDegreeModal, setShowDegreeModal] = useState(false);
  const [showInstitutionModal, setShowInstitutionModal] = useState(false);
  const [institutions, setInstitutions] = useState([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);
  const [formErrors, setFormErrors] = useState({});
  
  /* --------------------- ANIMATION REFERENCES --------------------- */
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const formSlide = useRef(new Animated.Value(30)).current;
  const backgroundMove = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;

  const particle1Anim = useRef(new Animated.Value(0)).current;
  const particle2Anim = useRef(new Animated.Value(0)).current;
  const particle3Anim = useRef(new Animated.Value(0)).current;

  const buttonGlowAnim = useRef(new Animated.Value(0)).current;
  const roleCardAnim = useRef(new Animated.Value(0)).current;

  /* ----------------------- MOUNT ANIMATION ------------------------ */
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(formSlide, {
        toValue: 0,
        duration: 900,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(backgroundMove, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(logoRotate, {
        toValue: 1,
        duration: 1500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(500),
        Animated.timing(particle1Anim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(700),
        Animated.timing(particle2Anim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(900),
        Animated.timing(particle3Anim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(roleCardAnim, {
        toValue: 1,
        duration: 800,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const hasRequiredFields = formData.username && formData.email && formData.password && 
                             formData.confirmPassword && formData.phoneNumber && formData.institution;
    if (!isLoading && hasRequiredFields) {
      Animated.timing(buttonGlowAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(buttonGlowAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isLoading, formData, buttonGlowAnim]);

  /* ---------------------------- ACTIONS ---------------------------- */
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

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
        showAlert('Error', 'Failed to load institutions. Please try again.');
      } finally {
        setLoadingInstitutions(false);
      }
    };

    fetchInstitutions();
  }, []);

  const handleRoleSelect = (role) => {
    const isAdmin = role === 'admin'; // You can adjust this logic based on your needs
    handleInputChange('role', role);
    handleInputChange('isAdmin', isAdmin);
    setShowRoleModal(false);
    
    Animated.sequence([
      Animated.timing(roleCardAnim, { toValue: 0.8, duration: 100, useNativeDriver: true }),
      Animated.timing(roleCardAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const handleInstitutionSelect = (institution) => {
    if (institution.name === 'Other') {
      handleInputChange('institution', 'other');
      handleInputChange('otherInstitution', '');
    } else {
      handleInputChange('institution', institution._id || institution.name);
      handleInputChange('otherInstitution', '');
    }
    setShowInstitutionModal(false);
  };

  const validateForm = () => {
    const errors = {};

    // Required fields validation
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    }

    if (!formData.institution) {
      errors.institution = 'Institution is required';
    }

    if (formData.institution === 'other' && !formData.otherInstitution.trim()) {
      errors.otherInstitution = 'Please specify your institution';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Teacher-specific validation
    if (formData.role === 'teacher') {
      if (formData.experience && isNaN(formData.experience)) {
        errors.experience = 'Experience must be a number';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const prepareFormDataForBackend = () => {
    const backendData = {
      username: formData.username.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      phoneNumber: formData.phoneNumber.trim(),
      role: formData.role,
      isAdmin: formData.isAdmin,
      institution: formData.institution === 'other' ? formData.otherInstitution.trim() : formData.institution,
      educationLevel: formData.educationLevel || '',
      schoolClass: formData.schoolClass || '',
      collegeDegree: formData.collegeDegree || '',
      customCollegeDegree: formData.customCollegeDegree || '',
      experience: formData.experience || '',
      expertise: formData.expertise || '',
      profilePicture: formData.profilePicture || '',
      preferences: formData.preferences || {},
    };

    return backendData;
  };

  const showAlert = (title, message, onPress = null) => {
    Alert.alert(
      title,
      message,
      [
        {
          text: 'OK',
          onPress: onPress || (() => {}),
          style: 'default'
        }
      ],
      { cancelable: false }
    );
  };

  const showSuccessAlert = () => {
    Alert.alert(
      '🎉 Registration Successful!',
      `Welcome ${formData.username}! Your ${formData.role} account has been created successfully.`,
      [
        {
          text: 'Get Started',
          onPress: () => navigation.navigate('Login'),
          style: 'default'
        }
      ],
      { cancelable: false }
    );
  };

  const handleRegister = async () => {
    // Validate form
    if (!validateForm()) {
      showAlert('Validation Error', 'Please fix the errors in the form before submitting.');
      return;
    }

    setIsLoading(true);

    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    try {
      // Prepare data for backend
      const registerData = prepareFormDataForBackend();
      
      console.log('Sending registration data:', registerData);
      
      // Make API call with properly formatted data
      const registerResponse = await userSignUp(registerData);
      
      console.log('Registration response:', registerResponse);
      
      if (registerResponse && registerResponse.message === 'User created successfully') {
        setIsLoading(false);
        showSuccessAlert();
      } else {
        // Handle unexpected response
        setIsLoading(false);
        showAlert(
          'Registration Completed',
          'Your account has been created successfully. You can now log in.',
          () => navigation.navigate('Login')
        );
      }
    } catch (error) {
      // Error handling
      setIsLoading(false);
      console.error('Registration error:', error);
      
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        const serverError = error.response.data;
        errorMessage = serverError?.message || serverError?.error || 'Registration failed';
        
        // Handle specific error cases
        if (error.response.status === 400) {
          if (errorMessage.includes('User already exists')) {
            errorMessage = 'An account with this username or email already exists.';
          } else if (errorMessage.includes('Passwords do not match')) {
            errorMessage = 'Passwords do not match. Please check and try again.';
          } else if (errorMessage.includes('Invalid email format')) {
            errorMessage = 'Please enter a valid email address.';
          }
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }
      
      showAlert('Registration Failed', errorMessage);
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = () => {
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => {
      navigation.navigate('Login');
    });
  };

  /* ------------------------ ANIMATION VALUES ------------------------ */
  const backgroundInterpolate = backgroundMove.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const logoRotation = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-10deg', '0deg'],
  });

  const particle1TranslateY = particle1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const particle2TranslateY = particle2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const particle3TranslateY = particle3Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -25],
  });

  const buttonGlowOpacity = buttonGlowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.4],
  });

  const roleCardScale = roleCardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  /* ---------------------------- MODAL COMPONENTS ---------------------------- */
  const RoleModal = () => (
    <Modal
      visible={showRoleModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowRoleModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Choose Your Role</Text>
          <Text style={styles.modalSubtitle}>Select how you'll use MACE App</Text>
          
          {[
            { 
              role: 'student', 
              icon: '🎓', 
              title: 'Student', 
              description: 'Learn from courses, join classes, and track your progress' 
            },
            { 
              role: 'teacher', 
              icon: '👨‍🏫', 
              title: 'Teacher', 
              description: 'Create courses, manage students, and share knowledge' 
            }
          ].map(({ role, icon, title, description }) => (
            <TouchableOpacity
              key={role}
              style={[
                styles.roleOption,
                formData.role === role && styles.roleOptionSelected
              ]}
              onPress={() => handleRoleSelect(role)}
            >
              <View style={styles.roleIconContainer}>
                <Text style={styles.roleIcon}>{icon}</Text>
              </View>
              <View style={styles.roleTextContainer}>
                <Text style={[
                  styles.roleOptionTitle,
                  formData.role === role && styles.roleOptionTitleSelected
                ]}>
                  {title}
                </Text>
                <Text style={styles.roleOptionDescription}>{description}</Text>
              </View>
              {formData.role === role && (
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity
            style={styles.modalClose}
            onPress={() => setShowRoleModal(false)}
          >
            <Text style={styles.modalCloseText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const EducationModal = () => (
    <Modal
      visible={showEducationModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowEducationModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Education Level</Text>
          {[
            { level: 'High School', icon: '🏫' },
            { level: 'Undergraduate', icon: '🎓' },
            { level: 'Graduate', icon: '📚' },
            { level: 'Postgraduate', icon: '👨‍🎓' },
            { level: 'Other', icon: '📖' }
          ].map(({ level, icon }) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.modalOption,
                formData.educationLevel === level && styles.modalOptionSelected
              ]}
              onPress={() => {
                handleInputChange('educationLevel', level);
                setShowEducationModal(false);
              }}
            >
              <Text style={styles.modalOptionIcon}>{icon}</Text>
              <Text style={[
                styles.modalOptionText,
                formData.educationLevel === level && styles.modalOptionTextSelected
              ]}>
                {level}
              </Text>
              {formData.educationLevel === level && (
                <Text style={styles.selectedIndicator}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.modalClose}
            onPress={() => setShowEducationModal(false)}
          >
            <Text style={styles.modalCloseText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const InstitutionModal = () => (
    <Modal
      visible={showInstitutionModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowInstitutionModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, styles.institutionModalContent]}>
          <Text style={styles.modalTitle}>Select Institution</Text>
          <Text style={styles.modalSubtitle}>Choose your educational institution</Text>
          
          {loadingInstitutions ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#b3b72b" />
              <Text style={styles.loadingText}>Loading institutions...</Text>
            </View>
          ) : (
            <FlatList
              data={[...institutions, { _id: 'other', name: 'Other' }]}
              keyExtractor={(item) => item._id || item.id || Math.random().toString()}
              showsVerticalScrollIndicator={false}
              style={styles.institutionList}
              contentContainerStyle={styles.institutionListContent}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalOption,
                    formData.institution === (item._id || item.name) && styles.modalOptionSelected
                  ]}
                  onPress={() => handleInstitutionSelect(item)}
                >
                  <Text style={styles.modalOptionIcon}>🏫</Text>
                  <Text style={[
                    styles.modalOptionText,
                    formData.institution === (item._id || item.name) && styles.modalOptionTextSelected
                  ]}>
                    {item.name}
                  </Text>
                  {formData.institution === (item._id || item.name) && (
                    <Text style={styles.selectedIndicator}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No institutions available</Text>
                </View>
              }
            />
          )}
          
          <TouchableOpacity
            style={styles.modalClose}
            onPress={() => setShowInstitutionModal(false)}
          >
            <Text style={styles.modalCloseText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  /* ---------------------------- UI ---------------------------- */
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* BACKGROUND DESIGN */}
          <View style={styles.background}>
            <Animated.View style={[
              styles.animatedCircle,
              styles.circle1,
              { transform: [{ rotate: backgroundInterpolate }] }
            ]} />
            <Animated.View style={[
              styles.animatedCircle,
              styles.circle2,
              { transform: [{ rotate: backgroundInterpolate }] }
            ]} />

            <Animated.View style={[
              styles.particle, styles.particle1,
              { opacity: particle1Anim, transform: [{ translateY: particle1TranslateY }] }
            ]} />
            <Animated.View style={[
              styles.particle, styles.particle2,
              { opacity: particle2Anim, transform: [{ translateY: particle2TranslateY }] }
            ]} />
            <Animated.View style={[
              styles.particle, styles.particle3,
              { opacity: particle3Anim, transform: [{ translateY: particle3TranslateY }] }
            ]} />
          </View>

          {/* CONTENT */}
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { translateY: formSlide }
                ]
              }
            ]}
          >
            {/* HEADER */}
            <View style={styles.header}>
              <Animated.View style={[
                styles.logoContainer,
                {
                  transform: [
                    { scale: logoScale },
                    { rotate: logoRotation }
                  ]
                }
              ]}>
                <View style={styles.logo}>
                  <Text style={styles.logoIcon}>🎓</Text>
                </View>
              </Animated.View>
              
              <View style={styles.welcomeContainer}>
                <Text style={styles.welcome}>Join MACE App!</Text>
                <Text style={styles.subtitle}>
                  Start your {formData.role === 'teacher' ? 'teaching' : 'learning'} journey with personalized experiences
                </Text>
              </View>
            </View>

            {/* ROLE SELECTION CARD */}
            <Animated.View style={[
              styles.roleCard,
              { transform: [{ scale: roleCardScale }] }
            ]}>
              <View style={styles.roleCardHeader}>
                <Text style={styles.roleCardTitle}>I am a</Text>
                <View style={[
                  styles.roleBadge,
                  formData.role === 'teacher' ? styles.teacherBadge : styles.studentBadge
                ]}>
                  <Text style={styles.roleBadgeText}>
                    {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.roleSelector}
                onPress={() => setShowRoleModal(true)}
              >
                <View style={styles.roleSelectorContent}>
                  <View style={styles.roleIconContainer}>
                    <Text style={styles.roleSelectorIcon}>
                      {formData.role === 'teacher' ? '👨‍🏫' : '🎓'}
                    </Text>
                  </View>
                  <View style={styles.roleSelectorText}>
                    <Text style={styles.roleSelectorTitle}>
                      {formData.role === 'teacher' ? 'Teacher' : 'Student'}
                    </Text>
                    <Text style={styles.roleSelectorSubtitle}>
                      {formData.role === 'teacher' 
                        ? 'Create and manage courses' 
                        : 'Learn from expert instructors'
                      }
                    </Text>
                  </View>
                  <Text style={styles.roleSelectorArrow}>▼</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>

            {/* FORM CARD */}
            <View style={styles.formContainer}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>
                  {formData.role === 'teacher' ? 'Teacher Registration' : 'Student Registration'}
                </Text>
                <View style={styles.securityBadge}>
                  <Text style={styles.securityText}>🔒 Secure</Text>
                </View>
              </View>

              <View style={styles.form}>
                {/* BASIC INFORMATION */}
                <Text style={styles.sectionTitle}>Basic Information</Text>

                {/* USERNAME */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Username *</Text>
                  <View style={[
                    styles.inputWrapper,
                    focusedInput === 'username' && styles.inputFocused,
                    formData.username && styles.inputHasValue,
                    formErrors.username && styles.inputError
                  ]}>
                    <View style={styles.iconContainer}>
                      <Text style={styles.inputIcon}>👤</Text>
                    </View>
                    <View style={styles.inputContent}>
                      <TextInput
                        style={styles.input}
                        placeholder="Choose a username"
                        placeholderTextColor="#A0A0A0"
                        value={formData.username}
                        onChangeText={(value) => handleInputChange('username', value)}
                        autoCapitalize="none"
                        onFocus={() => setFocusedInput('username')}
                        onBlur={() => setFocusedInput(null)}
                      />
                      {formData.username.length > 0 && <ClearIcon onPress={() => handleInputChange('username', '')} />}
                    </View>
                  </View>
                  {formErrors.username && <Text style={styles.errorText}>{formErrors.username}</Text>}
                </View>

                {/* EMAIL */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email *</Text>
                  <View style={[
                    styles.inputWrapper,
                    focusedInput === 'email' && styles.inputFocused,
                    formData.email && styles.inputHasValue,
                    formErrors.email && styles.inputError
                  ]}>
                    <View style={styles.iconContainer}>
                      <Text style={styles.inputIcon}>📧</Text>
                    </View>
                    <View style={styles.inputContent}>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        placeholderTextColor="#A0A0A0"
                        value={formData.email}
                        onChangeText={(value) => handleInputChange('email', value)}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        onFocus={() => setFocusedInput('email')}
                        onBlur={() => setFocusedInput(null)}
                      />
                      {formData.email.length > 0 && <ClearIcon onPress={() => handleInputChange('email', '')} />}
                    </View>
                  </View>
                  {formErrors.email && <Text style={styles.errorText}>{formErrors.email}</Text>}
                </View>

                {/* PHONE NUMBER */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Phone Number *</Text>
                  <View style={[
                    styles.inputWrapper,
                    focusedInput === 'phoneNumber' && styles.inputFocused,
                    formData.phoneNumber && styles.inputHasValue,
                    formErrors.phoneNumber && styles.inputError
                  ]}>
                    <View style={styles.iconContainer}>
                      <Text style={styles.inputIcon}>📱</Text>
                    </View>
                    <View style={styles.inputContent}>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your phone number"
                        placeholderTextColor="#A0A0A0"
                        value={formData.phoneNumber}
                        onChangeText={(value) => handleInputChange('phoneNumber', value)}
                        keyboardType="phone-pad"
                        onFocus={() => setFocusedInput('phoneNumber')}
                        onBlur={() => setFocusedInput(null)}
                      />
                      {formData.phoneNumber.length > 0 && <ClearIcon onPress={() => handleInputChange('phoneNumber', '')} />}
                    </View>
                  </View>
                  {formErrors.phoneNumber && <Text style={styles.errorText}>{formErrors.phoneNumber}</Text>}
                </View>

                {/* INSTITUTION */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Institution *</Text>
                  <TouchableOpacity
                    style={[
                      styles.inputWrapper,
                      styles.selectInput,
                      focusedInput === 'institution' && styles.inputFocused,
                      formErrors.institution && styles.inputError
                    ]}
                    onPress={() => setShowInstitutionModal(true)}
                  >
                    <View style={styles.iconContainer}>
                      <Text style={styles.inputIcon}>🏫</Text>
                    </View>
                    <View style={styles.inputContent}>
                      <Text style={[
                        styles.selectText,
                        !formData.institution && styles.placeholderText
                      ]}>
                        {formData.institution === 'other' ? 'Other' : 
                         institutions.find(inst => inst._id === formData.institution)?.name || 
                         'Select your institution'}
                      </Text>
                      <Text style={styles.selectArrow}>▼</Text>
                    </View>
                  </TouchableOpacity>
                  {formErrors.institution && <Text style={styles.errorText}>{formErrors.institution}</Text>}
                  
                  {/* Other Institution Input */}
                  {formData.institution === 'other' && (
                    <View style={[styles.inputWrapper, { marginTop: 8 }, formErrors.otherInstitution && styles.inputError]}>
                      <View style={styles.iconContainer}>
                        <Text style={styles.inputIcon}>✏️</Text>
                      </View>
                      <View style={styles.inputContent}>
                        <TextInput
                          style={styles.input}
                          placeholder="Specify your institution"
                          placeholderTextColor="#A0A0A0"
                          value={formData.otherInstitution}
                          onChangeText={(value) => handleInputChange('otherInstitution', value)}
                          onFocus={() => setFocusedInput('otherInstitution')}
                          onBlur={() => setFocusedInput(null)}
                        />
                      </View>
                    </View>
                  )}
                  {formErrors.otherInstitution && <Text style={styles.errorText}>{formErrors.otherInstitution}</Text>}
                </View>

                {/* PASSWORD */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Password *</Text>
                  <View style={[
                    styles.inputWrapper,
                    focusedInput === 'password' && styles.inputFocused,
                    formData.password && styles.inputHasValue,
                    formErrors.password && styles.inputError
                  ]}>
                    <View style={styles.iconContainer}>
                      <Text style={styles.inputIcon}>🔐</Text>
                    </View>
                    <View style={styles.inputContent}>
                      <TextInput
                        style={styles.passwordInput}
                        placeholder="Create a password"
                        placeholderTextColor="#A0A0A0"
                        value={formData.password}
                        onChangeText={(value) => handleInputChange('password', value)}
                        secureTextEntry={!showPassword}
                        onFocus={() => setFocusedInput('password')}
                        onBlur={() => setFocusedInput(null)}
                      />
                      <View style={styles.passwordActions}>
                        {formData.password.length > 0 && (
                          <ClearIcon onPress={() => handleInputChange('password', '')} />
                        )}
                        <PasswordIcon
                          show={showPassword}
                          onPress={() => setShowPassword(!showPassword)}
                        />
                      </View>
                    </View>
                  </View>
                  {formErrors.password ? (
                    <Text style={styles.errorText}>{formErrors.password}</Text>
                  ) : (
                    <Text style={styles.passwordHint}>
                      Must be at least 6 characters long
                    </Text>
                  )}
                </View>

                {/* CONFIRM PASSWORD */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Confirm Password *</Text>
                  <View style={[
                    styles.inputWrapper,
                    focusedInput === 'confirmPassword' && styles.inputFocused,
                    formData.confirmPassword && styles.inputHasValue,
                    formErrors.confirmPassword && styles.inputError
                  ]}>
                    <View style={styles.iconContainer}>
                      <Text style={styles.inputIcon}>🔒</Text>
                    </View>
                    <View style={styles.inputContent}>
                      <TextInput
                        style={styles.passwordInput}
                        placeholder="Confirm your password"
                        placeholderTextColor="#A0A0A0"
                        value={formData.confirmPassword}
                        onChangeText={(value) => handleInputChange('confirmPassword', value)}
                        secureTextEntry={!showConfirmPassword}
                        onFocus={() => setFocusedInput('confirmPassword')}
                        onBlur={() => setFocusedInput(null)}
                      />
                      <View style={styles.passwordActions}>
                        {formData.confirmPassword.length > 0 && (
                          <ClearIcon onPress={() => handleInputChange('confirmPassword', '')} />
                        )}
                        <PasswordIcon
                          show={showConfirmPassword}
                          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        />
                      </View>
                    </View>
                  </View>
                  {formErrors.confirmPassword && <Text style={styles.errorText}>{formErrors.confirmPassword}</Text>}
                </View>

                {/* TEACHER-SPECIFIC FIELDS */}
                {formData.role === 'teacher' && (
                  <>
                    <Text style={styles.sectionTitle}>Teaching Information</Text>
                    
                    {/* EXPERIENCE */}
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Years of Experience</Text>
                      <View style={[
                        styles.inputWrapper,
                        focusedInput === 'experience' && styles.inputFocused,
                        formData.experience && styles.inputHasValue,
                        formErrors.experience && styles.inputError
                      ]}>
                        <View style={styles.iconContainer}>
                          <Text style={styles.inputIcon}>📊</Text>
                        </View>
                        <View style={styles.inputContent}>
                          <TextInput
                            style={styles.input}
                            placeholder="Years of teaching experience"
                            placeholderTextColor="#A0A0A0"
                            value={formData.experience}
                            onChangeText={(value) => handleInputChange('experience', value)}
                            keyboardType="numeric"
                            onFocus={() => setFocusedInput('experience')}
                            onBlur={() => setFocusedInput(null)}
                          />
                        </View>
                      </View>
                      {formErrors.experience && <Text style={styles.errorText}>{formErrors.experience}</Text>}
                    </View>

                    {/* EXPERTISE */}
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Area of Expertise</Text>
                      <View style={[
                        styles.inputWrapper,
                        focusedInput === 'expertise' && styles.inputFocused,
                        formData.expertise && styles.inputHasValue
                      ]}>
                        <View style={styles.iconContainer}>
                          <Text style={styles.inputIcon}>🎯</Text>
                        </View>
                        <View style={styles.inputContent}>
                          <TextInput
                            style={styles.input}
                            placeholder="Your teaching expertise/subjects"
                            placeholderTextColor="#A0A0A0"
                            value={formData.expertise}
                            onChangeText={(value) => handleInputChange('expertise', value)}
                            onFocus={() => setFocusedInput('expertise')}
                            onBlur={() => setFocusedInput(null)}
                          />
                        </View>
                      </View>
                    </View>
                  </>
                )}

                {/* STUDENT-SPECIFIC FIELDS */}
                {formData.role === 'student' && (
                  <>
                    <Text style={styles.sectionTitle}>Education Information</Text>
                    
                    {/* EDUCATION LEVEL */}
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Education Level</Text>
                      <TouchableOpacity
                        style={[
                          styles.inputWrapper,
                          styles.selectInput,
                          focusedInput === 'educationLevel' && styles.inputFocused,
                        ]}
                        onPress={() => setShowEducationModal(true)}
                      >
                        <View style={styles.iconContainer}>
                          <Text style={styles.inputIcon}>🎓</Text>
                        </View>
                        <View style={styles.inputContent}>
                          <Text style={[
                            styles.selectText,
                            !formData.educationLevel && styles.placeholderText
                          ]}>
                            {formData.educationLevel || 'Select education level'}
                          </Text>
                          <Text style={styles.selectArrow}>▼</Text>
                        </View>
                      </TouchableOpacity>
                    </View>

                    {/* SCHOOL CLASS (if high school) */}
                    {formData.educationLevel === 'High School' && (
                      <View style={styles.inputContainer}>
                        <Text style={styles.label}>Class/Grade</Text>
                        <View style={[
                          styles.inputWrapper,
                          focusedInput === 'schoolClass' && styles.inputFocused,
                          formData.schoolClass && styles.inputHasValue
                        ]}>
                          <View style={styles.iconContainer}>
                            <Text style={styles.inputIcon}>🏫</Text>
                          </View>
                          <View style={styles.inputContent}>
                            <TextInput
                              style={styles.input}
                              placeholder="e.g., 10th Grade, 12th Grade"
                              placeholderTextColor="#A0A0A0"
                              value={formData.schoolClass}
                              onChangeText={(value) => handleInputChange('schoolClass', value)}
                              onFocus={() => setFocusedInput('schoolClass')}
                              onBlur={() => setFocusedInput(null)}
                            />
                          </View>
                        </View>
                      </View>
                    )}
                  </>
                )}

                {/* REGISTER BUTTON */}
                <Animated.View style={[
                  styles.registerButtonContainer,
                  { transform: [{ scale: buttonScale }] }
                ]}>
                  <TouchableOpacity
                    style={[
                      styles.registerButton,
                      isLoading && styles.registerButtonLoading
                    ]}
                    disabled={isLoading}
                    onPress={handleRegister}
                    onPressIn={animateButton}
                  >
                    {isLoading ? (
                      <View style={styles.loadingContent}>
                        <ActivityIndicator size="small" color="#fff" />
                        <Text style={styles.registerButtonText}>Creating Account...</Text>
                      </View>
                    ) : (
                      <View style={styles.buttonContent}>
                        <Text style={styles.registerButtonText}>
                          Join as {formData.role === 'teacher' ? 'Teacher' : 'Student'}
                        </Text>
                        <Text style={styles.buttonArrow}>→</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  <Animated.View style={[
                    styles.buttonGlow,
                    { opacity: buttonGlowOpacity }
                  ]} />
                </Animated.View>

                {/* DIVIDER */}
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>Already have an account?</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* LOGIN LINK */}
                <View style={styles.loginContainer}>
                  <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
                    <Text style={styles.loginButtonText}>Sign In to Your Account</Text>
                    <Text style={styles.loginArrow}>↗</Text>
                  </TouchableOpacity>
                </View>

              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Protected by advanced encryption •{' '}
                <Text style={styles.footerLink}>Privacy</Text> •{' '}
                <Text style={styles.footerLink}>Terms</Text>
              </Text>
            </View>

          </Animated.View>
        </ScrollView>

        {/* MODALS */}
        <RoleModal />
        <EducationModal />
        <InstitutionModal />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

/* ---------------------------- STYLES ---------------------------- */

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#b3b72b' 
  },
  keyboardView: { 
    flex: 1 
  },
  scrollContent: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    minHeight: height 
  },
  background: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: '#b3b72b',
    overflow: 'hidden'
  },

  animatedCircle: {
    position: 'absolute',
    borderRadius: 500,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  circle1: {
    top: -300, 
    right: -150, 
    width: 500, 
    height: 500,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  circle2: {
    bottom: -200, 
    left: -100, 
    width: 400, 
    height: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },

  particle: {
    position: 'absolute', 
    width: 10, 
    height: 10, 
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  particle1: { top: '20%', left: '15%' },
  particle2: { top: '60%', right: '20%' },
  particle3: { bottom: '30%', left: '25%' },

  content: { 
    flex: 1, 
    padding: 24 
  },
  header: { 
    alignItems: 'center', 
    marginBottom: 20 
  },

  logoContainer: {
    marginBottom: 15,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  logoIcon: {
    fontSize: 36,
  },

  welcomeContainer: { 
    alignItems: 'center', 
    marginBottom: 10 
  },
  welcome: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    color: 'rgba(26, 26, 26, 0.8)',
    maxWidth: '90%',
    lineHeight: 22,
  },

  /* ROLE CARD */
  roleCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  roleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  roleCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  studentBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
  },
  teacherBadge: {
    backgroundColor: 'rgba(156, 39, 176, 0.15)',
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  roleSelector: {
    backgroundColor: 'rgba(179, 183, 43, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(179, 183, 43, 0.2)',
  },
  roleSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(179, 183, 43, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roleSelectorIcon: {
    fontSize: 24,
  },
  roleSelectorText: {
    flex: 1,
  },
  roleSelectorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  roleSelectorSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  roleSelectorArrow: {
    fontSize: 16,
    color: '#666',
  },

  /* FORM CARD */
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  formHeader: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center', 
    paddingBottom: 20,
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
    marginBottom: 20,
  },
  formTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#1A1A1A' 
  },

  securityBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.12)',
    paddingVertical: 6, 
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  securityText: { 
    color: '#4CAF50', 
    fontWeight: '700', 
    fontSize: 13 
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 10,
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },

  inputContainer: { 
    marginBottom: 16 
  },
  label: { 
    fontSize: 15, 
    color: '#333', 
    fontWeight: '600',
    marginBottom: 8,
  },

  inputWrapper: {
    flexDirection: 'row', 
    alignItems: 'center',
    borderWidth: 2, 
    borderColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 18, 
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 0,
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  inputFocused: {
    borderColor: '#b3b72b', 
    backgroundColor: '#fff',
    shadowColor: '#b3b72b', 
    shadowOpacity: 0.3,
    shadowRadius: 15, 
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  inputHasValue: { 
    borderColor: 'rgba(179, 183, 43, 0.3)' 
  },
  inputError: {
    borderColor: '#ff4444',
    backgroundColor: '#fffafa',
  },

  iconContainer: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(179, 183, 43, 0.1)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(0, 0, 0, 0.05)',
  },
  inputIcon: {
    fontSize: 20,
  },
  inputContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  selectInput: {
    justifyContent: 'space-between',
  },
  selectText: {
    fontSize: 16,
    color: '#1A1A1A',
    flex: 1,
  },
  placeholderText: {
    color: '#A0A0A0',
  },
  selectArrow: {
    fontSize: 14,
    color: '#666',
  },

  input: { 
    flex: 1, 
    fontSize: 16, 
    color: '#1A1A1A',
    paddingVertical: 8,
  },
  passwordInput: { 
    flex: 1, 
    fontSize: 16, 
    color: '#1A1A1A',
    paddingVertical: 8,
  },

  passwordHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginLeft: 8,
  },

  errorText: {
    fontSize: 12,
    color: '#ff4444',
    marginTop: 4,
    marginLeft: 8,
    fontWeight: '500',
  },

  passwordActions: { 
    flexDirection: 'row', 
    gap: 8 
  },
  eyeButton: { 
    padding: 6 
  },
  eyeIconContainer: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeIcon: { 
    fontSize: 18 
  },
  clearButton: { 
    padding: 6 
  },
  clearIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    borderRadius: 12,
  },
  clearIcon: { 
    fontSize: 14, 
    color: '#666', 
    fontWeight: 'bold' 
  },

  registerButtonContainer: { 
    marginVertical: 20, 
    position: 'relative' 
  },
  registerButton: {
    backgroundColor: '#b3b72b',
    borderRadius: 18, 
    padding: 20,
    alignItems: 'center',
    shadowColor: '#b3b72b',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5, 
    shadowRadius: 20,
    elevation: 15, 
    zIndex: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  registerButtonLoading: {
    opacity: 0.8,
  },

  loadingContent: { 
    flexDirection: 'row', 
    alignItems: 'center',
    gap: 12 
  },
  buttonContent: { 
    flexDirection: 'row', 
    alignItems: 'center',
    gap: 12 
  },

  registerButtonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  buttonArrow: { 
    color: '#fff', 
    fontSize: 20, 
    fontWeight: 'bold' 
  },

  buttonGlow: {
    position: 'absolute',
    top: 8, 
    left: '10%', 
    right: '10%',
    height: '100%',
    borderRadius: 18,
    backgroundColor: 'rgba(179, 183, 43, 0.4)',
    zIndex: 1,
    shadowColor: '#b3b72b',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },

  loginContainer: { 
    alignItems: 'center',
    marginTop: 10 
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(179, 183, 43, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(179, 183, 43, 0.2)',
  },
  loginButtonText: {
    color: '#b3b72b',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  loginArrow: {
    color: '#b3b72b',
    fontSize: 16,
    fontWeight: 'bold',
  },

  footer: { 
    marginTop: 20 
  },
  footerText: { 
    color: 'rgba(26, 26, 26, 0.7)', 
    fontSize: 13, 
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: { 
    color: '#b3b72b',
    fontWeight: '600',
  },

  /* MODAL STYLES */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  institutionModalContent: {
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },

  /* Institution List Styles */
  institutionList: {
    maxHeight: 300,
  },
  institutionListContent: {
    paddingVertical: 8,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
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

  /* Role Modal Styles */
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: '#FAFAFA',
  },
  roleOptionSelected: {
    backgroundColor: 'rgba(179, 183, 43, 0.1)',
    borderColor: '#b3b72b',
  },
  roleIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(179, 183, 43, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  roleIcon: {
    fontSize: 20,
  },
  roleTextContainer: {
    flex: 1,
  },
  roleOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  roleOptionTitleSelected: {
    color: '#b3b72b',
  },
  roleOptionDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  selectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#b3b72b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },

  /* Education/Institution Modal Styles */
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalOptionSelected: {
    backgroundColor: 'rgba(179, 183, 43, 0.1)',
    borderColor: '#b3b72b',
  },
  modalOptionIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  modalOptionTextSelected: {
    color: '#b3b72b',
    fontWeight: '600',
  },
  selectedIndicator: {
    color: '#b3b72b',
    fontSize: 16,
    fontWeight: 'bold',
  },

  modalClose: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default RegisterScreen;