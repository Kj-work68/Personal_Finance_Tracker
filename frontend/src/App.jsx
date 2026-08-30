import { useState } from 'react'
import Sidebar from './components/sidebar/sidebar'
import AppRoutes from './router/app-routes'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    
      <Sidebar>
        <AppRoutes/>
      </Sidebar>

  )
}

export default App
