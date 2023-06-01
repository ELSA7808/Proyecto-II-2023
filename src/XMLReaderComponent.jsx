import { useEffect } from "react";
import { useState } from "react";
import XMLParser from "react-xml-parser";

export default () => {
  const [transmitterData, setTransmitterData] = useState({
    name: "",
    rfc: "",
    fiscalRegime: "",
  });
  const [receiverData, setReceiverData] = useState({
    name: "",
    rfc: "",
    fiscalRegime: "",
    fiscalAddress: "",
    CFDIuse: "",
  });
  const [concepts, setConcepts] = useState({
    total: 0,
    subtotal: 0,
    taxes: 0,
  });

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

    xmlDocument.children.map((child) => {
      const { name, attributes } = child;

      if (name.includes("Emisor")) {
        setTransmitterData({
          name: attributes.Nombre,
          rfc: attributes.Rfc,
          fiscalRegime: attributes.RegimenFiscal,
        });
      }

      if (name.includes("Receptor")) {
        setReceiverData({
          name: attributes.Nombre,
          rfc: attributes.Rfc,
          fiscalRegime: attributes.RegimenFiscalReceptor,
          fiscalAddress: attributes.DomicilioFiscalReceptor,
          CFDIuse: attributes.UsoCFDI,
        });
      }

      if (name.includes("Impuestos")) {
        setConcepts((prev) => {
          return {
            ...prev,
            taxes: child.attributes.TotalImpuestosTrasladados,
          };
        });
      }
    });

    console.log("xmlDocument :>> ", xmlDocument);

    setConcepts((prev) => {
      return {
        ...prev,
        total: xmlDocument.attributes.Total,
        subtotal: xmlDocument.attributes.SubTotal,
      };
    });
  };

  useEffect(() => {
    console.log("transmitterData :>> ", transmitterData);
    console.log("receiverData :>> ", receiverData);
    console.log("concepts :>> ", concepts);
  }, [transmitterData, receiverData, concepts]);

  return (
    <div>
      <div className='p-3 my-3 rounded border text-center'>
        <h2 className='font-bold my-2 text-xl'>Cargar Archivo XML</h2>
        <input
          type='file'
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};
