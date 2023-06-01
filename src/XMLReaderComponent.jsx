import { useEffect, useState } from "react";
import XMLParser from "react-xml-parser";

const xmlFile = `<?xml version="1.0" encoding="utf-8"?>
<cfdi:Comprobante xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  Version="4.0"
  Serie="L"
  TipoDeComprobante="I"
  Exportacion="01"
  MetodoPago="PUE"
  LugarExpedicion="45416"
</cfdi:Comprobante>`;

export default () => {
  const [xmlDocument, setXmlDocument] = useState(null);

  const onLoadXMLFile = (xmlFile) => {
    if (!xmlFile) return;

    const xmlDocument = new XMLParser().parseFromString(xmlFile);

    if (!xmlDocument) return;

    setXmlDocument(xmlDocument);
  };

  useEffect(() => {
    onLoadXMLFile(xmlFile);
  }, []);

  return (
    <div>
      {xmlDocument && (
        <pre>
          <code>{JSON.stringify(xmlDocument, null, 2)}</code>
        </pre>
      )}
    </div>
  );
};
