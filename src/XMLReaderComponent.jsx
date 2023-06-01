import { useState } from "react";
import XMLParser from "react-xml-parser";
import PropsTypes from "prop-types";

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

  return (
    <div>
      <div className='p-3 my-3 rounded border text-center'>
        <h2 className='font-bold my-2 text-xl'>Cargar Archivo XML</h2>
        <input
          type='file'
          onChange={handleFileChange}
        />
      </div>

      {transmitterData.name && receiverData && (
        <>
          <XMLResultsTableComponent
            title='Emisor:'
            headerClassName='grid grid-cols-2'
            headers={["Nombre", "RFC"]}
            childrenClassName='grid grid-cols-2'>
            <>
              <p className='p-1'>{transmitterData.name}</p>
              <p className='p-1'>{transmitterData.rfc}</p>
            </>
          </XMLResultsTableComponent>

          <XMLResultsTableComponent
            title='Receptor:'
            headerClassName='grid grid-cols-3'
            headers={["Nombre", "RFC", "Regimen fiscal"]}
            childrenClassName='grid grid-cols-3'>
            <>
              <p className='p-1'>{receiverData.name}</p>
              <p className='p-1'>{receiverData.rfc}</p>
              <p className='p-1'>{receiverData.fiscalRegime}</p>
            </>
          </XMLResultsTableComponent>

          <XMLResultsTableComponent
            title='Conceptos:'
            headerClassName='grid grid-cols-3'
            headers={["Total", "Subtotal", "IVA"]}
            childrenClassName='grid grid-cols-3'>
            <>
              <p className='p-1'>${concepts.total}</p>
              <p className='p-1'>${concepts.subtotal}</p>
              <p className='p-1'>${concepts.taxes}</p>
            </>
          </XMLResultsTableComponent>
        </>
      )}
    </div>
  );
};

const XMLResultsTableComponent = (props) => {
  return (
    <div className='p-3 my-5 rounded shadow bg-white'>
      <h3 className='font-bold text-2xl my-3'>{props.title}</h3>
      <div
        className={
          "border bg-gray-300 rounded-tr rounded-tl px-2 py-1 font-bold text-center " +
          props.headerClassName
        }>
        {props.headers.map((header, index) => (
          <h3 key={index}>{header}</h3>
        ))}
      </div>
      <div className={"p-2 border text-center " + props.childrenClassName}>
        {props.children}
      </div>
    </div>
  );
};
