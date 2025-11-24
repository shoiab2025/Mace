import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import RenderHTML from 'react-native-render-html';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const SolutionsScreen = ({ navigation, route }) => {
  const { testData, userAnswers, submissionData } = route?.params || {};
  
  console.log('Route params:', route?.params);

  // Extract data with fallbacks
  const stats = {
    total: submissionData?.total_questions || 0,
    correct: submissionData?.correct_answers || 0,
    wrong: submissionData?.wrong_answers || 0,
    skipped: submissionData?.skipped_questions || 0
  };

  const questions = testData?.test_questions || [];
  const detailedAnswers = submissionData?.detailed_answers || [];

  // Function to get option letter from index
  const getOptionLetter = (index) => {
    return String.fromCharCode(65 + index);
  };

  // Function to get user's selected answer for a question
  const getUserAnswer = (questionIndex) => {
    const detailedAnswer = detailedAnswers[questionIndex];
    if (!detailedAnswer || !detailedAnswer.selected_options || detailedAnswer.selected_options.length === 0) {
      return null;
    }
    return detailedAnswer.selected_options[0]; // Return first selected option
  };

  // Function to render question with solution
  const renderQuestionSolution = (question, index) => {
    const userAnswer = getUserAnswer(index);
    const isCorrect = detailedAnswers[index]?.is_correct || false;
    const correctOptions = question.correct_options || [];
    const solution = question.solution || 'No solution available';

    return (
      <View key={question._id || index} style={styles.questionSection}>
        <Text style={styles.questionTitle}>Q{index + 1}: {userAnswer ? (isCorrect ? 'Correct' : 'Incorrect') : 'Unattempted'}</Text>
        
        {/* Question Text */}
        <View style={styles.questionTextContainer}>
          <RenderHTML
            contentWidth={width - 40}
            source={{ html: question.question_text || '<p>Question text not available</p>' }}
            baseStyle={styles.htmlText}
          />
        </View>
        
        {/* User's Answer */}
        <View style={styles.answerSection}>
          <Text style={styles.answerLabel}>Your Answer</Text>
          <View style={[
            styles.answerStatus,
            userAnswer ? (isCorrect ? styles.correctAnswer : styles.wrongAnswer) : styles.unattemptedAnswer
          ]}>
            <Text style={[
              userAnswer ? (isCorrect ? styles.correctAnswerText : styles.wrongAnswerText) : styles.unattemptedText
            ]}>
              {userAnswer ? `Option ${userAnswer}` : '📌 Unattempted'}
            </Text>
          </View>
        </View>

        {/* Correct Solution */}
        <View style={styles.solutionSection}>
          <Text style={styles.solutionTitle}>Correct Answer</Text>
          
          {/* Show all correct options */}
          {correctOptions.map((correctOption, optionIndex) => (
            <View key={optionIndex} style={styles.solutionItem}>
              <View style={styles.checkbox}>
                <Text style={styles.checkboxText}>✓</Text>
              </View>
              <Text style={styles.solutionText}>Option {correctOption}</Text>
            </View>
          ))}

          {/* Show the actual correct option text if available */}
          {question.question_options && correctOptions.length > 0 && (
            <View style={styles.correctOptionContainer}>
              <Text style={styles.correctOptionLabel}>Correct Option Text:</Text>
              {correctOptions.map((correctOption, optionIndex) => {
                const optionIndexNum = correctOption.charCodeAt(0) - 65; // Convert A->0, B->1, etc.
                const correctOptionData = question.question_options[optionIndexNum];
                return (
                  <View key={optionIndex} style={styles.optionTextContainer}>
                    <RenderHTML
                      contentWidth={width - 80}
                      source={{ html: correctOptionData?.text || '<p>Option text not available</p>' }}
                      baseStyle={styles.optionHtmlText}
                    />
                  </View>
                );
              })}
            </View>
          )}

          {/* Explanation */}
          <View style={styles.explanation}>
            <Text style={styles.whyText}>Explanation</Text>
            <View style={styles.explanationTextContainer}>
              <RenderHTML
                contentWidth={width - 80}
                source={{ html: solution }}
                baseStyle={styles.explanationHtmlText}
              />
            </View>
          </View>
        </View>

        {/* All Options for reference */}
        <View style={styles.allOptionsSection}>
          <Text style={styles.allOptionsTitle}>All Options</Text>
          {question.question_options?.map((option, optionIndex) => {
            const optionLetter = getOptionLetter(optionIndex);
            const isUserSelected = userAnswer === optionLetter;
            const isCorrectOption = correctOptions.includes(optionLetter);
            
            return (
              <View 
                key={option._id || optionIndex} 
                style={[
                  styles.optionItem,
                  isUserSelected && isCorrectOption && styles.correctSelectedOption,
                  isUserSelected && !isCorrectOption && styles.wrongSelectedOption,
                  !isUserSelected && isCorrectOption && styles.correctOption
                ]}
              >
                <View style={styles.optionLetterContainer}>
                  <Text style={styles.optionLetterText}>{optionLetter}</Text>
                </View>
                <View style={styles.optionTextContainer}>
                  <RenderHTML
                    contentWidth={width - 80}
                    source={{ html: option.text || '<p>Option text not available</p>' }}
                    baseStyle={styles.optionHtmlText}
                  />
                </View>
                {isUserSelected && (
                  <View style={styles.selectionIndicator}>
                    <Text style={styles.selectionIndicatorText}>Your choice</Text>
                  </View>
                )}
                {isCorrectOption && !isUserSelected && (
                  <View style={styles.correctIndicator}>
                    <Text style={styles.correctIndicatorText}>Correct</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header Stats */}
        <View style={styles.header}>
          <Text style={styles.title}>Test Solutions</Text>
          <Text style={styles.subtitle}>{testData?.test_name || 'Test Name'}</Text>
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, styles.correctText]}>{stats.correct}</Text>
            <Text style={styles.statLabel}>Correct</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, styles.wrongText]}>{stats.wrong}</Text>
            <Text style={styles.statLabel}>Wrong</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, styles.skippedText]}>{stats.skipped}</Text>
            <Text style={styles.statLabel}>Skipped</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={[styles.statNumber, styles.scoreText]}>{submissionData?.score || 0}</Text>
            <Text style={styles.statLabel}>Score</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Questions and Solutions */}
        {questions.length > 0 ? (
          questions.map((question, index) => renderQuestionSolution(question, index))
        ) : (
          <View style={styles.noQuestions}>
            <Text style={styles.noQuestionsText}>No questions available</Text>
          </View>
        )}

        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back to Results</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBlock: 20
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 25,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  correctText: {
    color: '#28a745',
  },
  wrongText: {
    color: '#dc3545',
  },
  skippedText: {
    color: '#ffc107',
  },
  scoreText: {
    color: '#b3b72b',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 20,
  },
  questionSection: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  questionTextContainer: {
    marginBottom: 15,
  },
  htmlText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  answerSection: {
    marginBottom: 20,
  },
  answerLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  answerStatus: {
    padding: 12,
    borderRadius: 6,
  },
  correctAnswer: {
    backgroundColor: '#d4edda',
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  wrongAnswer: {
    backgroundColor: '#f8d7da',
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
  },
  unattemptedAnswer: {
    backgroundColor: '#e9ecef',
    borderLeftWidth: 4,
    borderLeftColor: '#6c757d',
  },
  correctAnswerText: {
    color: '#155724',
    fontWeight: '500',
  },
  wrongAnswerText: {
    color: '#721c24',
    fontWeight: '500',
  },
  unattemptedText: {
    color: '#495057',
  },
  solutionSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  solutionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  solutionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    backgroundColor: '#28a745',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  solutionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  correctOptionContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
  },
  correctOptionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  explanation: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  whyText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  explanationTextContainer: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 6,
  },
  explanationHtmlText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  allOptionsSection: {
    marginTop: 15,
  },
  allOptionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 0,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  correctSelectedOption: {
    backgroundColor: '#d4edda',
    borderColor: '#28a745',
  },
  wrongSelectedOption: {
    backgroundColor: '#f8d7da',
    borderColor: '#dc3545',
  },
  correctOption: {
    backgroundColor: '#d1ecf1',
    borderColor: '#17a2b8',
  },
  optionLetterContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#6c757d',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionLetterText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionHtmlText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  selectionIndicator: {
    backgroundColor: '#b3b72b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  selectionIndicatorText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  correctIndicator: {
    backgroundColor: '#28a745',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  correctIndicatorText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  noQuestions: {
    alignItems: 'center',
    padding: 20,
  },
  noQuestionsText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  backButton: {
    backgroundColor: '#b3b72b',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SolutionsScreen;