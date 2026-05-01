import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import BusListing from './pages/BusListing';
import SeatSelection from './pages/SeatSelection';
import PassengerDetails from './pages/PassengerDetails';
import Payment from './pages/Payment';
import BookingConfirmation from './pages/BookingConfirmation';
import Navbar from './components/Navbar';
import Login from './components/login';
import Signup from './components/signup';
import Help from './pages/Help';
import Profile from './pages/profile';
import Contact from './pages/contact';
import AdminPanel from './pages/AdminPanel';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/help" element={<Help />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/buses" element={<BusListing />} />
          <Route path="/seats" element={<SeatSelection />} />
          <Route path="/passenger" element={<PassengerDetails />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/confirmation" element={<BookingConfirmation />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
