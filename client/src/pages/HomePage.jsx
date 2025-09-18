

import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import http from "../helpers/http";
import { showError, successEnrollment } from "../helpers/alert";
import { fetchLanguage } from "../slices/languageSlice";

export const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const { data: languages, loading: languagesLoading } = useSelector(state => state.language);
  
  // Local state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchLanguage());
  }, [dispatch]);

  const handleEnrollment = async (languageId) => {
    // Prevent multiple simultaneous enrollments
    if (loading) return;
    
    setLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem('user_data') || '{}');

      // Find the selected language name for the success message
      const language = languages.find(lang => lang.id === languageId);
      const languageName = language?.name || 'this language';

      // Create user progress for this language
      // The backend will handle duplicate checking and return appropriate error
      await http({
        method: 'POST',
        url: `/user/${userData.id}/progress`,
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
        data: { 
          languageId: languageId,
          userId: userData.id
        }
      });

      // Show success message with language name
      successEnrollment(languageName);
      setIsModalOpen(false);
      setSelectedLanguage(null); // Reset selection
      navigate('/courses');
    } catch (error) {
      console.error('Enrollment error:', error);
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero min-h-screen bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10">
        <div className="hero-content text-center px-4">
          <div className="max-w-4xl">
            <div className="mb-8">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Master Languages with
              </h1>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary mt-2">
                BiblioLex
              </h1>
            </div>
            
            <p className="text-lg md:text-xl lg:text-2xl mb-8 text-base-content/80 leading-relaxed max-w-3xl mx-auto">
              Unlock the world through language learning. Our AI-powered platform makes mastering new languages 
              <span className="text-primary font-semibold"> engaging, effective, and enjoyable</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button 
                className="btn btn-primary btn-lg px-8 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                onClick={() => !loading && setIsModalOpen(true)}
                disabled={loading}
              >
                Start Learning Today
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <button 
                className="btn btn-outline btn-lg px-8 text-lg"
                onClick={() => navigate('/courses')}
                disabled={loading}
              >
                Explore Courses
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="stat bg-base-100/50 backdrop-blur-sm rounded-lg p-4">
                <div className="stat-value text-2xl md:text-3xl text-primary">15+</div>
                <div className="stat-title text-sm">Languages</div>
              </div>
              <div className="stat bg-base-100/50 backdrop-blur-sm rounded-lg p-4">
                <div className="stat-value text-2xl md:text-3xl text-secondary">1K+</div>
                <div className="stat-title text-sm">Students</div>
              </div>
              <div className="stat bg-base-100/50 backdrop-blur-sm rounded-lg p-4">
                <div className="stat-value text-2xl md:text-3xl text-accent">95%</div>
                <div className="stat-title text-sm">Success Rate</div>
              </div>
              <div className="stat bg-base-100/50 backdrop-blur-sm rounded-lg p-4">
                <div className="stat-value text-2xl md:text-3xl text-info">24/7</div>
                <div className="stat-title text-sm">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-base-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Why Choose <span className="text-primary">BiblioLex</span>?
            </h2>
            <p className="text-lg md:text-xl text-base-content/70 max-w-2xl mx-auto">
              Experience language learning like never before with our cutting-edge features
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
              <div className="card-body">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="card-title text-xl mb-2">AI-Powered Learning</h3>
                <p className="text-base-content/70">
                  Personalized lessons adapted to your learning style and pace with advanced AI technology.
                </p>
              </div>
            </div>

            <div className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
              <div className="card-body">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="card-title text-xl mb-2">Interactive Courses</h3>
                <p className="text-base-content/70">
                  Engaging lessons with real-world scenarios, quizzes, and interactive exercises.
                </p>
              </div>
            </div>

            <div className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
              <div className="card-body">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="card-title text-xl mb-2">Fast Progress</h3>
                <p className="text-base-content/70">
                  See real results in weeks, not years. Our proven methodology accelerates your learning.
                </p>
              </div>
            </div>

            <div className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
              <div className="card-body">
                <div className="w-16 h-16 bg-info/10 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="card-title text-xl mb-2">Flexible Schedule</h3>
                <p className="text-base-content/70">
                  Learn at your own pace, anytime, anywhere. Perfect for busy lifestyles.
                </p>
              </div>
            </div>

            <div className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
              <div className="card-body">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h3 className="card-title text-xl mb-2">Certified Progress</h3>
                <p className="text-base-content/70">
                  Earn certificates and track your achievements as you master each language level.
                </p>
              </div>
            </div>

            <div className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
              <div className="card-body">
                <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="card-title text-xl mb-2">Community Support</h3>
                <p className="text-base-content/70">
                  Join a vibrant community of learners and native speakers for practice and support.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto text-primary-content">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Join thousands of successful language learners and unlock your potential today.
            </p>
            <button 
              className="btn btn-accent btn-lg px-8 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              onClick={() => !loading && setIsModalOpen(true)}
              disabled={loading}
            >
              Get Started for Free
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Language Selection Modal */}
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-2xl mb-6 text-center">Choose Your Language</h3>
            <p className="text-center text-base-content/70 mb-8">
              Select the language you'd like to start learning today
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {languages.map((language) => (
                <div
                  key={language.id}
                  className={`card bg-base-200 hover:bg-primary/10 cursor-pointer transition-all border-2 ${
                    selectedLanguage?.id === language.id ? 'border-primary bg-primary/10' : 'border-transparent'
                  } ${loading ? 'pointer-events-none opacity-50' : ''}`}
                  onClick={() => !loading && setSelectedLanguage(language)}
                >
                  <div className="card-body p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-primary-content font-bold">
                        {language.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">{language.name}</h4>
                        <p className="text-sm text-base-content/60">Start from basics</p>
                      </div>
                      {selectedLanguage?.id === language.id && (
                        <div className="ml-auto">
                          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-action">
              <button 
                className="btn btn-ghost" 
                onClick={() => {
                  if (!loading) {
                    setIsModalOpen(false);
                    setSelectedLanguage(null);
                  }
                }}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className={`btn btn-primary ${loading ? 'loading' : ''}`}
                onClick={() => selectedLanguage && handleEnrollment(selectedLanguage.id)}
                disabled={!selectedLanguage || loading}
              >
                {loading ? 'Enrolling...' : 'Start Learning'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
