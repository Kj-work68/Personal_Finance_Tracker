import { Finance } from '../pages/index';
import { Routes, Route, Navigate, useNavigate, useLocation} from 'react-router-dom';
// import Login from "../components/Login/login";

const AppRoutes = () => {
  return (
    <Routes>

        <Route path="/finance" element={<Finance/>}/>

        <Route path="/" element={<Navigate to="/finance" replace/>}/>

        <Route path="*" element={<Navigate to="/finance" replace />} />
    </Routes>
  )
}

export default AppRoutes
