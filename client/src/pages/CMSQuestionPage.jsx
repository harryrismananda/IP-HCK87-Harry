import { useEffect, useState } from "react";
import { showError } from "../helpers/alert";
import http from "../helpers/http";

export const CMSQuestionPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await http({
          method: "DELETE",
          url: `/questions/${id}`,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        // Refresh the questions list after deletion
        fetchQuestions();
      } catch (error) {
        showError(error);
      }
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await http({
        method: "GET",
        url: "/questions",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setQuestions(response.data);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyBadge = (difficulty) => {
    const badges = {
      1: "badge-success",
      2: "badge-warning",
      3: "badge-error",
    };
    const labels = {
      1: "Beginner",
      2: "Intermediate",
      3: "Advanced",
    };
    return {
      class: badges[difficulty] || "badge-ghost",
      label: labels[difficulty] || "Unknown",
    };
  };

  
  useEffect(() => {
    fetchQuestions();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 p-4 lg:p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="loading loading-spinner loading-lg text-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6">
      {/* Header Section */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="card-title text-xl lg:text-2xl">
                Question Management
              </h2>
              <p className="text-sm text-base-content/60 mt-1">
                Manage questions for all courses and languages
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
            <div className="stat bg-base-200 rounded-lg p-3 lg:p-4">
              <div className="stat-title text-xs lg:text-sm">
                Total Questions
              </div>
              <div className="stat-value text-lg lg:text-2xl text-primary">
                {questions.length}
              </div>
            </div>
                       
          </div>

          {/* Questions Table */}
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th className="text-xs lg:text-sm font-semibold">ID</th>
                  <th className="text-xs lg:text-sm font-semibold">Question</th>
                  <th className="text-xs lg:text-sm font-semibold hidden lg:table-cell">
                    Course
                  </th>
                  <th className="text-xs lg:text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((question) => {
                  const difficultyBadge = getDifficultyBadge(
                    question.difficulty
                  );
                  return (
                    <tr key={question.id} className="hover:bg-base-200">
                      <td className="font-medium text-sm">{question.id}</td>
                      <td className="max-w-xs">
                        <div
                          className="text-sm font-medium truncate"
                          name={question.questionName}
                        >
                          {question.questionName}
                        </div>
                      </td>
                      <td className="hidden lg:table-cell">
                        <span className="badge badge-outline badge-sm">
                          Course #{question.courseId}
                        </span>
                      </td>

                      <td>
                        <div className="flex gap-1 lg:gap-2">
                          <button
                            onClick={() => handleDelete(question.id)}
                            className="btn btn-ghost btn-xs text-error"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {questions.length === 0 && (
            <div className="text-center py-12">
              <div className="text-base-content/60">
                <svg
                  className="w-16 h-16 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-lg font-medium mb-2">No questions found</p>
                <p className="text-sm">
                  Create your first question to get started
                </p>
              </div>
              <button className="btn btn-primary mt-4">
                Add First Question
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
