import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import http from "../helpers/http";
import { showError, showSuccess } from "../helpers/alert";
import { fetchCourseDetail, courseDetailActions } from "../slices/courseDetailSlice";

export const CourseDetailPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { courseId } = useParams();
  
  // Redux state
  const { data: course, loading } = useSelector(state => state.courseDetail);
  
  // Local state
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [expandedLessons, setExpandedLessons] = useState({});
  const [userPremiumStatus, setUserPremiumStatus] = useState(false); //di pindah ke redux mungkin?
  
  useEffect(() => {
    if (!courseId) return;
    
    // Clear previous course data when courseId changes
    dispatch(courseDetailActions.clearCourseDetail());
    
    // Fetch new course details
    dispatch(fetchCourseDetail(courseId));

    // Get user premium status from localStorage
    const userData = JSON.parse(localStorage.getItem('user_data'));
    setUserPremiumStatus(userData.isPremium || false);
  }, [courseId, dispatch]);

  // Check user registration when course data is loaded
  useEffect(() => {
    if (course && course.languageId) {
      const checkUserRegistration = async () => {
        try {
          const userData = JSON.parse(localStorage.getItem('user_data') || '{}');

          // Get user progress for this specific language
          const response = await http({
            method: 'GET',
            url: `/user/${userData.id}/progress/${course.languageId}`,
            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
          });

          const progress = response.data;

          // If we get any progress data for this language, user is registered
          setIsRegistered(progress && progress.length > 0);
        } catch (error) {
          console.error('Error checking user registration:', error);
          setIsRegistered(false);
        }
      };

      checkUserRegistration();
    }
  }, [course]);

  const parseCourseContent = (content) => {
    try {
      const parsed = typeof content === 'string' ? JSON.parse(content) : content;
      
      // Ensure we always have a valid structure
      const result = {
        roadmap: parsed?.roadmap || 'Course content not available',
        lessons: Array.isArray(parsed?.lessons) ? parsed.lessons : []
      };
      
      return result;
    } catch (error) {
      console.error('Error parsing course content:', error);
      return { roadmap: 'Course content not available', lessons: [] };
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return 'badge-success';
      case 'intermediate':
        return 'badge-warning';
      case 'advanced':
        return 'badge-error';
      default:
        return 'badge-ghost';
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return '🌱';
      case 'intermediate':
        return '🌿';
      case 'advanced':
        return '🌳';
      default:
        return '📚';
    }
  };

  const isCoursePremiumRestricted = (course) => {
    if (!course) return false;
    // Non-premium users can only access Beginner courses
    const difficulty = course.difficulty?.toLowerCase();
    return !userPremiumStatus && (difficulty === 'intermediate' || difficulty === 'advanced');
  };

  const toggleLessonExpansion = (lessonIndex) => {
    setExpandedLessons(prev => ({
      ...prev,
      [lessonIndex]: !prev[lessonIndex]
    }));
  };

  const handleStartQuestions = () => {
    if (!isRegistered) {
      showError("You must be registered for this language to access the questions.");
      return;
    }

    // Check premium restrictions
    if (isCoursePremiumRestricted(course)) {
      showError("This course requires a premium subscription. Please upgrade to access Intermediate and Advanced courses.");
      navigate('/payment');
      return;
    }

    navigate(`/courses/${course.id}/questions/${course.languageId}`);
  };

  const handleRegisterForLanguage = async () => {
    if (registering) return; // Prevent multiple clicks
    
    try {
      setRegistering(true);
      const userData = JSON.parse(localStorage.getItem('user_data'));

      // Check if already registered to prevent duplicate registration
      if (isRegistered) {
        showError('You are already registered for this language!');
        return;
      }

      // Create user progress for this language
      await http({
        method: 'POST',
        url: `/user/${userData.id}/progress`,
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
        data: {
          languageId: course.languageId,
          userId: userData.id
        }
      });

      setIsRegistered(true);
      showSuccess("Successfully registered for this language course!");
      
    } catch (error) {
      showError(error);
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-lg">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
          <p className="text-base-content/60 mb-6">
            The course you're looking for doesn't exist or you don't have access to it.
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

  const courseContent = parseCourseContent(course.content);
  const lessonCount = (courseContent?.lessons && Array.isArray(courseContent.lessons)) ? courseContent.lessons.length : 0;

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="bg-base-200 py-6 px-4 shadow-sm">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                className="btn btn-ghost btn-sm"
                onClick={() => navigate('/courses')}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Courses
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              {isRegistered ? (
                <div className="badge badge-success">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Registered
                </div>
              ) : (
                <div className="badge badge-warning">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Not Registered
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Course Header */}
          <div className="card bg-base-200 shadow-xl mb-8">
            <div className="card-body">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-3xl">
                      {getDifficultyIcon(course.difficulty)}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="badge badge-outline">
                        {course.Language?.name || 'Unknown Language'}
                      </span>
                      <span className={`badge ${getDifficultyColor(course.difficulty)}`}>
                        {course.difficulty}
                      </span>
                      {isCoursePremiumRestricted(course) && (
                        <span className="badge badge-warning">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          Premium Required
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <h1 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                    {course.title}
                  </h1>
                  
                  <p className="text-lg text-base-content/70 mb-6 leading-relaxed">
                    {courseContent.roadmap || 'Comprehensive course designed to enhance your language skills.'}
                  </p>

                  {/* Course Stats */}
                  <div className="flex items-center space-x-6 text-base-content/60">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span>{lessonCount} lessons</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{lessonCount * 15} min</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-3 lg:min-w-[200px]">
                  {isCoursePremiumRestricted(course) ? (
                    <div className="space-y-2">
                      <button 
                        className="btn btn-warning btn-lg"
                        onClick={() => navigate('/payment')}
                      >
                        Upgrade to Premium
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </button>
                      <p className="text-xs text-center text-base-content/60">
                        Premium required for {course.difficulty} courses
                      </p>
                    </div>
                  ) : isRegistered ? (
                    <button 
                      className="btn btn-primary btn-lg"
                      onClick={handleStartQuestions}
                    >
                      Start Questions
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  ) : (
                    <button 
                      className={`btn btn-success btn-lg ${registering ? 'loading' : ''}`}
                      onClick={handleRegisterForLanguage}
                      disabled={registering}
                    >
                      {registering ? 'Registering...' : 'Register for Language'}
                      {!registering && (
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Course Lessons */}
          {courseContent?.lessons && Array.isArray(courseContent.lessons) && courseContent.lessons.length > 0 && (
            <div className="card bg-base-200 shadow-xl mb-8">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-6">Course Curriculum</h2>
                <div className="space-y-4">
                  {courseContent.lessons.map((lesson, index) => (
                    <div key={index} className="card bg-base-100 shadow-sm">
                      <div className="card-body p-0">
                        <div 
                          className="flex items-center justify-between p-4 cursor-pointer hover:bg-base-200 transition-colors"
                          onClick={() => toggleLessonExpansion(index)}
                        >
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                              <span className="font-bold text-primary">
                                {lesson?.order || index + 1}
                              </span>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{lesson?.title || `Lesson ${index + 1}`}</h3>
                              {lesson?.description && (
                                <p className="text-base-content/60 mt-1 text-sm">{lesson.description}</p>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-base-content/60">
                              <div className="flex items-center space-x-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{lesson?.duration || '15'} min</span>
                              </div>
                              <svg 
                                className={`w-5 h-5 transition-transform ${expandedLessons[index] ? 'rotate-180' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        
                        {/* Lesson Content - Accordion */}
                        {expandedLessons[index] && (
                          <div className="px-4 pb-4 border-t border-base-200">
                            <div className="pt-4">
                              {lesson?.content ? (
                                <div className="prose prose-sm max-w-none text-base-content">
                                  <div className="space-y-4">
                                    {lesson.content.split('\n\n').map((paragraph, pIndex) => {
                                      const trimmedParagraph = paragraph.trim();
                                      if (!trimmedParagraph) return null;
                                      
                                      // Handle headers (##, ###)
                                      if (trimmedParagraph.startsWith('### ')) {
                                        return (
                                          <h4 key={pIndex} className="text-lg font-semibold text-primary mt-6 mb-3">
                                            {trimmedParagraph.replace('### ', '')}
                                          </h4>
                                        );
                                      }
                                      if (trimmedParagraph.startsWith('## ')) {
                                        return (
                                          <h3 key={pIndex} className="text-xl font-bold text-primary mt-8 mb-4">
                                            {trimmedParagraph.replace('## ', '')}
                                          </h3>
                                        );
                                      }
                                      if (trimmedParagraph.startsWith('# ')) {
                                        return (
                                          <h2 key={pIndex} className="text-2xl font-bold text-primary mt-10 mb-5">
                                            {trimmedParagraph.replace('# ', '')}
                                          </h2>
                                        );
                                      }
                                      
                                      // Handle bullet points
                                      if (trimmedParagraph.includes('\n- ') || trimmedParagraph.startsWith('- ')) {
                                        const listItems = trimmedParagraph.split('\n').filter(line => line.trim().startsWith('- '));
                                        return (
                                          <ul key={pIndex} className="list-disc list-inside space-y-2 ml-4">
                                            {listItems.map((item, itemIndex) => (
                                              <li key={itemIndex} className="text-base-content/80">
                                                {item.replace('- ', '')}
                                              </li>
                                            ))}
                                          </ul>
                                        );
                                      }
                                      
                                      // Handle numbered lists
                                      if (trimmedParagraph.match(/^\d+\. /) || trimmedParagraph.includes('\n1. ')) {
                                        const listItems = trimmedParagraph.split('\n').filter(line => line.trim().match(/^\d+\. /));
                                        return (
                                          <ol key={pIndex} className="list-decimal list-inside space-y-2 ml-4">
                                            {listItems.map((item, itemIndex) => (
                                              <li key={itemIndex} className="text-base-content/80">
                                                {item.replace(/^\d+\. /, '')}
                                              </li>
                                            ))}
                                          </ol>
                                        );
                                      }
                                      
                                      // Handle code blocks
                                      if (trimmedParagraph.startsWith('```') && trimmedParagraph.endsWith('```')) {
                                        const codeContent = trimmedParagraph.slice(3, -3);
                                        return (
                                          <div key={pIndex} className="mockup-code bg-base-300 my-4">
                                            <pre className="text-sm"><code>{codeContent}</code></pre>
                                          </div>
                                        );
                                      }
                                      
                                      // Handle inline code
                                      if (trimmedParagraph.includes('`')) {
                                        const parts = trimmedParagraph.split('`');
                                        return (
                                          <p key={pIndex} className="text-base-content/80 leading-relaxed">
                                            {parts.map((part, partIndex) => 
                                              partIndex % 2 === 0 ? 
                                                part : 
                                                <code key={partIndex} className="bg-base-300 px-1 py-0.5 rounded text-sm font-mono">{part}</code>
                                            )}
                                          </p>
                                        );
                                      }
                                      
                                      // Handle bold text
                                      if (trimmedParagraph.includes('**')) {
                                        const parts = trimmedParagraph.split('**');
                                        return (
                                          <p key={pIndex} className="text-base-content/80 leading-relaxed">
                                            {parts.map((part, partIndex) => 
                                              partIndex % 2 === 0 ? 
                                                part : 
                                                <strong key={partIndex} className="font-semibold text-base-content">{part}</strong>
                                            )}
                                          </p>
                                        );
                                      }
                                      
                                      // Handle italic text
                                      if (trimmedParagraph.includes('*') && !trimmedParagraph.includes('**')) {
                                        const parts = trimmedParagraph.split('*');
                                        return (
                                          <p key={pIndex} className="text-base-content/80 leading-relaxed">
                                            {parts.map((part, partIndex) => 
                                              partIndex % 2 === 0 ? 
                                                part : 
                                                <em key={partIndex} className="italic">{part}</em>
                                            )}
                                          </p>
                                        );
                                      }
                                      
                                      // Regular paragraph
                                      return (
                                        <p key={pIndex} className="text-base-content/80 leading-relaxed">
                                          {trimmedParagraph}
                                        </p>
                                      );
                                    })}
                                  </div>
                                </div>
                              ) : (
                                <p className="text-base-content/60 italic">Lesson content will be available soon.</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Premium Restriction Warning */}
          {isCoursePremiumRestricted(course) && (
            <div className="alert alert-warning mb-8">
              <svg className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              <div>
                <h3 className="font-bold">Premium Subscription Required</h3>
                <div className="text-xs">This is a {course.difficulty} level course that requires a premium subscription. Upgrade now to access all Intermediate and Advanced courses!</div>
              </div>
              <button 
                className="btn btn-sm btn-warning"
                onClick={() => navigate('/payment')}
              >
                Upgrade Now
              </button>
            </div>
          )}

          {/* Registration Warning */}
          {!isRegistered && !isCoursePremiumRestricted(course) && (
            <div className="alert alert-warning mb-8">
              <svg className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              <div>
                <h3 className="font-bold">Registration Required</h3>
                <div className="text-xs">You need to register for this language to access the course questions and track your progress.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};