import XMLReaderComponent from './XMLReaderComponent.jsx'

function App() {
  return (
    <div>
      <nav className="bg-[#003566] shadow-md">
        <h3 className="text-[#ffd60a] font-bold p-3">Contabilización para el estado financiero</h3>
      </nav>

      <main className="bg-[#edede9] min-h-[calc(100vh-50px)] flex-column items-center justify-center">
        <div className="max-w-[900px] mx-auto px-3 pt-5 pb-10">
          <XMLReaderComponent />
        </div>
      </main>
    </div>
  )
}

export default App
