import React from 'react';
import { 
  NavigationContainer, 
  DefaultTheme 
} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { 
  View, 
  Text, 
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from './AuthContext';

// Import all screens - USE LAZY LOADING FOR PERFORMANCE
const LoginScreen = React.lazy(() => import('../screens/LoginScreen'));
const RegisterScreen = React.lazy(() => import('../screens/RegisterScreen'));
const DashboardScreen = React.lazy(() => import('../screens/HomeScreen'));
const TeacherHomeScreen = React.lazy(() => import('../screens/TeacherHomeScreen'))
const CourseDetailScreen = React.lazy(() => import('../screens/CourseDetailScreen'));
const SubjectDetailScreen = React.lazy(() => import('../screens/SubjectDetailScreen'));
const MaterialsScreen = React.lazy(() => import('../screens/MaterialScreen'));
const LessonDetailScreen = React.lazy(() => import('../screens/LessonDetailScreen'));
const TestScreen = React.lazy(() => import('../screens/TestScreen'));
const TestList = React.lazy(() => import('../screens/TestListScreen'));
const TestResultScreen = React.lazy(() => import('../screens/TestResultScreen'));
const ComparisonScreen = React.lazy(() => import('../screens/ComparisonScreen'));
const SolutionsScreen = React.lazy(() => import('../screens/SolutionsScreen'));
const LeaderboardScreen = React.lazy(() => import('../screens/LeaderboardScreen.'));
const ProfileScreen = React.lazy(() => import('../screens/ProfileScreen'));
const EditProfileScreen = React.lazy(() => import('../screens/EditProfileScreen'));
const PrivacyPolicyScreen = React.lazy(() => import('../screens/PrivacyPolicyScreen'));
const StudentDetailScreen = React.lazy(() => import('../screens/StudentDetails'))
// Loading component for lazy loading
const LoadingComponent = () => (
  <View style={styles.loadingContainer}>
    <Text>Loading...</Text>
  </View>
);

// Wrap lazy components with Suspense
const withSuspense = (Component) => (props) => (
  <React.Suspense fallback={<LoadingComponent />}>
    <Component {...props} />
  </React.Suspense>
);

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Custom Tab Bar Component
const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined
          ? options.tabBarLabel
          : options.title !== undefined
          ? options.title
          : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        // Get icon name based on route name - FIXED ICON NAMES
        const getIconName = () => {
          switch (route.name) {
            case 'HomeTab':
              return isFocused ? 'home' : 'home-outline'; // Changed from library to home
            case 'TestsTab':
              return isFocused ? 'document-text' : 'document-text-outline';
            case 'ProfileTab':
              return isFocused ? 'person' : 'person-outline';
            default:
              return 'square';
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={[styles.tabItem, isFocused && styles.activeTabItem]}
          >
            <Icon 
              name={getIconName()} 
              size={20} 
              color={isFocused ? '#b3b72b' : '#666'} 
            />
            <Text style={[
              styles.tabLabel,
              isFocused && styles.activeTabLabel
            ]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// Home Stack Navigator - FIXED DUPLICATE SCREENS
const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Dashboard" 
        component={withSuspense(DashboardScreen)}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="CourseDetail" 
        component={withSuspense(CourseDetailScreen)}
        options={{ 
          title: 'Course Details',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="SubjectDetail" 
        component={withSuspense(SubjectDetailScreen)}
        options={{ 
          title: 'Subject Details',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="Materials" 
        component={withSuspense(MaterialsScreen)}
        options={{ 
          title: 'Learning Materials',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="LessonDetail" 
        component={withSuspense(LessonDetailScreen)}
        options={{ 
          title: 'Lesson Details',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
};
const TeacherHomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Dashboard" 
        component={withSuspense(TeacherHomeScreen)}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="CourseDetail" 
        component={withSuspense(CourseDetailScreen)}
        options={{ 
          title: 'Course Details',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="SubjectDetail" 
        component={withSuspense(SubjectDetailScreen)}
        options={{ 
          title: 'Subject Details',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="Materials" 
        component={withSuspense(MaterialsScreen)}
        options={{ 
          title: 'Learning Materials',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="LessonDetail" 
        component={withSuspense(LessonDetailScreen)}
        options={{ 
          title: 'Lesson Details',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
};

// Tests Stack Navigator - FIXED INITIAL ROUTE
const TestsStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="TestsMain" 
        component={withSuspense(TestList)}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="TestSession" 
        component={withSuspense(TestScreen)}
        options={{ 
          title: 'Test',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="TestResult" 
        component={withSuspense(TestResultScreen)}
        options={{ 
          title: 'Test Results',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="Comparison" 
        component={withSuspense(ComparisonScreen)}
        options={{ 
          title: 'Score Comparison',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="Solutions" 
        component={withSuspense(SolutionsScreen)}
        options={{ 
          title: 'Solutions',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="Leaderboard" 
        component={withSuspense(LeaderboardScreen)}
        options={{ 
          title: 'Leaderboard',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
};

// Profile Stack Navigator
const ProfileStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ProfileMain" 
        component={withSuspense(ProfileScreen)}
        options={{ 
          title: 'My Profile',
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="EditProfile" 
        component={withSuspense(EditProfileScreen)}
        options={{ 
          title: 'Edit Profile',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="PrivacyPolicy" 
        component={withSuspense(PrivacyPolicyScreen)}
        options={{ 
          title: 'Privacy Policy',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
};

// Bottom Tab Navigator
const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeStack}
        options={{
          tabBarLabel: 'Courses',
          title: 'Home',
        }}
      />
      <Tab.Screen 
        name="TestsTab" 
        component={TestsStack}
        options={{
          tabBarLabel: 'Tests',
          title: 'Tests',
        }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};
const TeacherTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={TeacherHomeStack}
        options={{
          tabBarLabel: 'Courses',
          title: 'Home',
        }}
      />
      <Tab.Screen 
        name="TestsTab" 
        component={StudentDetailScreen}
        options={{
          tabBarLabel: 'Students',
          title: 'Students',
        }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

// Main Stack Navigator - FIXED INITIAL ROUTE LOGIC
const MainStack = () => {
  // In a real app, you'd check authentication status here
  const isAuthenticated = false; // Change this based on your auth logic
  const {authUser} = useAuth();

  return (
    <Stack.Navigator 
      initialRouteName={"MainTabs"}
      screenOptions={{
        headerStyle: {
          backgroundColor: '#b3b72b',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={withSuspense(LoginScreen)}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Register" 
        component={withSuspense(RegisterScreen)}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="MainTabs" 
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="TeacherTabs" 
        component={TeacherTabNavigator}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

// Custom theme for navigation
const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#b3b72b',
    background: '#ffffff',
    card: '#ffffff',
    text: '#333333',
    border: '#f0f0f0',
  },
};

const RootNavigator = () => {
  return (
    <NavigationContainer theme={MyTheme}>
      <MainStack />
    </NavigationContainer>
  );
};

// Styles
const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    borderRadius: 8,
  },
  activeTabItem: {
    backgroundColor: '#f8f9fa',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    color: '#666',
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#b3b72b',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RootNavigator;