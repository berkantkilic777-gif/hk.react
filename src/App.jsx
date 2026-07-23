import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import AnaSayfa from './AnaSayfa';
import Register from './Register';

function App() {
  return (
    
    <BrowserRouter> 
      <Routes> 
      
        <Route path="/" element={<Login />} />
        
        <Route path="/anasayfa" element={<AnaSayfa />} />

        <Route path="/Register" element={<Register />} />
        
      </Routes>
    </BrowserRouter>

   
  );
}

export default App;