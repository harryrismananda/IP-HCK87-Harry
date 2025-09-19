import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import http from "../helpers/http";
import { showError } from "../helpers/alert";
import Swal from "sweetalert2";

export const AddCoursePage = () => {
  const navigate = useNavigate();
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLanguages();
  }, []);

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

  const handleGenerateCourse = async () => {
    if (!selectedLanguage) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please select a language first'
      });
      return;
    }

    const selectedLang = languages.find(lang => lang.id === parseInt(selectedLanguage));
    if (!selectedLang) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Invalid language selection'
      });
      return;
    }

    setLoading(true);
    try {
      await http({
        method: 'POST',
        url: '/courses',
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
        data: { language: selectedLang.name }
      });

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Courses generated successfully',
        showConfirmButton: true
      }).then(() => {
        navigate('/cms/home');
      });
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button 
            className="btn btn-ghost btn-sm mb-4"
            onClick={() => navigate('/cms/home')}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to CMS Home
          </button>
          <h1 className="text-3xl font-bold mb-2">Add New Course</h1>
          <p className="text-base-content/70">Generate AI-powered courses for your selected language</p>
        </div>

        {/* Course Generation Form */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title mb-6">Course Generation</h2>
            
            <div className="form-control w-full mb-6">
              <label className="label">
                <span className="label-text font-semibold">Select Language</span>
                <span className="label-text-alt text-error">Required</span>
              </label>
              <select 
                className="select select-bordered w-full"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                disabled={loading}
              >
                <option value="">Choose a language...</option>
                {languages.map((language) => (
                  <option key={language.id} value={language.id}>
                    {language.name}
                  </option>
                ))}
              </select>
              <label className="label">
                <span className="label-text-alt">
                  The AI will generate 9 courses (3 Beginner, 3 Intermediate, 3 Advanced) for the selected language
                </span>
              </label>
            </div>

            {languages.length === 0 && (
              <div className="alert alert-info mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>No languages available. Please add a language first.</span>
              </div>
            )}

            <div className="card-actions justify-end">
              <button 
                className="btn btn-ghost"
                onClick={() => navigate('/cms/home')}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleGenerateCourse}
                disabled={loading || !selectedLanguage || languages.length === 0}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Generating Courses...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Generate Courses
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Information Card */}
        <div className="card bg-base-200 shadow-lg mt-6">
          <div className="card-body">
            <h3 className="card-title text-lg">What happens when you generate courses?</h3>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>AI will create 9 comprehensive courses for your selected language</li>
              <li>3 Beginner level courses with fundamental concepts</li>
              <li>3 Intermediate level courses building upon basics</li>
              <li>3 Advanced level courses for mastery</li>
              <li>Each course includes structured lessons with markdown content</li>
              <li>Multiple-choice questions are generated for each course</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};