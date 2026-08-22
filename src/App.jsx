import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import AppLayout from "./layouts/AppLayout";
import MainLayout from "./layouts/MainLayout";
import Home from "./Pages/Home";
import { Helmet, HelmetProvider } from "react-helmet-async"; // Добавлено для SEO
import "./Style/Media.css";
import AboutUs from "./Pages/AboutUs";
import Rahbariyat from "./Pages/Rahbariyat";
import Partners from "./Pages/Partners";
import International from "./Pages/International";
import Documents from "./Pages/Documents";
import InspectDocument from "./Pages/InspectDocument";
import OpenInfo from "./Pages/OpenInfo";
import ProtectedRoute from "./Components/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import NotFound from "./Pages/NotFound";
import Login from "./Pages/Login";
import AdminNews from './AdminPages/News'
import AdminAdmissions from './AdminPages/Admissions'
import AdmissionDetail from './AdminPages/AdmissionDetail'
import Announcements from './AdminPages/Announcements'
import Appeals from './AdminPages/Appeals'
import Banners from './AdminPages/Banners'
import CanteenMenu from './AdminPages/CanteenMenu'
import Clubs from './AdminPages/Clubs'
import ContactInfo from './AdminPages/ContactInfo'
import ContactMessages from './AdminPages/ContactMessages'
import AdminDocuments from './AdminPages/Documents'
import AdminEvents from './AdminPages/AdminEvents'
import Media from './AdminPages/Media'
import AdminPagesPage from './AdminPages/AdminPages'
import RequiredDocuments from './AdminPages/RequiredDocuments'
import UsefulLinks from './AdminPages/UsefulLinks'
import Users from './AdminPages/Users'
import UserDetail from './AdminPages/UserDetail'
import Center from "./Pages/Center";
import AdminCenter from "./AdminPages/Centers";
import Rekvizits from "./Pages/Rekvizits";
import CabinetPage from "./Pages/CabinetPage";
import Money from "./Pages/Money";
import WorkPage from "./Pages/WorkPage";

import AdminHomePage from "./AdminPages/AdminHomePage";
import AdminAboutUs from "./AdminPages/AboutUs";
import Categories from "./AdminPages/Categories";
import AdminPartners from "./AdminPages/Partners";
import Events from "./AdminPages/Events";
import Statistika from "./AdminPages/Statistika";
import CategoryDetail from "./AdminPages/CategoryDetail";
import AdminNewsCreate from "./AdminPages/AdminNewsCreate";
import AboutUsCreate from "./AdminPages/AboutUsCreate";
import Recvisits from "./AdminPages/Recvisits";
import Management from "./AdminPages/Management";
import OpenData from "./AdminPages/OpenData";
import Symbols from "./Pages/Symbols";
import Finance from "./Pages/Finance";
import Conatact from "./Pages/Contact";
import AboutUsEdit from "./AdminPages/AboutUsEdit";
import Review from "./AdminPages/Review";
import AgainstCorruption from "./AdminPages/AgainstCorruption";
import ReviewCreate from "./AdminPages/ReviewCreate";
import ReviewEdit from "./AdminPages/ReviewEdit";
import RegulatoryDoc from "./AdminPages/RegulatoryDoc";
import AdminInternational from "./AdminPages/International";
import InternationalCreate from "./AdminPages/InternationalCreate";
import InternationalEdit from "./AdminPages/InternationalEdit";
import OurPartners from "./AdminPages/OurPartners";
import InteractivesServices from "./AdminPages/InteractivesServices";
import Job from "./AdminPages/Job";
import Department from "./AdminPages/Department";
import CreateDepartment from "./AdminPages/CreateDepartment";
import DepartmenEdit from "./AdminPages/DepartmenEdit";
import CreateCenter from "./AdminPages/CenterCreate";
import ScheduleEvent from "./AdminPages/ScheduleEvent";
import MessageUser from "./AdminPages/MessageUser";
import AllNews from "./Pages/AllNews";
import SectionCenter from "./Pages/Section-Center";
import NewDetail from "./Pages/NewsDetail";
import Post from "./AdminPages/Post";
import PostCreate from "./AdminPages/PostCreate";
import PostEdit from "./Pages/PostEdit";
import UserPost from "./Pages/Post";
import Profile from "./AdminPages/Profile";
import AllPosts from "./AdminPages/AllPosts";

import VideoMedia from "./AdminPages/VideoMedia";
import PhotoMedia from "./AdminPages/PhotoMedia";

import AdminNewsEdit from "./AdminPages/AdminNewsEdit";
import FotoGallary from "./Pages/FotoGallary";
import VideoGallary from "./Pages/VideoGallary";
import Newspapers from "./AdminPages/Newspapers";
import BellSchedules from "./AdminPages/BellSchedules";
import ClassSchedules from "./AdminPages/ClassSchedules";
import HolidaySchedules from "./AdminPages/HolidaySchedules";
import Staff from "./AdminPages/Staff";
import Meetings from "./AdminPages/Meetings";
/* ── Public pages ── */
import ClubsPage        from "./Pages/Clubs";
import CanteenMenuPage  from "./Pages/CanteenMenuPage";
import MeetingsPage     from "./Pages/MeetingsPage";
import NewspapersPage   from "./Pages/NewspapersPage";
import BellSchedulePage    from "./Pages/BellSchedulePage";
import ClassSchedulePage   from "./Pages/ClassSchedulePage";
import HolidaySchedulePage from "./Pages/HolidaySchedulePage";
import StaffPage        from "./Pages/StaffPage";


function App() {
  return (
    <HelmetProvider>
      <Router>
        <Routes>
          {/* hehe */}
          {/* <Route path="/login" element={<Login />} /> */}
          <Route path="/" element={<AppLayout />}>
            <Route
              path="admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminHomePage />} />
              <Route path="aboutus" element={<AdminAboutUs />} />
              <Route path="categories" element={<Categories />} />
              <Route path="categories/detail/:categoryId" element={<CategoryDetail />} />
              <Route path="recvizits" element={<Recvisits />} />
              <Route path="management" element={<Management />} />
              <Route path="open-data" element={<OpenData />} />
              <Route path="against-corrution" element={<AgainstCorruption />} />
              <Route path="schedule-event" element={<ScheduleEvent />} />
              <Route path="partners" element={<AdminPartners />} />
              <Route path="statistics" element={<Statistika />} />
              <Route path="profile" element={<Profile />} />


              <Route path="/admin/news" element={<AdminNews />} />
              <Route path="/admin/news/create" element={<AdminNewsCreate />} />
              <Route path="/admin/news/edit/:ID" element={<AdminNewsEdit />} />

              <Route path="/admin/admissions" element={<AdminAdmissions />} />
              <Route path="/admin/admissions/:id" element={<AdmissionDetail />} />
              <Route path="/admin/announcements" element={<Announcements />} />
              <Route path="/admin/contact-messages" element={<Appeals />} />
              <Route path="/admin/banners" element={<Banners />} />
              <Route path="/admin/canteen-menu" element={<CanteenMenu />} />
              <Route path="/admin/clubs" element={<Clubs />} />
              <Route path="/admin/contact-info" element={<ContactInfo />} />
              <Route path="/admin/message-user" element={<ContactMessages />} />
              <Route path="/admin/regulatory-doc" element={<AdminDocuments />} />
              <Route path="/admin/events" element={<AdminEvents />} />
              <Route path="/admin/photo-media" element={<Media />} />
              <Route path="/admin/video-media" element={<Media />} />
              <Route path="/admin/post" element={<AdminPagesPage />} />
              <Route path="/admin/required-documents" element={<RequiredDocuments />} />
              <Route path="/admin/useful-links" element={<UsefulLinks />} />
              <Route path="/admin/users" element={<Users />} />
              <Route path="/admin/users/:id" element={<UserDetail />} />

              <Route path='/admin/aboutUs/create' element={<AboutUsCreate />} />
              <Route path="/admin/aboutUs/edit/:ID" element={<AboutUsEdit />} />

              <Route path='/admin/review' element={<Review />} />
              <Route path='/admin/review/create' element={<ReviewCreate />} />
              <Route path="/admin/review/edit/:ID" element={<ReviewEdit />} />

              <Route path="/admin/International" element={<AdminInternational />} />
              <Route path="/admin/International/create" element={<InternationalCreate />} />
              <Route path="/admin/International/edit/:ID" element={<InternationalEdit />} />

              <Route path="/admin/OurPartners" element={<OurPartners />} />
              <Route path="/admin/Interactives/Services" element={<InteractivesServices />} />
              <Route path="/admin/vacancies" element={<Job />} />

              <Route path="/admin/centers" element={<Department />} />
              <Route path="/admin/sections/create" element={<CreateDepartment />} />
              <Route path="/admin/sections-centers/edit/:ID" element={<DepartmenEdit />} />

              <Route path="/admin/sections" element={<AdminCenter />} />
              <Route path="/admin/centers/create" element={<CreateCenter />} />

              <Route path="/admin/post/create/:ID" element={<PostCreate />} />
              <Route path="/admin/post/edit/:ID" element={<PostEdit />} />
              <Route path="/admin/post/all/:ID" element={<AllPosts />} />

              {/* ── Yangi sahifalar ── */}
              <Route path="/admin/newspapers"        element={<Newspapers />} />
              <Route path="/admin/bell-schedules"    element={<BellSchedules />} />
              <Route path="/admin/class-schedules"   element={<ClassSchedules />} />
              <Route path="/admin/holiday-schedules" element={<HolidaySchedules />} />
              <Route path="/admin/staff"             element={<Staff />} />
              <Route path="/admin/meetings"          element={<Meetings />} />

            </Route>

            <Route element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="/biz-haqimizda" element={<AboutUs />} />
              <Route path="/rahbariyat" element={<Rahbariyat />} />
              <Route path="/hamkorlarimiz" element={<Partners />} />
              <Route path="/xalqaro-aloqalar" element={<International />} />
              <Route path="/hujjatlar" element={<Documents />} />
              <Route path="/murojaatlar" element={<InspectDocument />} />
              <Route path="/ochiq-ma'lumotlar" element={<OpenInfo />} />
              <Route path="/bo'lim-markazlar" element={<Center />} />
              <Route path="/rekvizitlar" element={<Rekvizits />} />
              <Route path="/virtual-kabinet" element={<CabinetPage />} />
              <Route path="/korrupsiyaga-kurash" element={<Money />} />
              <Route path="/bosh-ish-orni" element={<WorkPage />} />
              <Route path="/ramzlar" element={<Symbols />} />
              <Route path="/hisobot" element={<Finance />} />
              <Route path="/contact" element={<Conatact />} />
              <Route path="/barcha-yangiliklar" element={<AllNews />} />
              <Route path="/markazlar-bolimlar/:ID" element={<SectionCenter />} />
              <Route path="/yangilik/:ID" element={<NewDetail />} />
              <Route path="/sahifa/:ID" element={<UserPost />} />
              <Route path="/fotogalereya" element={<FotoGallary />} />
              <Route path="/Videogalereya" element={<VideoGallary />} />
              {/* ── Yangi public sahifalar ── */}
              <Route path="/togarak"          element={<ClubsPage />} />
              <Route path="/oshxona"          element={<CanteenMenuPage />} />
              <Route path="/ota-ona-uchrashув" element={<MeetingsPage />} />
              <Route path="/gazeta"           element={<NewspapersPage />} />
              <Route path="/qongiroq"         element={<BellSchedulePage />} />
              <Route path="/dars-jadvali"     element={<ClassSchedulePage />} />
              <Route path="/tatil-jadvali"    element={<HolidaySchedulePage />} />
              <Route path="/xodimlar"         element={<StaffPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </HelmetProvider>
  );
}

export default App;
