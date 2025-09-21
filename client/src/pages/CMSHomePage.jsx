


import  { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { showError } from "../helpers/alert";
import http from "../helpers/http";
import { AddLanguageModal } from "../components/AddLanguageModal";

export const CMSHomePage = () => {
  const navigate = useNavigate();

  // Sample language data - replace with actual API call
  const [languages, setLanguages] = useState([]);

  // Sample course data - replace with actual API call
  const [courses, setCourses] = useState([]);

  // Modal states
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  const fetchLanguages = async () => {
    try {
      const response = await http({
        method: 'get',
        url: '/languages',
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      })
      setLanguages(response.data)
    } catch (error) {
      showError(error)
    }
  }

  const fetchCourses = async () => {
    try {
      const response = await http({
        method: 'get',
        url: '/courses',
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      })
      setCourses(response.data)
    } catch (error) {
      showError(error)
    }
  }

useEffect(() => {
  fetchLanguages()
}, [])

useEffect(() => {
  fetchCourses()
}, [])

  const handleLanguageAdded = (newLanguage) => {
    setLanguages(prev => [...prev, newLanguage]);
  };

  const getDifficultyBadge = (difficulty) => {
    const badges = {
      "Beginner": "badge-success",
      "Intermediate": "badge-warning", 
      "Advanced": "badge-error"
    };
    return badges[difficulty] || "badge-ghost";
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Languages Table */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h2 className="card-title text-xl lg:text-2xl">Language Management</h2>
            <button 
              className="btn btn-primary btn-sm lg:btn-md"
              onClick={() => setIsLanguageModalOpen(true)}
            >
              Add New Language
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th className="text-sm lg:text-base font-semibold">ID</th>
                  <th className="text-sm lg:text-base font-semibold">Name</th>
                  <th className="text-sm lg:text-base font-semibold hidden sm:table-cell">Created At</th>
                  <th className="text-sm lg:text-base font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {languages.map((language) => (
                  <tr key={language.id} className="hover:bg-base-200">
                    <td className="font-medium text-sm lg:text-base">{language.id}</td>
                    <td className="font-semibold text-sm lg:text-base">{language.name}</td>
                    <td className="text-xs lg:text-sm text-base-content/70 hidden sm:table-cell">
                      {new Date(language.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex gap-1 lg:gap-2">
                        <button onClick={async () => {
                          try {
                            await http ({
                              method:"DELETE",
                              url:`/languages/${language.id}`,
                              headers:{Authorization: `Bearer ${localStorage.getItem(`access_token`)}`}
                            })
                            fetchLanguages()
                          } catch (error) {
                            showError(error)
                          }
                        }} className="btn btn-ghost btn-xs text-error">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {languages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-base-content/60">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                <p className="text-lg font-medium mb-2">No languages found</p>
                <p className="text-sm">Add your first language to get started</p>
              </div>
              <button 
                className="btn btn-primary mt-4"
                onClick={() => setIsLanguageModalOpen(true)}
              >
                Add First Language
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Courses Table */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h2 className="card-title text-xl lg:text-2xl">Course Management</h2>
            <button 
              className="btn btn-primary btn-sm lg:btn-md"
              onClick={() => navigate('/cms/add-course')}
            >
              Add New Course
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th className="text-sm lg:text-base font-semibold">ID</th>
                  <th className="text-sm lg:text-base font-semibold">Title</th>
                  <th className="text-sm lg:text-base font-semibold hidden lg:table-cell">Language</th>
                  <th className="text-sm lg:text-base font-semibold">Difficulty</th>
                  <th className="text-sm lg:text-base font-semibold hidden sm:table-cell">Created At</th>
                  <th className="text-sm lg:text-base font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-base-200">
                    <td className="font-medium text-sm lg:text-base">{course.id}</td>
                    <td className="font-semibold text-sm lg:text-base">{course.title}</td>
                    <td className="hidden lg:table-cell">
                      <span className="badge badge-outline text-xs">
                        {languages.find(lang => lang.id === course.languageId)?.name}
                      </span>
                    </td>
                    <td>
                      <span className={`badge text-xs ${getDifficultyBadge(course.difficulty)}`}>
                        {course.difficulty}
                      </span>
                    </td>
                   
                    <td className="text-xs lg:text-sm text-base-content/70 hidden sm:table-cell">
                      {new Date(course.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex flex-col lg:flex-row gap-1 lg:gap-2">
                        <button onClick={async () => {
                          try {
                            await http({
                              method:"DELETE",
                              url:`/courses/${course.id}`,
                              headers:{Authorization:`Bearer ${localStorage.getItem(`access_token`)}`}
                            })
                            fetchCourses()
                          } catch (error) {
                            showError(error)
                          }
                        }} className="btn btn-ghost btn-xs text-error">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {courses.length === 0 && (
            <div className="text-center py-12">
              <div className="text-base-content/60">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="text-lg font-medium mb-2">No courses found</p>
                <p className="text-sm">Create your first course to start teaching</p>
              </div>
              <button 
                className="btn btn-primary mt-4"
                onClick={() => navigate('/cms/add-course')}
              >
                Add First Course
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Language Modal */}
      <AddLanguageModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        onLanguageAdded={handleLanguageAdded}
      />
    </div>
  );
};
