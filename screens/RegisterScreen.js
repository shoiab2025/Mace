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
} from 'react-native';

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
    institution: '',
    otherInstitution: '',
    educationLevel: '',
    schoolClass: '',
    collegeDegree: '',
    customCollegeDegree: '',
    experience: '',
    expertise: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showDegreeModal, setShowDegreeModal] = useState(false);

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
    ]).start();
  }, []);

  useEffect(() => {
    const hasRequiredFields = formData.username && formData.email && formData.password && 
                             formData.confirmPassword && formData.phoneNumber;
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
  };

  const handleRegister = () => {
    // Basic validation
    if (!formData.username || !formData.email || !formData.password || !formData.phoneNumber) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Registration Successful',
        `Welcome ${formData.username}! Your account has been created as a ${formData.role}.`,
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    }, 2000);
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = () => navigation.navigate('Login');

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

  /* ---------------------------- MODAL COMPONENTS ---------------------------- */
  const RoleModal = () => (
    <Modal
      visible={showRoleModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowRoleModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Your Role</Text>
          {['student', 'teacher'].map(role => (
            <TouchableOpacity
              key={role}
              style={[
                styles.modalOption,
                formData.role === role && styles.modalOptionSelected
              ]}
              onPress={() => {
                handleInputChange('role', role);
                setShowRoleModal(false);
              }}
            >
              <Text style={[
                styles.modalOptionText,
                formData.role === role && styles.modalOptionTextSelected
              ]}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </Text>
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
          {['High School', 'Undergraduate', 'Graduate', 'Postgraduate', 'Other'].map(level => (
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
              <Text style={[
                styles.modalOptionText,
                formData.educationLevel === level && styles.modalOptionTextSelected
              ]}>
                {level}
              </Text>
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

  /* ---------------------------- UI ---------------------------- */
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
                  Start your learning journey with personalized courses and expert guidance
                </Text>
              </View>
            </View>

            {/* FORM CARD */}
            <View style={styles.formContainer}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>Create Account</Text>
                <View style={styles.securityBadge}>
                  <Text style={styles.securityText}>🔒 Secure</Text>
                </View>
              </View>

              <View style={styles.form}>
                {/* ROLE SELECTION */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>I am a</Text>
                  <TouchableOpacity
                    style={[
                      styles.inputWrapper,
                      styles.selectInput,
                      focusedInput === 'role' && styles.inputFocused,
                    ]}
                    onPress={() => setShowRoleModal(true)}
                  >
                    <View style={styles.iconContainer}>
                      <Text style={styles.inputIcon}>👤</Text>
                    </View>
                    <View style={styles.inputContent}>
                      <Text style={[
                        styles.selectText,
                        !formData.role && styles.placeholderText
                      ]}>
                        {formData.role ? formData.role.charAt(0).toUpperCase() + formData.role.slice(1) : 'Select your role'}
                      </Text>
                      <Text style={styles.selectArrow}>▼</Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* BASIC INFORMATION */}
                <Text style={styles.sectionTitle}>Basic Information</Text>

                {/* USERNAME */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Username *</Text>
                  <View style={[
                    styles.inputWrapper,
                    focusedInput === 'username' && styles.inputFocused,
                    formData.username && styles.inputHasValue
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
                </View>

                {/* EMAIL */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email *</Text>
                  <View style={[
                    styles.inputWrapper,
                    focusedInput === 'email' && styles.inputFocused,
                    formData.email && styles.inputHasValue
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
                </View>

                {/* PHONE NUMBER */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Phone Number *</Text>
                  <View style={[
                    styles.inputWrapper,
                    focusedInput === 'phoneNumber' && styles.inputFocused,
                    formData.phoneNumber && styles.inputHasValue
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
                </View>

                {/* PASSWORD */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Password *</Text>
                  <View style={[
                    styles.inputWrapper,
                    focusedInput === 'password' && styles.inputFocused,
                    formData.password && styles.inputHasValue
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
                </View>

                {/* CONFIRM PASSWORD */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Confirm Password *</Text>
                  <View style={[
                    styles.inputWrapper,
                    focusedInput === 'confirmPassword' && styles.inputFocused,
                    formData.confirmPassword && styles.inputHasValue
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
                </View>

                {/* TEACHER-SPECIFIC FIELDS */}
                {(formData.role === 'teacher' || formData.role === 'instructor') && (
                  <>
                    <Text style={styles.sectionTitle}>Teaching Information</Text>
                    
                    {/* EXPERIENCE */}
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Years of Experience</Text>
                      <View style={[
                        styles.inputWrapper,
                        focusedInput === 'experience' && styles.inputFocused,
                        formData.experience && styles.inputHasValue
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
                            placeholder="Your teaching expertise"
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
                      (!formData.username || !formData.email || !formData.password || 
                       !formData.confirmPassword || !formData.phoneNumber) && styles.registerButtonDisabled
                    ]}
                    disabled={!formData.username || !formData.email || !formData.password || 
                             !formData.confirmPassword || !formData.phoneNumber || isLoading}
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
                        <Text style={styles.registerButtonText}>Create My Account</Text>
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
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* LOGIN LINK */}
                <View style={styles.loginContainer}>
                  <Text style={styles.loginText}>Already have an account? </Text>
                  <TouchableOpacity onPress={handleLogin}>
                    <View style={styles.loginLinkContainer}>
                      <Text style={styles.loginLink}>Sign In</Text>
                      <Text style={styles.loginArrow}>↗</Text>
                    </View>
                  </TouchableOpacity>
                </View>

              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Protected by advanced encryption •{' '}
                <Text style={styles.footerLink} onPress={() => Alert.alert('Privacy', 'Privacy policy')}>Privacy</Text> •{' '}
                <Text style={styles.footerLink} onPress={() => Alert.alert('Terms', 'Terms of service')}>Terms</Text>
              </Text>
            </View>

          </Animated.View>
        </ScrollView>

        {/* MODALS */}
        <RoleModal />
        <EducationModal />
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
    marginBottom: 30 
  },

  logoContainer: {
    marginBottom: 20,
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
  registerButtonDisabled: { 
    backgroundColor: 'rgba(0, 0, 0, 0.1)', 
    shadowOpacity: 0.1 
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
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginTop: 10 
  },
  loginText: { 
    color: '#555', 
    fontSize: 16 
  },
  loginLinkContainer: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  loginLink: { 
    color: '#b3b72b', 
    fontSize: 16, 
    fontWeight: '700' 
  },
  loginArrow: { 
    color: '#b3b72b', 
    marginLeft: 4, 
    fontSize: 16 
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
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
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
  modalOptionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  modalOptionTextSelected: {
    color: '#b3b72b',
    fontWeight: '600',
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