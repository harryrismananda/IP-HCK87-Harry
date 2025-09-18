import { BrowserRouter, Routes, Route } from "react-router";
import { AuthLayout } from "./layouts/AuthLayout";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { CMSHomePage } from "./pages/CMSHomePage";
import { MainLayout } from "./layouts/MainLayout";
import { CMSLayout } from "./layouts/CMSLayout";
import { ProfilePage } from "./pages/ProfilePage";
import { HomePage } from "./pages/HomePage";
import { CMSUserPage } from "./pages/CMSUserPage";
import { CMSQuestionPage } from "./pages/CMSQuestionPage";
import { UserCoursePage } from "./pages/UserCoursePage";
import { CourseQuestionPage } from "./pages/CourseQuestionPage";
import { CourseDetailPage } from "./pages/CourseDetailPage";
import { PaymentPage } from "./pages/PaymentPage";
import { Provider } from "react-redux";
import { store } from "./store";

function App() {
  return (
    <>
    <Provider store={store} >
      <BrowserRouter>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/courses" element={<UserCoursePage />} />
            <Route path="/course/:courseId" element={<CourseDetailPage />} />
            <Route path="/courses/:languageId/questions" element={<CourseQuestionPage />} />
            <Route path="/payment" element={<PaymentPage />} />
          </Route>
          <Route element={<CMSLayout />}>
            <Route path="/cms/home" element={<CMSHomePage />} />
            <Route path="/cms/users" element={<CMSUserPage />} />
            <Route path="/cms/questions" element={<CMSQuestionPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
    </>
  );
}

export default App;
