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
} from 'react-native';

const { width, height } = Dimensions.get('window');
import { userSignIn } from '../API_STORE/user_api';
import {setAuthUser} from '../navigation/AuthContext'

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

/* --------------------------- LOGIN SCREEN --------------------------- */

const LoginScreen = ({ navigation }) => {

  /* ---------------------------- STATE ---------------------------- */

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

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

  // FIX: Move all hook declarations to the top level
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

  // FIX: Add useEffect to control button glow animation
  useEffect(() => {
    if (!isLoading && username && password) {
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
  }, [isLoading, username, password, buttonGlowAnim]);

  /* ---------------------------- ACTIONS ---------------------------- */

  const handleLogin = () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }


    setIsLoading(true);

    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    setTimeout(async () => {
      const user = await userSignIn({usernameOrEmail: username, password: password})
      if (user) {
        setIsLoading(false);
        navigation.navigate('MainTabs');
      }
      else {
        setIsLoading(false);
        navigation.navigate('login')
      }
    }, 2000);
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const handleRegister = () => navigation.navigate('Register');
  const handleForgotPassword = () => navigation.navigate('ForgotPassword');

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
                <Text style={styles.welcome}>Welcome Back!</Text>
                <Text style={styles.subtitle}>
                  Continue your learning journey with personalized courses and expert guidance
                </Text>
              </View>
            </View>

            {/* FORM CARD */}
            <View style={styles.formContainer}>

              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>Secure Sign In</Text>
                <View style={styles.securityBadge}>
                  <Text style={styles.securityText}>🔒 Encrypted</Text>
                </View>
              </View>

              <View style={styles.form}>

                {/* USERNAME */}
                <View style={styles.inputContainer}>
                  <View style={styles.inputLabelRow}>
                    <Text style={styles.inputEmoji}>👤</Text>
                    <Text style={styles.label}>Username or Email</Text>
                  </View>

                  <View style={[
                    styles.inputWrapper,
                    focusedInput === 'username' && styles.inputFocused,
                    username && styles.inputHasValue
                  ]}>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your username or email"
                      placeholderTextColor="#A0A0A0"
                      value={username}
                      onChangeText={setUsername}
                      autoCapitalize="none"
                      autoComplete="email"
                      onFocus={() => setFocusedInput('username')}
                      onBlur={() => setFocusedInput(null)}
                    />
                    {username.length > 0 && <ClearIcon onPress={() => setUsername('')} />}
                  </View>
                </View>

                {/* PASSWORD */}
                <View style={styles.inputContainer}>
                  <View style={styles.inputLabelRow}>
                    <Text style={styles.inputEmoji}>🔐</Text>
                    <Text style={styles.label}>Password</Text>
                  </View>

                  <View style={[
                    styles.inputWrapper,
                    focusedInput === 'password' && styles.inputFocused,
                    password && styles.inputHasValue
                  ]}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Enter your password"
                      placeholderTextColor="#A0A0A0"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      onFocus={() => setFocusedInput('password')}
                      onBlur={() => setFocusedInput(null)}
                    />

                    <View style={styles.passwordActions}>
                      {password.length > 0 && (
                        <ClearIcon onPress={() => setPassword('')} />
                      )}
                      <PasswordIcon
                        show={showPassword}
                        onPress={() => setShowPassword(!showPassword)}
                      />
                    </View>
                  </View>
                </View>

                {/* FORGOT PASSWORD */}
                <TouchableOpacity style={styles.forgotPasswordContainer} onPress={handleForgotPassword}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

                {/* LOGIN BUTTON */}
                <Animated.View style={[
                  styles.loginButtonContainer,
                  { transform: [{ scale: buttonScale }] }
                ]}>
                  <TouchableOpacity
                    style={[
                      styles.loginButton,
                      (!username || !password) && styles.loginButtonDisabled
                    ]}
                    disabled={!username || !password || isLoading}
                    onPress={handleLogin}
                    onPressIn={animateButton}
                  >
                    {isLoading ? (
                      <View style={styles.loadingContent}>
                        <ActivityIndicator size="small" color="#fff" />
                        <Text style={styles.loginButtonText}>Authenticating...</Text>
                      </View>
                    ) : (
                      <View style={styles.buttonContent}>
                        <Text style={styles.loginButtonText}>Access My Account</Text>
                        <Text style={styles.buttonArrow}>→</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* FIX: Always render the button glow but control opacity */}
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

                {/* REGISTER */}
                <View style={styles.registerContainer}>
                  <Text style={styles.registerText}>New to MACE App? </Text>
                  <TouchableOpacity onPress={handleRegister}>
                    <View style={styles.registerLinkContainer}>
                      <Text style={styles.registerLink}>Create Account</Text>
                      <Text style={styles.registerArrow}>↗</Text>
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
    marginBottom: 40 
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

  inputContainer: { 
    marginBottom: 20 
  },
  inputLabelRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  inputEmoji: { 
    fontSize: 16, 
    marginRight: 8 
  },
  label: { 
    fontSize: 16, 
    color: '#333', 
    fontWeight: '600' 
  },

  inputWrapper: {
    flexDirection: 'row', 
    alignItems: 'center',
    borderWidth: 2, 
    borderColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 18, 
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 18, 
    minHeight: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
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

  input: { 
    flex: 1, 
    fontSize: 17, 
    color: '#1A1A1A',
    paddingVertical: 8,
  },
  passwordInput: { 
    flex: 1, 
    fontSize: 17, 
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

  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: -8,
  },
  forgotPasswordText: {
    color: '#b3b72b',
    fontSize: 15,
    fontWeight: '600',
  },

  loginButtonContainer: { 
    marginVertical: 20, 
    position: 'relative' 
  },
  loginButton: {
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
  loginButtonDisabled: { 
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

  loginButtonText: { 
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
    marginVertical: 24,
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

  registerContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginTop: 10 
  },
  registerText: { 
    color: '#555', 
    fontSize: 16 
  },
  registerLinkContainer: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  registerLink: { 
    color: '#b3b72b', 
    fontSize: 16, 
    fontWeight: '700' 
  },
  registerArrow: { 
    color: '#b3b72b', 
    marginLeft: 4, 
    fontSize: 16 
  },

  footer: { 
    marginTop: 30 
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
});

export default LoginScreen;