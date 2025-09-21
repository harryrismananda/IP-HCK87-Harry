import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import http from "../helpers/http";
import { showError, showSuccess } from "../helpers/alert";

export const CourseQuestionPage = () => {
  const navigate = useNavigate();
  const { courseId, languageId } = useParams();
  const [course, setCourse] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [userAnswers, setUserAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCourseAndQuestions = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch course details
        const courseResponse = await http({
          method: 'GET',
          url: `/courses/${courseId}`,
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourse(courseResponse.data);

        // Fetch questions for this specific course
        const questionsResponse = await http({
          method: 'GET',
          url: `/questions/course/${courseId}`,
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setQuestions(questionsResponse.data);
        if (questionsResponse.data.length > 0) {
          setCurrentQuestionIndex(0);
        }
      } catch (error) {
        showError(error);
        navigate('/courses');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseAndQuestions();
    }
  }, [courseId, navigate]);

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (!selectedAnswer) {
      showError("Please select an answer before proceeding.");
      return;
    }

    const updatedAnswers = {
      ...userAnswers,
      [currentQuestionIndex]: selectedAnswer
    };
    setUserAnswers(updatedAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer("");
    } else {
      calculateScore(updatedAnswers);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(userAnswers[currentQuestionIndex - 1] || "");
    }
  };

  const calculateScore = (answers) => {
    let correctAnswers = 0;
    questions.forEach((question, index) => {
      if (answers[index] === question.answer) {
        correctAnswers++;
      }
    });
    
    const finalScore = Math.round((correctAnswers / questions.length) * 100);
    setScore(finalScore);
    setShowResult(true);
    submitProgress(finalScore);
  };

  const submitProgress = async (finalScore) => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
      
      if (!token || !userData.id || !languageId) {
        showError('User not authenticated or language data missing');
        return;
      }
      
      // Update progress for this course's language
      await http({
        method: 'PUT',
        url: `/user/${userData.id}/progress/${languageId}`,
        headers: { Authorization: `Bearer ${token}` },
        data: {
          progress: {
            score: finalScore,
            completed: finalScore >= 70,
            completedAt: new Date().toISOString()
          }
        }
      });
      
      if (finalScore >= 70) {
        showSuccess(`Congratulations! You passed with ${finalScore}%`);
      }
    } catch (error) {
      showError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer("");
    setUserAnswers({});
    setShowResult(false);
    setScore(0);
  };

  const parseChoices = (choices) => {
    try {
      return typeof choices === 'string' ? JSON.parse(choices) : choices;
    } catch {
      return {};
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-lg">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold mb-2">No Questions Available</h2>
          <p className="text-base-content/60 mb-6">
            This course doesn't have any questions yet. Check back later or try another course.
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/courses')}
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const choices = parseChoices(currentQuestion?.choices);
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  if (showResult) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center px-4">
        <div className="card w-full max-w-2xl bg-base-200 shadow-xl">
          <div className="card-body text-center">
            <div className="mb-6">
              {score >= 70 ? (
                <div className="text-6xl mb-4">🎉</div>
              ) : (
                <div className="text-6xl mb-4">📚</div>
              )}
            </div>
            
            <h2 className="card-title text-3xl justify-center mb-4">
              Quiz Complete!
            </h2>
            
            <div className={`text-4xl font-bold mb-4 ${score >= 70 ? 'text-success' : 'text-warning'}`}>
              {score}%
            </div>
            
            <p className="text-lg mb-6">
              You answered {Object.values(userAnswers).filter((answer, index) => 
                answer === questions[index]?.answer
              ).length} out of {questions.length} questions correctly.
            </p>
            
            {score >= 70 ? (
              <div className="alert alert-success mb-6">
                <svg className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Congratulations! You passed the course!</span>
              </div>
            ) : (
              <div className="alert alert-warning mb-6">
                <svg className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
                <span>You need 70% or higher to pass. Keep practicing!</span>
              </div>
            )}
            
            <div className="card-actions justify-center">
              <button 
                className="btn btn-primary"
                onClick={restartQuiz}
                disabled={submitting}
              >
                Try Again
              </button>
              <button 
                className="btn btn-outline"
                onClick={() => navigate('/courses')}
              >
                Back to Courses
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="bg-base-200 py-4 px-4 shadow-sm">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">
                {course?.title || 'Course Questions'}
              </h1>
              <p className="text-sm text-base-content/60">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            <button 
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/courses')}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Exit
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-2">
        <div className="container mx-auto">
          <div className="w-full bg-base-300 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="text-2xl font-bold mb-6 leading-relaxed">
                {currentQuestion?.questionName || currentQuestion?.prompt}
              </h2>

              <div className="space-y-3">
                {Object.entries(choices).map(([key, value]) => (
                  <div
                    key={key}
                    className={`card cursor-pointer transition-all hover:shadow-md ${
                      selectedAnswer === key
                        ? 'bg-primary text-primary-content border-primary'
                        : 'bg-base-100 hover:bg-base-300'
                    }`}
                    onClick={() => handleAnswerSelect(key)}
                  >
                    <div className="card-body p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                          selectedAnswer === key
                            ? 'bg-primary-content text-primary border-primary-content'
                            : 'border-base-content/30'
                        }`}>
                          {key}
                        </div>
                        <span className="text-lg">{value}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card-actions justify-between mt-8">
                <button 
                  className="btn btn-outline"
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                <button 
                  className="btn btn-primary"
                  onClick={handleNextQuestion}
                  disabled={!selectedAnswer}
                >
                  {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};