import { useState } from "react";
import XMLParser from "react-xml-parser";

export default () => {
  const [xmlDocument, setXMLDocument] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => onLoadXMLFile(e.target.result);

    reader.readAsText(file);
  };

  const onLoadXMLFile = (xmlFile) => {
    if (!xmlFile) return;

    const xmlDocument = new XMLParser().parseFromString(xmlFile);

    if (!xmlDocument) return;

    setXMLDocument(xmlDocument);
  };

  return (
    <div>
      <div className='p-3 my-3 rounded border text-center'>
        <h2 className='font-bold my-2 text-xl'>Cargar Archivo XML</h2>
        <input
          type='file'
          onChange={handleFileChange}
        />
      </div>

      {xmlDocument && <pre>{JSON.stringify(xmlDocument, null, 2)}</pre>}
    </div>
  );
};
