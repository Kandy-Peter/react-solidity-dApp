import { useState } from 'react'
import { Navbar, Transactions, Services, Welcome, Footer } from './components'

function App() {

  return (
    <div className="min-h-screen">
      <div className='gradient-bg-welcome'>
        <Navbar />
        <Welcome />
      </div>
      <Services />
      <Transactions />
      <Footer />
    </div >
  )
}

export default App
