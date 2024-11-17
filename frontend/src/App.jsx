import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Home from './pages/Home';
import ProjectsSupervisors from './pages/ProjectsSupervisors';
import MyProfile from './pages/MyProfile';
import Supervisors from './pages/SupervisorsStatus';
import Login from './pages/Login';
import About from './pages/About';
import SingUp from './pages/SignUp';
import Feedbackform from './pages/Feedbackform'
const App = () => {
  return (
    <div className='mx-4 sm:mx-[10%]'>

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/projectsSupervisors' element={<ProjectsSupervisors />} />
        <Route path='/projectsSupervisors/:specialization' element={<Projects />} />
        <Route path='/login' element={<Login />} />
        <Route path='/singUp' element={<SingUp />} />
        <Route path='/about' element={<About />} />
        <Route path='/profile' element={<MyProfile />} />
        <Route path='/feedback' element={<Feedbackform />} />
        
      </Routes>

    </div>
  );
};

export default App;
