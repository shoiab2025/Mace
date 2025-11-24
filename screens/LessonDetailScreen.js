import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Animated,
  Dimensions,
  Share,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

const LessonDetailScreen = ({ navigation, route }) => {
  const { material, subjectDetail, courseData } = route.params || {};
  const scrollY = useRef(new Animated.Value(0)).current;
  const videoRef = useRef(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Dynamic lesson data based on material
  const lessonData = {
    id: material?.id || '1',
    title: material?.name || 'The Noun Song',
    type: material?.content_type ? material.content_type.toUpperCase() : 'Video Lesson',
    duration: '15:30',
    level: 'Beginner',
    description: material?.description || 'Learn about nouns through this fun and engaging song that helps children understand naming words with ease.',
    videoUrl: material?.content_url || 'https://example.com/noun-song.mp4',
    content: [
      {
        type: 'heading',
        content: '🎵 What are Nouns?',
        level: 1
      },
      {
        type: 'paragraph',
        content: 'Nouns are **naming words**! They help us name everything around us. Think of nouns as labels for all the things, people, places, and animals in our world.'
      },
      {
        type: 'heading',
        content: '📚 Types of Nouns',
        level: 2
      },
      {
        type: 'list',
        items: [
          '**People**: teacher, doctor, student, mother',
          '**Places**: school, park, city, beach',
          '**Animals**: dog, cat, elephant, butterfly',
          '**Things**: book, pencil, computer, ball'
        ]
      },
      {
        type: 'quote',
        content: 'A noun is the name of anything - A person, animal, place, or thing!',
        author: 'Grammar Rhyme'
      },
      {
        type: 'heading',
        content: '🎯 Examples in Sentences',
        level: 2
      },
      {
        type: 'paragraph',
        content: 'Let\'s see how nouns work in sentences:'
      },
      {
        type: 'example',
        examples: [
          {
            sentence: 'The **teacher** writes on the **board**.',
            nouns: ['teacher', 'board']
          },
          {
            sentence: 'We play in the **park** with our **friends**.',
            nouns: ['park', 'friends']
          },
          {
            sentence: 'My **cat** sleeps on the **sofa**.',
            nouns: ['cat', 'sofa']
          }
        ]
      },
      {
        type: 'heading',
        content: '📖 Practice Exercise',
        level: 2
      },
      {
        type: 'paragraph',
        content: 'Can you find the nouns in this sentence?'
      },
      {
        type: 'exercise',
        content: 'The **children** read **books** in the **library** every **Monday**.',
        answer: ['children', 'books', 'library', 'Monday']
      },
      {
        type: 'tip',
        content: '💡 **Remember**: Nouns can be common (general) or proper (specific names starting with capital letters)!'
      }
    ],
    objectives: [
      'Identify nouns in sentences',
      'Differentiate between people, places, animals, and things',
      'Use nouns correctly in writing',
      'Recognize proper nouns'
    ],
    keyPoints: [
      'Nouns name people, places, animals, and things',
      'Every sentence needs at least one noun',
      'Proper nouns start with capital letters',
      'Nouns can be singular or plural'
    ]
  };

  const isVideo = material?.content_type?.toLowerCase() === 'video';
  const isPDF = material?.content_type?.toLowerCase() === 'pdf';

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [120, 80],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    if (material) {
      navigation.setOptions({
        headerTitle: `${material.name} - ${material.content_type}`,
      });
    }
  }, [navigation, material]);

  // Handle device rotation
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      // Update any dimension-dependent styles if needed
    });

    return () => subscription?.remove();
  }, []);

  // Reset full screen when leaving screen
  useEffect(() => {
    return () => {
      if (isFullScreen) {
        StatusBar.setHidden(false);
      }
    };
  }, [isFullScreen]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this amazing lesson: "${lessonData.title}" on MindGym App!`,
        url: 'https://mindgym.com/lessons/noun-song',
        title: lessonData.title
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share lesson');
    }
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    Alert.alert(
      isBookmarked ? 'Removed from Bookmarks' : 'Added to Bookmarks',
      `"${lessonData.title}" ${isBookmarked ? 'removed from' : 'added to'} your bookmarks.`
    );
  };

  const handleVideoPlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    if (!isFullScreen) {
      StatusBar.setHidden(true);
    } else {
      StatusBar.setHidden(false);
    }
  };

  const onVideoLoad = (data) => {
    setVideoDuration(data.duration);
    setIsLoading(false);
  };

  const onVideoProgress = (data) => {
    setVideoProgress(data.currentTime / data.seekableDuration);
  };

  const onVideoError = (error) => {
    console.log('Video error:', error);
    setHasError(true);
    setIsLoading(false);
  };

  const onWebViewLoad = () => {
    setIsLoading(false);
  };

  const onWebViewError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const getVideoSource = () => {
    if (material?.content_url) {
      // Handle Google Drive links
      if (material.content_url.includes('drive.google.com')) {
        const fileId = material.content_url.match(/[-\w]{25,}/);
        if (fileId) {
          return { uri: `https://drive.google.com/uc?export=download&id=${fileId[0]}` };
        }
      }
      return { uri: material.content_url };
    }
    return { uri: lessonData.videoUrl };
  };

  const getPDFSource = () => {
    if (material?.content_url) {
      // Handle Google Drive PDF links
      
      return { uri: material.content_url };
    }
    return { uri: 'https://example.com/sample.pdf' };
  };

  const formatTime = (seconds) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBackInFullScreen = () => {
    if (isFullScreen) {
      toggleFullScreen();
      return true; // Prevent default back action
    }
    return false;
  };

  // Add back handler for full screen exit
  useEffect(() => {
    const backHandler = () => {
      if (isFullScreen) {
        toggleFullScreen();
        return true;
      }
      return false;
    };

    // This would typically be set up with BackHandler
    // BackHandler.addEventListener('hardwareBackPress', backHandler);
    
    return () => {
      // BackHandler.removeEventListener('hardwareBackPress', backHandler);
    };
  }, [isFullScreen]);

  const renderMediaPlayer = () => {
    if (isVideo) {
      return (
        <View style={[
          styles.mediaContainer,
          isFullScreen && styles.fullScreenContainer
        ]}>
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#b3b72b" />
              <Text style={styles.loadingText}>Loading video...</Text>
            </View>
          )}
          
          {hasError ? (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={48} color="#FF6B6B" />
              <Text style={styles.errorText}>Failed to load video</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => {
                  setHasError(false);
                  setIsLoading(true);
                }}
              >
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.videoWrapper}>
              <Video
                ref={videoRef}
                source={getVideoSource()}
                style={[
                  styles.videoPlayer,
                  isFullScreen && styles.fullScreenVideo
                ]}
                resizeMode="contain"
                paused={!isPlaying}
                onLoad={onVideoLoad}
                onProgress={onVideoProgress}
                onError={onVideoError}
                controls={false}
              />
              
              {/* Custom Video Controls */}
              <View style={[
                styles.videoControls,
                isFullScreen && styles.fullScreenControls
              ]}>
                <TouchableOpacity 
                  style={styles.playPauseButton}
                  onPress={handleVideoPlayPause}
                >
                  <Icon 
                    name={isPlaying ? "pause" : "play"} 
                    size={32} 
                    color="#FFFFFF" 
                  />
                </TouchableOpacity>
                
                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${videoProgress * 100}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.durationText}>
                    {formatTime(videoProgress * videoDuration)} / {formatTime(videoDuration)}
                  </Text>
                </View>

                {/* Full Screen Button */}
                <TouchableOpacity 
                  style={styles.fullScreenButton}
                  onPress={toggleFullScreen}
                >
                  <Icon 
                    name={isFullScreen ? "contract" : "expand"} 
                    size={24} 
                    color="#FFFFFF" 
                  />
                </TouchableOpacity>
              </View>

              {/* Exit Full Screen Button */}
              {isFullScreen && (
                <TouchableOpacity 
                  style={styles.exitFullScreenButton}
                  onPress={toggleFullScreen}
                >
                  <Icon name="close" size={28} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      );
    } else if (isPDF) {
      return (
        <View style={[styles.mediaContainer, {height: 800}]}>
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#b3b72b" />
              <Text style={styles.loadingText}>Loading document...</Text>
            </View>
          )}
          
          {hasError ? (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={48} color="#FF6B6B" />
              <Text style={styles.errorText}>Failed to load document</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => {
                  setHasError(false);
                  setIsLoading(true);
                }}
              >
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.webviewContainer}>
              <WebView
                source={getPDFSource()}
                style={styles.webview}
                onLoad={onWebViewLoad}
                onError={onWebViewError}
                startInLoadingState={true}
                scalesPageToFit={true}
              />
            </View>
          )}
        </View>
      );
    } else {
      // Default placeholder for other content types
      return (
        <View style={styles.mediaContainer}>
          <View style={styles.placeholderContainer}>
            <Icon name="document" size={64} color="#CCCCCC" />
            <Text style={styles.placeholderText}>
              {material?.content_type || 'Content'} Viewer
            </Text>
            <Text style={styles.placeholderSubtext}>
              This content type is not supported for direct viewing
            </Text>
          </View>
        </View>
      );
    }
  };

  const renderContent = (item, index) => {
    switch (item.type) {
      case 'heading':
        return (
          <Text key={index} style={[
            styles.heading,
            item.level === 1 ? styles.heading1 : styles.heading2
          ]}>
            {item.content}
          </Text>
        );

      case 'paragraph':
        return (
          <Text key={index} style={styles.paragraph}>
            {item.content.split('**').map((text, i) => 
              i % 2 === 1 ? (
                <Text key={i} style={styles.boldText}>{text}</Text>
              ) : (
                text
              )
            )}
          </Text>
        );

      case 'list':
        return (
          <View key={index} style={styles.listContainer}>
            {item.items.map((listItem, listIndex) => (
              <View key={listIndex} style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>
                  {listItem.split('**').map((text, i) => 
                    i % 2 === 1 ? (
                      <Text key={i} style={styles.boldText}>{text}</Text>
                    ) : (
                      text
                    )
                  )}
                </Text>
              </View>
            ))}
          </View>
        );

      case 'quote':
        return (
          <View key={index} style={styles.quoteContainer}>
            <View style={styles.quoteBackground}>
              <Icon name="quote" size={24} color="#5C6BC0" />
              <Text style={styles.quoteText}>"{item.content}"</Text>
              {item.author && (
                <Text style={styles.quoteAuthor}>- {item.author}</Text>
              )}
            </View>
          </View>
        );

      case 'example':
        return (
          <View key={index} style={styles.examplesContainer}>
            {item.examples.map((example, exIndex) => (
              <View key={exIndex} style={styles.exampleItem}>
                <Text style={styles.exampleSentence}>
                  {example.sentence.split('**').map((text, i) => 
                    i % 2 === 1 ? (
                      <Text key={i} style={styles.highlightedNoun}>{text}</Text>
                    ) : (
                      text
                    )
                  )}
                </Text>
                <View style={styles.nounsList}>
                  <Text style={styles.nounsLabel}>Nouns: </Text>
                  {example.nouns.map((noun, nounIndex) => (
                    <View key={nounIndex} style={styles.nounTag}>
                      <Text style={styles.nounTagText}>{noun}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        );

      case 'exercise':
        return (
          <View key={index} style={styles.exerciseContainer}>
            <View style={styles.exerciseBackground}>
              <Text style={styles.exerciseTitle}>🧠 Quick Practice</Text>
              <Text style={styles.exerciseQuestion}>
                {item.content.split('**').map((text, i) => 
                  i % 2 === 1 ? (
                    <Text key={i} style={styles.exerciseHighlight}>{text}</Text>
                  ) : (
                    text
                  )
                )}
              </Text>
              <TouchableOpacity style={styles.showAnswerButton}>
                <Text style={styles.showAnswerText}>Show Answer</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'tip':
        return (
          <View key={index} style={styles.tipContainer}>
            <View style={styles.tipBackground}>
              <Icon name="bulb" size={20} color="#4CAF50" />
              <Text style={styles.tipText}>
                {item.content.split('**').map((text, i) => 
                  i % 2 === 1 ? (
                    <Text key={i} style={styles.boldText}>{text}</Text>
                  ) : (
                    text
                  )
                )}
              </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  // If in full screen mode, render only the video
  if (isFullScreen) {
    return (
      <View style={styles.fullScreenWrapper}>
        {renderMediaPlayer()}
      </View>
    );
  }

  // Normal mode rendering
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Media Player Section */}
        <View style={styles.mediaSection}>
          {renderMediaPlayer()}
        </View>

        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.descriptionTitle}>About This {isVideo ? 'Video' : isPDF ? 'Document' : 'Material'}</Text>
          <Text style={styles.descriptionText}>{material?.description || lessonData.description}</Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  fullScreenWrapper: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  headerBackground: {
    flex: 1,
    backgroundColor: '#b3b72b',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerAction: {
    padding: 8,
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  mediaSection: {
    padding: 20,
  },
  mediaContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    backgroundColor: '#000',
    height: 250,
  },
  fullScreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    width: '100%',
    borderRadius: 0,
    zIndex: 9999,
  },
  videoWrapper: {
    flex: 1,
    position: 'relative',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  fullScreenVideo: {
    width: '100%',
    height: '100%',
  },
  webviewContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  videoControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fullScreenControls: {
    paddingBottom: 30, // Extra padding for devices with home indicator
  },
  playPauseButton: {
    marginRight: 16,
  },
  progressBarContainer: {
    flex: 1,
    marginRight: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#b3b72b',
    borderRadius: 2,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  fullScreenButton: {
    padding: 4,
  },
  exitFullScreenButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
    zIndex: 10000,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 14,
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#b3b72b',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  placeholderText: {
    fontSize: 18,
    color: '#666',
    marginTop: 12,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  infoCards: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  infoText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginTop: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  descriptionSection: {
    padding: 20,
    backgroundColor: '#F8F9FA',
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  objectivesSection: {
    padding: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  objectiveText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    lineHeight: 20,
  },
  keyPointsSection: {
    padding: 20,
    marginBottom: 24,
  },
  keyPointsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  keyPointCard: {
    width: '50%',
    padding: 8,
  },
  keyPointText: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    fontSize: 13,
    color: '#1976D2',
    fontWeight: '500',
    lineHeight: 18,
  },
  contentSection: {
    padding: 20,
  },
  heading1: {
    fontSize: 24,
    fontWeight: '800',
    color: '#333',
    marginBottom: 16,
    marginTop: 8,
  },
  heading2: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    marginTop: 24,
  },
  paragraph: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
  boldText: {
    fontWeight: '700',
    color: '#333',
  },
  listContainer: {
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    fontSize: 16,
    color: '#b3b72b',
    marginRight: 12,
    marginTop: 4,
  },
  listText: {
    flex: 1,
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  quoteContainer: {
    marginVertical: 16,
  },
  quoteBackground: {
    backgroundColor: '#E3F2FD',
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#5C6BC0',
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#5C6BC0',
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 8,
  },
  quoteAuthor: {
    fontSize: 14,
    color: '#7986CB',
    fontWeight: '600',
    textAlign: 'right',
  },
  examplesContainer: {
    marginVertical: 16,
  },
  exampleItem: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  exampleSentence: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 8,
  },
  highlightedNoun: {
    backgroundColor: '#FFECB3',
    paddingHorizontal: 4,
    borderRadius: 4,
    fontWeight: '700',
    color: '#E65100',
  },
  nounsList: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  nounsLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  nounTag: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 6,
    marginBottom: 4,
  },
  nounTagText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  exerciseContainer: {
    marginVertical: 16,
  },
  exerciseBackground: {
    backgroundColor: '#FFF3E0',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFB74D',
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E65100',
    marginBottom: 8,
  },
  exerciseQuestion: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 16,
  },
  exerciseHighlight: {
    backgroundColor: '#FFECB3',
    paddingHorizontal: 4,
    borderRadius: 4,
    fontWeight: '700',
    color: '#E65100',
  },
  showAnswerButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF9800',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  showAnswerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  tipContainer: {
    marginVertical: 16,
  },
  tipBackground: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E8F5E8',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#2E7D32',
    marginLeft: 12,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  actionSection: {
    padding: 20,
    marginTop: 10,
  },
  primaryButton: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#b3b72b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonBackground: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#b3b72b',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: '#b3b72b',
    borderRadius: 16,
  },
  secondaryButtonText: {
    color: '#b3b72b',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 100,
  },
});

export default LessonDetailScreen;