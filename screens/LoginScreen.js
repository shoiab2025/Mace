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
import { setAuthUser, useAuth } from '../navigation/AuthContext'
import { Image } from 'react-native-animatable';
import Icon from 'react-native-vector-icons/Ionicons';

/* ---------------------------- ICON COMPONENTS ---------------------------- */

const PasswordIcon = ({ show, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.eyeButton}>
    <Icon 
      name={show ? 'eye-off-outline' : 'eye-outline'} 
      size={20} 
      color="#666" 
    />
  </TouchableOpacity>
);

const ClearIcon = ({ onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.clearButton}>
    <Icon name="close-circle" size={20} color="#999" />
  </TouchableOpacity>
);

// Stable Input Components to prevent jumping
const UsernameInput = React.memo(({ 
  value, 
  onChangeText, 
  focused, 
  onFocus, 
  onBlur 
}) => (
  <View style={[
    styles.inputWrapper,
    focused && styles.inputFocused,
    value && styles.inputHasValue
  ]}>
    <Icon 
      name="person-outline" 
      size={20} 
      color={focused ? '#b3b72b' : '#666'} 
      style={styles.inputIcon}
    />
    <TextInput
      style={styles.input}
      placeholder="Enter your username or email"
      placeholderTextColor="#A0A0A0"
      value={value}
      onChangeText={onChangeText}
      autoCapitalize="none"
      autoComplete="email"
      onFocus={onFocus}
      onBlur={onBlur}
    />
    {value.length > 0 && (
      <ClearIcon onPress={() => onChangeText('')} />
    )}
  </View>
));

const PasswordInput = React.memo(({ 
  value, 
  onChangeText, 
  showPassword, 
  onTogglePassword,
  focused,
  onFocus,
  onBlur 
}) => (
  <View style={[
    styles.inputWrapper,
    focused && styles.inputFocused,
    value && styles.inputHasValue
  ]}>
    <Icon 
      name="lock-closed-outline" 
      size={20} 
      color={focused ? '#b3b72b' : '#666'} 
      style={styles.inputIcon}
    />
    <TextInput
      style={styles.passwordInput}
      placeholder="Enter your password"
      placeholderTextColor="#A0A0A0"
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={!showPassword}
      onFocus={onFocus}
      onBlur={onBlur}
    />
    <View style={styles.passwordActions}>
      {value.length > 0 && (
        <ClearIcon onPress={() => onChangeText('')} />
      )}
      <PasswordIcon
        show={showPassword}
        onPress={onTogglePassword}
      />
    </View>
  </View>
));

/* --------------------------- LOGIN SCREEN --------------------------- */

const LoginScreen = ({ navigation }) => {

  /* ---------------------------- STATE ---------------------------- */

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const { authUser, setAuthUser } = useAuth();
  /* --------------------- ANIMATION REFERENCES --------------------- */

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const backgroundMove = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0)).current;
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
    ]).start();
  }, []);

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
  }, [isLoading, username, password]);

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
      const user = await userSignIn({ usernameOrEmail: username, password: password })
      console.log(user)
      if (user.success) {
        Alert.alert('User Logged in Successfully')
        setAuthUser(user.data.user)
        console.log("The Data from logim pae", user)
        setIsLoading(false);
        if (user?.data?.user?.role === 'student') {
           navigation.navigate('MainTabs');
        }
        else {
           navigation.navigate('TeacherTabs');
        }
      }
      else {
        Alert.alert(`${user.error}`)
        setIsLoading(false);
        navigation.navigate('Login')
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

  const handleFocus = (inputName) => setFocusedInput(inputName);
  const handleBlur = () => setFocusedInput(null);
  const togglePassword = () => setShowPassword(!showPassword);

  /* ------------------------ ANIMATION VALUES ------------------------ */

  const backgroundInterpolate = backgroundMove.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const buttonGlowOpacity = buttonGlowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.4],
  });

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
          keyboardShouldPersistTaps="handled"
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
          </View>

          {/* MAIN CONTENT CONTAINER */}
          <View style={styles.mainContent}>
            <Animated.View
              style={[
                styles.content,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >

              {/* HEADER WITH LOGO */}
              <View style={styles.header}>
                <Animated.View style={[
                  styles.logoContainer,
                  { transform: [{ scale: logoScale }] }
                ]}>
                  <View style={styles.logo}>
                    <Image
                      source={require("../assets/images/logo.png")}
                      style={styles.logoImage}
                      resizeMode="contain"
                    />
                  </View>
                </Animated.View>
                
                <View style={styles.welcomeContainer}>
                  <Text style={styles.welcome}>Welcome Back</Text>
                  <Text style={styles.subtitle}>Sign in to continue your learning journey</Text>
                </View>
              </View>

              {/* FORM CARD */}
              <View style={styles.formContainer}>
                <View style={styles.form}>

                  {/* USERNAME INPUT */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Username or Email</Text>
                    <UsernameInput
                      value={username}
                      onChangeText={setUsername}
                      focused={focusedInput === 'username'}
                      onFocus={() => handleFocus('username')}
                      onBlur={handleBlur}
                    />
                  </View>

                  {/* PASSWORD INPUT */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Password</Text>
                    <PasswordInput
                      value={password}
                      onChangeText={setPassword}
                      showPassword={showPassword}
                      onTogglePassword={togglePassword}
                      focused={focusedInput === 'password'}
                      onFocus={() => handleFocus('password')}
                      onBlur={handleBlur}
                    />
                  </View>

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
                          <Text style={styles.loginButtonText}>Sign In</Text>
                          <Icon name="arrow-forward" size={20} color="#fff" />
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

                  {/* REGISTER LINK */}
                  <View style={styles.registerContainer}>
                    <Text style={styles.registerText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={handleRegister}>
                      <View style={styles.registerLinkContainer}>
                        <Text style={styles.registerLink}>Sign Up</Text>
                        <Icon name="arrow-forward-circle" size={16} color="#b3b72b" />
                      </View>
                    </TouchableOpacity>
                  </View>

                </View>
              </View>

              {/* FOOTER */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Protected by advanced encryption •{' '}
                  <Text style={styles.footerLink} onPress={() => Alert.alert('Privacy', 'Privacy policy')}>Privacy</Text> •{' '}
                  <Text style={styles.footerLink} onPress={() => Alert.alert('Terms', 'Terms of service')}>Terms</Text>
                </Text>
              </View>

            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

/* ---------------------------- STYLES ---------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#b3b72b',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
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
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  logoImage: {
    width: 120,
    height: 60,
  },
  welcomeContainer: {
    alignItems: 'center',
  },
  welcome: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 20,
    marginBottom: 20,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 16,
    minHeight: 56,
  },
  inputFocused: {
    borderColor: '#b3b72b',
    backgroundColor: '#fff',
  },
  inputHasValue: {
    borderColor: 'rgba(179, 183, 43, 0.3)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    paddingVertical: 8,
    includeFontPadding: false, // Prevents jumping
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    paddingVertical: 8,
    includeFontPadding: false, // Prevents jumping
  },
  passwordActions: {
    flexDirection: 'row',
    gap: 8,
  },
  eyeButton: {
    padding: 4,
  },
  clearButton: {
    padding: 4,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 25,
    marginTop: -5,
  },
  forgotPasswordText: {
    color: '#b3b72b',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButtonContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  loginButton: {
    backgroundColor: '#b3b72b',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    zIndex: 2,
  },
  loginButtonDisabled: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    shadowOpacity: 0,
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonGlow: {
    position: 'absolute',
    top: 8,
    left: '10%',
    right: '10%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#b3b72b',
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
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: '#666',
    fontSize: 15,
  },
  registerLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  registerLink: {
    color: '#b3b72b',
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    marginTop: 10,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  footerLink: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default LoginScreen;