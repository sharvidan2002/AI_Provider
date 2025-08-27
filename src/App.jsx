import Header from './components/common/Header'
import Footer from './components/common/Footer'
import Home from './pages/Home'
import Document from './pages/Document'
import Teacher from './pages/Teacher'
import { useAppContext } from './context/AppContext'

function App() {
  const { currentView, currentDocument } = useAppContext()

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <Home />
      case 'document':
        return <Document documentId={currentDocument} />
      case 'teacher':
        return <Teacher />
      default:
        return <Home />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {renderCurrentView()}
      </main>
      <Footer />
    </div>
  )
}

export default App