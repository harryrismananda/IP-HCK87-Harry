import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import http from "../helpers/http";
import { showError, showSuccess } from "../helpers/alert";

export const UserCoursePage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [userProgress, setUserProgress] = useState([]);
  const [registering, setRegistering] = useState(null); // Track which course is being registered

  useEffect(() => {
    fetchLanguages();
    fetchUserProgress();
    fetchAllCourses()
    setLoading(false); // Only load languages initially
  }, []);

  const fetchCoursesByLanguage = async (languageId) => {
    setCoursesLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` }
      
      const response = await http({
        method: 'GET',
        url: `/courses/language/${languageId}`,
        headers
      });
      setCourses(response.data);
    } catch (error) {
      showError(error);
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const userData = JSON.parse(localStorage.getItem('user_data') || '{}');

      // Get all languages first to check progress for each
      const languagesResponse = await http({
        method: 'GET',
        url: `/languages`,
        headers: { Authorization: `Bearer ${token}` }
      });

      const allLanguages = languagesResponse.data;
      const progressData = [];

      // Check progress for each language
      for (const language of allLanguages) {
        try {
          const response = await http({
            method: 'GET',
            url: `/user/${userData.id}/progress/${language.id}`,
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data && response.data.length > 0) {
            progressData.push({
              languageId: language.id,
              progress: response.data
            });
          }
        } catch {
          // No progress for this language, which is fine
          console.log(`No progress for language ${language.id}`);
        }
      }

      setUserProgress(progressData);
    } catch (error) {
      console.error('Error fetching user progress:', error);
      showError(error);
      setUserProgress([]);
    }
  };

  const fetchLanguages = async () => {
    try {
      const response = await http({
        method: 'GET',
        url: '/languages',
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      setLanguages(response.data);
    } catch (error) {
      showError(error);
    }
  };

  const fetchAllCourses = async () => {
    try {
      const response = await http({
        method: "GET",
        url:`/courses`,
        headers: {Authorization: `Bearer ${localStorage.access_token}`}
      })
      setCourses(response.data)
    } catch (error) {
      showError(error)
    }
  }
  // console.log(courses)
  const handleLanguageSelect = (languageId) => {
    setSelectedLanguage(languageId);
    if (languageId !== "all") {
      fetchCoursesByLanguage(languageId);
    } else {
      fetchAllCourses()
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

  const filteredCourses = courses; // No client-side filtering needed since we fetch by language
  // console.log(filteredCourses)
  const getLanguageName = (languageId) => {
    const language = languages.find(lang => lang.id === languageId);
    return language?.name || 'Unknown';
  };

  const parseCourseContent = (content) => {
    try {
      return typeof content === 'string' ? JSON.parse(content) : content;
    } catch {
      return { roadmap: 'Course content not available', lessons: [] };
    }
  };

  const isUserRegisteredForLanguage = (languageId) => {
    return userProgress.some(progressItem => 
      progressItem.languageId === parseInt(languageId)
    );
  };

  const getActionButton = (course) => {
    const isRegistered = isUserRegisteredForLanguage(course.languageId);
    const isCurrentlyRegistering = registering === course.id;
    
    if (!isRegistered) {
      return {
        text: isCurrentlyRegistering ? "Registering..." : "Register for Language",
        action: () => handleRegisterForLanguage(course),
        className: `btn btn-success w-full ${isCurrentlyRegistering ? 'loading' : ''}`,
        disabled: isCurrentlyRegistering
      };
    }
    
    return {
      text: "View Course",
      action: () => handleViewCourse(course),
      className: "btn btn-primary w-full",
      disabled: false
    };
  };

  const handleRegisterForLanguage = async (course) => {
    try {
      setRegistering(course.id); // Set loading state for this specific course
      
      const userData = JSON.parse(localStorage.getItem('user_data') || '{}');

      // Check if already registered to prevent duplicate registration
      if (isUserRegisteredForLanguage(course.languageId)) {
        showError('You are already registered for this language!');
        return;
      }

      await http({
        method: 'POST',
        url: `/user/${userData.id}/progress`,
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
        data: {
          languageId: course.languageId,
          userId: userData.id
        }
      });

      showSuccess(`Successfully registered for ${course.Language?.name || 'this language'}!`);
      
      // Update the userProgress state immediately to reflect the registration
      setUserProgress(prev => [
        ...prev,
        {
          languageId: parseInt(course.languageId),
          progress: [{ languageId: parseInt(course.languageId), userId: userData.id }]
        }
      ]);
      
      // Also refresh from server to ensure consistency
      await fetchUserProgress();
    } catch (error) {
      showError(error);
    } finally {
      setRegistering(null); // Clear loading state
    }
  };

  const handleViewCourse = (course) => {
    navigate(`/course/${course.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-lg">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Explore Our <span className="text-primary">Courses</span>
            </h1>
            <p className="text-lg md:text-xl text-base-content/70 mb-8">
              Choose from our carefully crafted language courses designed to take you from beginner to fluent
            </p>
            
            {/* Language Filter */}
            <div className="flex flex-wrap justify-center gap-3">
              <button
                className={`btn btn-sm ${selectedLanguage === "all" ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => handleLanguageSelect("all")}
              >
                All Languages
              </button>
              {languages.map((language) => (
                <button
                  key={language.id}
                  className={`btn btn-sm ${selectedLanguage === language.id.toString() ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => handleLanguageSelect(language.id.toString())}
                >
                  {language.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          {coursesLoading ? (
            <div className="text-center py-16">
              <span className="loading loading-spinner loading-lg text-primary"></span>
              <p className="mt-4 text-lg">Loading courses...</p>
            </div>
          ) : null}


          {selectedLanguage === "all" ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filteredCourses.map((course) => {
                const courseContent = parseCourseContent(course.content);
                const lessonCount = courseContent.lessons?.length || 0;
                
                return (
                  <div key={course.id} className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
                    <div className="card-body p-6">
                      {/* Course Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">
                            {getDifficultyIcon(course.difficulty)}
                          </span>
                          <span className="badge badge-outline">
                            {getLanguageName(course.languageId)}
                          </span>
                          {isUserRegisteredForLanguage(course.languageId) && (
                            <span className="badge badge-success badge-sm">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Registered
                            </span>
                          )}
                        </div>
                        <span className={`badge ${getDifficultyColor(course.difficulty)}`}>
                          {course.difficulty}
                        </span>
                      </div>

                      {/* Course Title */}
                      <h3 className="card-title text-xl mb-3 leading-tight">
                        {course.title}
                      </h3>

                      {/* Course Description */}
                      <p className="text-base-content/70 text-sm leading-relaxed mb-4 line-clamp-3">
                        {courseContent.roadmap || 'Comprehensive course designed to enhance your language skills.'}
                      </p>

                      {/* Course Stats */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4 text-sm text-base-content/60">
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <span>{lessonCount} lessons</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{lessonCount * 15} min</span>
                          </div>
                        </div>
                      </div>

                      {/* Lessons Preview */}
                      {courseContent.lessons && courseContent.lessons.length > 0 && (
                        <div className="mb-6">
                          <h4 className="font-semibold text-sm mb-2">Course Contents:</h4>
                          <div className="space-y-1">
                            {courseContent.lessons.slice(0, 3).map((lesson, index) => (
                              <div key={index} className="text-xs text-base-content/60 flex items-center space-x-2">
                                <span className="w-4 h-4 bg-primary/20 rounded-full flex items-center justify-center text-[10px] font-bold">
                                  {lesson.order || index + 1}
                                </span>
                                <span className="truncate">{lesson.title}</span>
                              </div>
                            ))}
                            {courseContent.lessons.length > 3 && (
                              <div className="text-xs text-base-content/40">
                                +{courseContent.lessons.length - 3} more lessons...
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="card-actions justify-end">
                        {(() => {
                          const button = getActionButton(course);
                          return (
                            <button 
                              className={button.className}
                              onClick={button.action}
                              disabled={button.disabled}
                            >
                              {button.text}
                              {!button.disabled && (
                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                              )}
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            // <div className="text-center py-16">
            //   <div className="text-6xl mb-4">🌍</div>
            //   <h3 className="text-2xl font-bold mb-2">Select a Language</h3>
            //   <p className="text-base-content/60">
            //     Choose a specific language above to see available courses. This helps us provide you with targeted learning content.
            //   </p>
            // </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-2xl font-bold mb-2">No courses available</h3>
              <p className="text-base-content/60">
                No courses found for the selected language. Check back soon for new content!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filteredCourses.map((course) => {
                const courseContent = parseCourseContent(course.content);
                const lessonCount = courseContent.lessons?.length || 0;
                
                return (
                  <div key={course.id} className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
                    <div className="card-body p-6">
                      {/* Course Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">
                            {getDifficultyIcon(course.difficulty)}
                          </span>
                          <span className="badge badge-outline">
                            {getLanguageName(course.languageId)}
                          </span>
                          {isUserRegisteredForLanguage(course.languageId) && (
                            <span className="badge badge-success badge-sm">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Registered
                            </span>
                          )}
                        </div>
                        <span className={`badge ${getDifficultyColor(course.difficulty)}`}>
                          {course.difficulty}
                        </span>
                      </div>

                      {/* Course Title */}
                      <h3 className="card-title text-xl mb-3 leading-tight">
                        {course.title}
                      </h3>

                      {/* Course Description */}
                      <p className="text-base-content/70 text-sm leading-relaxed mb-4 line-clamp-3">
                        {courseContent.roadmap || 'Comprehensive course designed to enhance your language skills.'}
                      </p>

                      {/* Course Stats */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4 text-sm text-base-content/60">
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <span>{lessonCount} lessons</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{lessonCount * 15} min</span>
                          </div>
                        </div>
                      </div>

                      {/* Lessons Preview */}
                      {courseContent.lessons && courseContent.lessons.length > 0 && (
                        <div className="mb-6">
                          <h4 className="font-semibold text-sm mb-2">Course Contents:</h4>
                          <div className="space-y-1">
                            {courseContent.lessons.slice(0, 3).map((lesson, index) => (
                              <div key={index} className="text-xs text-base-content/60 flex items-center space-x-2">
                                <span className="w-4 h-4 bg-primary/20 rounded-full flex items-center justify-center text-[10px] font-bold">
                                  {lesson.order || index + 1}
                                </span>
                                <span className="truncate">{lesson.title}</span>
                              </div>
                            ))}
                            {courseContent.lessons.length > 3 && (
                              <div className="text-xs text-base-content/40">
                                +{courseContent.lessons.length - 3} more lessons...
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="card-actions justify-end">
                        {(() => {
                          const button = getActionButton(course);
                          return (
                            <button 
                              className={button.className}
                              onClick={button.action}
                              disabled={button.disabled}
                            >
                              {button.text}
                              {!button.disabled && (
                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                              )}
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 lg:py-16 bg-gradient-to-r from-secondary/10 to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Can't find the perfect course?
            </h2>
            <p className="text-base-content/70 mb-6">
              We're constantly adding new courses and content. Sign up to get notified when new courses become available.
            </p>
            <button className="btn btn-primary">
              Get Notified
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-12" />
              </svg>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};