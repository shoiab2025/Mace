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

// Import all screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen'
import DashboardScreen from '../screens/HomeScreen';
import CourseDetailScreen from '../screens/CourseDetailScreen';
import SubjectDetailScreen from '../screens/SubjectDetailScreen';
import MaterialsScreen from '../screens/MaterialScreen';
import LessonDetailScreen from '../screens/LessonDetailScreen';
import TestScreen from '../screens/TestScreen';
import TestList from '../screens/TestListScreen';
import TestResultScreen from '../screens/TestResultScreen';
import ComparisonScreen from '../screens/ComparisonScreen';
import SolutionsScreen from '../screens/SolutionsScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen.';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';

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

        // Get icon name based on route name
        const getIconName = () => {
          switch (route.name) {
            case 'HomeTab':
              return isFocused ? 'library' : 'library-outline';
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
              size={24} 
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

// Home Stack Navigator
const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="CourseDetail" 
        component={CourseDetailScreen}
        options={{ 
          title: 'Course Details',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="SubjectDetail" 
        component={SubjectDetailScreen}
        options={{ 
          title: 'Subject Details',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="Materials" 
        component={MaterialsScreen}
        options={{ 
          title: 'Learning Materials',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="LessonDetail" 
        component={LessonDetailScreen}
        options={{ 
          title: 'Lesson Details',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
};

// Courses Stack Navigator
const CoursesStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="CoursesMain" 
        component={CourseDetailScreen}
        options={{ 
          title: 'My Courses',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="CourseDetail" 
        component={CourseDetailScreen}
        options={{ 
          title: 'Course Details',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="SubjectDetail" 
        component={SubjectDetailScreen}
        options={{ 
          title: 'Subject Details',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="Materials" 
        component={MaterialsScreen}
        options={{ 
          title: 'Learning Materials',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
};

// Tests Stack Navigator
const TestsStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="TestsMain" 
        component={TestList}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="TestSession" 
        component={TestScreen}
        options={{ 
          title: 'Test Screen',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="TestResult" 
        component={TestResultScreen}
        options={{ 
          title: 'Test Results',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="Comparison" 
        component={ComparisonScreen}
        options={{ 
          title: 'Score Comparison',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="Solutions" 
        component={SolutionsScreen}
        options={{ 
          title: 'Solutions',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="Leaderboard" 
        component={LeaderboardScreen}
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
        component={ProfileScreen}
        options={{ 
          title: 'My Profile',
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{ 
          title: 'Edit Profile',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="PrivacyPolicy" 
        component={PrivacyPolicyScreen}
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

// Main Stack Navigator
const MainStack = () => {
  return (
    <Stack.Navigator 
      initialRouteName="MainTabs"
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
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="MainTabs" 
        component={TabNavigator}
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
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeTabItem: {
    backgroundColor: '#f8f9fa',
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    color: '#666',
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#b3b72b',
    fontWeight: '600',
  },
});

export default RootNavigator;