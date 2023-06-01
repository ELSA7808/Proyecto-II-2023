import XMLReaderComponent from "./XMLReaderComponent.jsx";

function App () {
  return (
    <div className='min-h-[100vh] max-w-[800px] m-auto flex-column items-center justify-center'>
      <h1 className='text-2xl font-bold my-3 uppercase text-center'>
        Proyecto contable
      </h1>

      <XMLReaderComponent />
    </div>
  );
}

export default App;
