import {ToastContainer} from 'react-toastify'
import 'react-toastify/ReactToastify.css'
import { Outlet } from 'react-router-dom';
import NavigationBar from './Pages/Navigation';

function App() {
  return (
    <>
      <ToastContainer />
      <NavigationBar />
      <main className='py-3'>
        <Outlet/>
      </main>
    </>
  )
}

export default App;
