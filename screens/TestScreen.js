import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Dimensions,
  Alert,
  Image,
  Linking
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import RenderHTML from 'react-native-render-html';
import { useAuth } from '../navigation/AuthContext';
import { submitTestAPI } from '../API_STORE/test_api';

const { width } = Dimensions.get('window');

const TestScreen = ({ navigation, route }) => {
  const { testData } = route.params || {};
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { authUser } = useAuth();

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAutoSubmit = () => {
    const submissionData = prepareSubmissionData();
    Alert.alert(
      'Time Up!',
      'Your test has been automatically submitted.',
      [{ text: 'OK', onPress: () => handleFinalSubmit(submissionData) }]
    );
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const questions = testData?.test_questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  // Extract media from HTML content
  const extractMediaFromHTML = (html) => {
    const media = {
      images: [],
      videos: [],
      audio: []
    };

    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    const videoRegex = /<video[^>]*>.*?<source[^>]+src="([^">]+)"[^>]*>.*?<\/video>|<video[^>]+src="([^">]+)"/g;
    const audioRegex = /<audio[^>]*>.*?<source[^>]+src="([^">]+)"[^>]*>.*?<\/audio>|<audio[^>]+src="([^">]+)"/g;

    let match;
    while ((match = imgRegex.exec(html)) !== null) {
      media.images.push(match[1]);
    }
    
    while ((match = videoRegex.exec(html)) !== null) {
      const videoUrl = match[1] || match[2];
      if (videoUrl) media.videos.push(videoUrl);
    }
    
    while ((match = audioRegex.exec(html)) !== null) {
      const audioUrl = match[1] || match[2];
      if (audioUrl) media.audio.push(audioUrl);
    }

    return media;
  };

  const handleMediaPress = async (mediaUrl, type) => {
    try {
      if (type === 'audio' || type === 'video') {
        const supported = await Linking.canOpenURL(mediaUrl);
        if (supported) {
          await Linking.openURL(mediaUrl);
        } else {
          Alert.alert('Error', `Cannot open ${type} file`);
        }
      }
    } catch (error) {
      console.error('Error opening media:', error);
      Alert.alert('Error', 'Could not open media file');
    }
  };

  const handleAnswerSelect = (optionIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionIndex
    }));
  };

  const handleMarkReview = () => {
    setMarkedForReview(prev => ({
      ...prev,
      [currentQuestionIndex]: !prev[currentQuestionIndex]
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    let score = 0;
    let correct_answers = 0;
    let wrong_answers = 0;
    let skipped_questions = 0;

    const detailed_answers = [];

    questions.forEach((question, index) => {
      const userAnswer = selectedAnswers[index];
      const questionId = question._id || question.id;
      
      // If no answer selected, count as skipped
      if (userAnswer === undefined) {
        skipped_questions++;
        detailed_answers.push({
          question_id: questionId,
          selected_options: [],
          is_correct: false,
          status: 'skipped'
        });
        return;
      }

      const userAnswerLetter = String.fromCharCode(65 + userAnswer);
      const selected_options = [userAnswerLetter];
      
      // Check if answer is correct - assuming correct_options exists in your data
      const is_correct = question.correct_options?.includes(userAnswerLetter) || false;
      
      // Calculate score
      if (is_correct) {
        score += question.positive_mark || 1;
        correct_answers++;
      } else {
        if (question.negative_mark) {
          score -= question.negative_mark;
        }
        wrong_answers++;
      }

      detailed_answers.push({
        question_id: questionId,
        selected_options: selected_options,
        is_correct: is_correct,
        status: is_correct ? 'correct' : 'wrong'
      });
    });

    // Calculate average score (percentage)
    const totalPossibleMarks = questions.reduce((total, question) => {
      return total + (question.positive_mark || 1);
    }, 0);
    
    const average_score = totalPossibleMarks > 0 ? (score / totalPossibleMarks) * 100 : 0;

    return {
      score: Math.max(0, score),
      correct_answers: correct_answers,
      wrong_answers: wrong_answers,
      skipped_questions: skipped_questions,
      average_score: Math.round(average_score * 100) / 100,
      detailed_answers: detailed_answers,
      total_questions: questions.length,
      time_spent: (15 * 60) - timeLeft, // in seconds
      submitted_at: new Date().toISOString()
    };
  };

  const prepareSubmissionData = () => {
    const result = calculateScore();
    
    // Flat structure as required by the API
    const submissionData = {
      // Core identifiers
      user: authUser._id,
      test: testData._id,
      subject: testData.test_subject?._id || null,
      lesson: testData.test_lesson?._id || null,
      
      // Required flat fields (as per API validation)
      total_questions: result.total_questions,
      correct_answers: result.correct_answers,
      wrong_answers: result.wrong_answers,
      skipped_questions: result.skipped_questions,
      score: result.score,
      average_score: result.average_score,
      time_spent: result.time_spent,
      submitted_at: result.submitted_at,
      
      // Additional fields that might be useful
      test_name: testData.test_name,
      test_type: testData.test_type,
      user_name: authUser.name || authUser.username,
      marked_questions: Object.keys(markedForReview).filter(key => markedForReview[key]).length,
      
      // Detailed answers array
      detailed_answers: result.detailed_answers.map((answer, index) => {
        const question = questions[index];
        return {
          question_id: answer.question_id,
          question_number: index + 1,
          selected_options: answer.selected_options,
          correct_options: question.correct_options || [],
          is_correct: answer.is_correct,
          status: answer.status,
          marks: {
            positive: question.positive_mark || 1,
            negative: question.negative_mark || 0,
            obtained: answer.is_correct ? (question.positive_mark || 1) : (question.negative_mark ? -question.negative_mark : 0)
          },
          marked_for_review: !!markedForReview[index]
        };
      })
    };

    return submissionData;
  };

  const handleSubmit = () => {
    const submissionData = prepareSubmissionData();
    
    // Show confirmation before final submission
    Alert.alert(
      'Submit Test',
      `Are you sure you want to submit your test?\n\nAnswered: ${submissionData.correct_answers + submissionData.wrong_answers}/${totalQuestions}\nMarked for Review: ${submissionData.marked_questions}`,
      [
        {
          text: 'Review Again',
          style: 'cancel'
        },
        {
          text: 'Submit',
          onPress: async () => {
            setIsSubmitting(true);
            try {
              const response = await submitTestAPI(submissionData);
              if (response.success) {
                handleFinalSubmit(submissionData, response);
              } else {
                throw new Error(response.message || 'Failed to submit test');
              }
            } catch (error) {
              console.error('Submission error:', error);
              Alert.alert('Submission Failed', error.message || 'Failed to submit test. Please try again.');
            } finally {
              setIsSubmitting(false);
            }
          }
        }
      ]
    );
  };

  const handleFinalSubmit = (submissionData, apiResponse = null) => {
    Alert.alert(
      'Test Submitted Successfully!',
      `Score: ${submissionData.score}\n` +
      `Correct: ${submissionData.correct_answers}/${totalQuestions}\n` +
      `Wrong: ${submissionData.wrong_answers}\n` +
      `Skipped: ${submissionData.skipped_questions}\n` +
      `Percentage: ${submissionData.average_score}%`,
      [
        {
          text: 'View Detailed Results',
          onPress: () => {
            navigation.navigate('TestResult', {
              testData,
              userAnswers: selectedAnswers,
              submissionData: {
                ...submissionData,
                apiResponse // Include API response if available
              },
              totalQuestions: questions.length,
              timeSpent: submissionData.time_spent,
              markedQuestions: markedForReview
            });
          }
        }
      ]
    );
  };

  const getOptionLetter = (index) => {
    return String.fromCharCode(65 + index);
  };

  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  // Render media components
  const renderMedia = (mediaArray, type) => {
    return mediaArray.map((mediaUrl, index) => {
      if (type === 'images') {
        return (
          <View key={index} style={styles.mediaContainer}>
            <Image
              source={{ uri: mediaUrl }}
              style={styles.image}
              resizeMode="contain"
              onError={(error) => console.log('Image load error:', error)}
            />
          </View>
        );
      } else if (type === 'videos') {
        return (
          <TouchableOpacity
            key={index}
            style={styles.mediaContainer}
            onPress={() => handleMediaPress(mediaUrl, 'video')}
          >
            <View style={styles.videoPlaceholder}>
              <Icon name="play-circle" size={48} color="#b3b72b" />
              <Text style={styles.mediaText}>Tap to play video</Text>
              <Text style={styles.mediaUrl} numberOfLines={1}>
                {mediaUrl.split('/').pop()}
              </Text>
            </View>
          </TouchableOpacity>
        );
      } else if (type === 'audio') {
        return (
          <TouchableOpacity
            key={index}
            style={styles.mediaContainer}
            onPress={() => handleMediaPress(mediaUrl, 'audio')}
          >
            <View style={styles.audioPlaceholder}>
              <Icon name="musical-notes" size={32} color="#b3b72b" />
              <Text style={styles.mediaText}>Tap to play audio</Text>
              <Text style={styles.mediaUrl} numberOfLines={1}>
                {mediaUrl.split('/').pop()}
              </Text>
            </View>
          </TouchableOpacity>
        );
      }
      return null;
    });
  };

  // Enhanced HTML renderer that excludes media elements
  const renderHTMLWithoutMedia = (html) => {
    if (!html) return null;
    
    const cleanHtml = html
      .replace(/<img[^>]*>/g, '')
      .replace(/<video[^>]*>.*?<\/video>/g, '')
      .replace(/<audio[^>]*>.*?<\/audio>/g, '')
      .trim();

    return cleanHtml ? (
      <RenderHTML
        contentWidth={width - 80}
        source={{ html: cleanHtml }}
        baseStyle={styles.htmlText}
      />
    ) : null;
  };

  if (!testData || questions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={64} color="#FF6B6B" />
          <Text style={styles.errorText}>No test data available</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const questionMedia = extractMediaFromHTML(currentQuestion?.question_text || '');
  const hasQuestionMedia = questionMedia.images.length > 0 || questionMedia.videos.length > 0 || questionMedia.audio.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#b3b72b" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitle}>
            <Text style={styles.courseTitle} numberOfLines={1}>
              {testData.test_subject?.name || 'Unknown Course'}
            </Text>
            <Text style={styles.testTitle} numberOfLines={2}>
              {testData?.test_name || 'Test'}
            </Text>
          </View>
          <View style={styles.timerContainer}>
            <Icon name="time-outline" size={16} color="#fff" />
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View style={[
              styles.progressFill, 
              { width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }
            ]} />
          </View>
          <Text style={styles.progressText}>
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Question Card */}
        <View style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <View style={styles.questionNumber}>
              <Text style={styles.questionNumberText}>
                Q{currentQuestionIndex + 1}
              </Text>
            </View>
            <TouchableOpacity 
              style={[
                styles.reviewButton, 
                markedForReview[currentQuestionIndex] && styles.reviewButtonActive
              ]}
              onPress={handleMarkReview}
            >
              <Icon 
                name={markedForReview[currentQuestionIndex] ? "bookmark" : "bookmark-outline"} 
                size={16} 
                color={markedForReview[currentQuestionIndex] ? "#fff" : "#b3b72b"} 
              />
              <Text style={[
                styles.reviewText, 
                markedForReview[currentQuestionIndex] && styles.reviewTextActive
              ]}>
                {markedForReview[currentQuestionIndex] ? 'Marked' : 'Mark for Review'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Question Media */}
          {hasQuestionMedia && (
            <View style={styles.questionMediaContainer}>
              {renderMedia(questionMedia.images, 'images')}
              {renderMedia(questionMedia.videos, 'videos')}
              {renderMedia(questionMedia.audio, 'audio')}
            </View>
          )}

          {/* Question Text */}
          <View style={styles.questionTextContainer}>
            {renderHTMLWithoutMedia(currentQuestion?.question_text || '<p>No question available</p>')}
          </View>

          {/* Marks Info */}
          <View style={styles.marksContainer}>
            <Text style={styles.marksText}>
              +{currentQuestion?.positive_mark || 1} point{currentQuestion?.positive_mark !== 1 ? 's' : ''}
            </Text>
            {currentQuestion?.negative_mark > 0 && (
              <Text style={styles.negativeMarksText}>
                -{currentQuestion.negative_mark} point{currentQuestion.negative_mark !== 1 ? 's' : ''}
              </Text>
            )}
          </View>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          <Text style={styles.optionsTitle}>Select your answer:</Text>
          
          {currentQuestion?.question_options?.map((option, index) => {
            const optionMedia = extractMediaFromHTML(option.text || '');
            const hasOptionMedia = optionMedia.images.length > 0 || optionMedia.videos.length > 0 || optionMedia.audio.length > 0;

            return (
              <TouchableOpacity
                key={option._id || index}
                style={[
                  styles.option,
                  selectedAnswers[currentQuestionIndex] === index && styles.selectedOption
                ]}
                onPress={() => handleAnswerSelect(index)}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  <View style={styles.optionLeft}>
                    <View style={[
                      styles.optionLetter,
                      selectedAnswers[currentQuestionIndex] === index && styles.optionLetterSelected
                    ]}>
                      <Text style={[
                        styles.optionLetterText,
                        selectedAnswers[currentQuestionIndex] === index && styles.optionLetterTextSelected
                      ]}>
                        {getOptionLetter(index)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.optionMain}>
                    {/* Option Media */}
                    {hasOptionMedia && (
                      <View style={styles.optionMediaContainer}>
                        {renderMedia(optionMedia.images, 'images')}
                        {renderMedia(optionMedia.videos, 'videos')}
                        {renderMedia(optionMedia.audio, 'audio')}
                      </View>
                    )}

                    {/* Option Text */}
                    <View style={styles.optionTextContainer}>
                      {renderHTMLWithoutMedia(option.text || '<p>No option text</p>')}
                    </View>
                  </View>

                  {selectedAnswers[currentQuestionIndex] === index && (
                    <View style={styles.selectedIndicator}>
                      <Icon name="checkmark-circle" size={20} color="#b3b72b" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Navigation */}
        <View style={styles.navigationContainer}>
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[
                styles.navButton, 
                styles.secondaryButton,
                isFirstQuestion && styles.disabledButton
              ]}
              onPress={handlePrevious}
              disabled={isFirstQuestion}
            >
              <Icon name="chevron-back" size={20} color={isFirstQuestion ? "#ccc" : "#666"} />
              <Text style={[
                styles.navButtonText, 
                styles.secondaryButtonText,
                isFirstQuestion && styles.disabledButtonText
              ]}>
                Previous
              </Text>
            </TouchableOpacity>

            {!isLastQuestion ? (
              <TouchableOpacity 
                style={[styles.navButton, styles.primaryButton]}
                onPress={handleNext}
              >
                <Text style={[styles.navButtonText, styles.primaryButtonText]}>
                  Next Question
                </Text>
                <Icon name="chevron-forward" size={20} color="#fff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[
                  styles.navButton, 
                  styles.submitButton,
                  isSubmitting && styles.disabledButton
                ]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                <Text style={[styles.navButtonText, styles.submitButtonText]}>
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Text>
                <Icon name="checkmark-done" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Question Navigation Dots */}
        <View style={styles.dotsContainer}>
          {questions.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dot,
                currentQuestionIndex === index && styles.activeDot,
                selectedAnswers[index] !== undefined && styles.answeredDot,
                markedForReview[index] && styles.reviewDot
              ]}
              onPress={() => setCurrentQuestionIndex(index)}
            >
              <Text style={[
                styles.dotText,
                currentQuestionIndex === index && styles.activeDotText,
                selectedAnswers[index] !== undefined && styles.answeredDotText
              ]}>
                {index + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Test Info */}
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <View style={[styles.infoDot, { backgroundColor: '#b3b72b' }]} />
            <Text style={styles.infoText}>Current</Text>
          </View>
          <View style={styles.infoItem}>
            <View style={[styles.infoDot, { backgroundColor: '#4ECDC4' }]} />
            <Text style={styles.infoText}>Answered</Text>
          </View>
          <View style={styles.infoItem}>
            <View style={[styles.infoDot, { backgroundColor: '#FF6B6B' }]} />
            <Text style={styles.infoText}>Marked</Text>
          </View>
          <View style={styles.infoItem}>
            <View style={[styles.infoDot, { backgroundColor: '#f0f0f0' }]} />
            <Text style={styles.infoText}>Unanswered</Text>
          </View>
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  courseTitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 2,
  },
  testTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'capitalize'
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  progressContainer: {
    marginTop: 5,
  },
  progressBackground: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  progressText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  questionNumber: {
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#b3b72b',
  },
  questionNumberText: {
    color: '#b3b72b',
    fontSize: 14,
    fontWeight: 'bold',
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#b3b72b',
    backgroundColor: '#fff',
  },
  reviewButtonActive: {
    backgroundColor: '#b3b72b',
  },
  reviewText: {
    color: '#b3b72b',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  reviewTextActive: {
    color: '#fff',
  },
  questionMediaContainer: {
    marginBottom: 15,
  },
  questionTextContainer: {
    marginBottom: 15,
  },
  htmlText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  marksContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  marksText: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  negativeMarksText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  optionsContainer: {
    marginBottom: 30,
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  option: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    overflow: 'hidden',
  },
  selectedOption: {
    borderColor: '#b3b72b',
    backgroundColor: '#f8fff8',
    shadowColor: '#b3b72b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  optionLeft: {
    marginRight: 12,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  optionLetterSelected: {
    backgroundColor: '#b3b72b',
    borderColor: '#b3b72b',
  },
  optionLetterText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  optionLetterTextSelected: {
    color: '#fff',
  },
  optionMain: {
    flex: 1,
  },
  optionMediaContainer: {
    marginBottom: 8,
  },
  optionTextContainer: {
    flex: 1,
  },
  selectedIndicator: {
    marginLeft: 8,
  },
  // Media Styles
  mediaContainer: {
    marginVertical: 5,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  videoPlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  audioPlaceholder: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  mediaText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  mediaUrl: {
    marginTop: 4,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  navigationContainer: {
    marginBottom: 30,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 140,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  primaryButton: {
    backgroundColor: '#b3b72b',
    shadowColor: '#b3b72b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButton: {
    backgroundColor: '#b3b72b',
    shadowColor: '#b3b72b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  secondaryButtonText: {
    color: '#666',
  },
  primaryButtonText: {
    color: '#fff',
  },
  submitButtonText: {
    color: '#fff',
  },
  disabledButtonText: {
    color: '#ccc',
  },
  dotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 30,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  dot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeDot: {
    borderColor: '#b3b72b',
    backgroundColor: '#fff',
  },
  answeredDot: {
    backgroundColor: '#4ECDC4',
  },
  reviewDot: {
    backgroundColor: '#FF6B6B',
  },
  dotText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  activeDotText: {
    color: '#b3b72b',
  },
  answeredDotText: {
    color: '#fff',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#b3b72b',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TestScreen;