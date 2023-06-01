import { useState } from 'react'
import XMLParser from 'react-xml-parser'

const accountingAccountsList = [
  {
    id: 100,
    name: 'BANCOS'
  },
  {
    id: 103,
    name: 'CLIENTES'
  },
  {
    id: 106,
    name: 'COMPRAS ALMACENES'
  },
  {
    id: 113,
    name: 'IVA ACREDITABLE'
  },
  {
    id: 202,
    name: 'IVA POR TRASLADAR'
  },
  {
    id: 209,
    name: 'IVA TRASLADADO'
  },
  {
    id: 400,
    name: 'VENTAS'
  },
  {
    id: 560,
    name: 'GASTOS GENERALES'
  }
]

export default () => {
  const [transmitterData, setTransmitterData] = useState({
    name: '',
    rfc: '',
    fiscalRegime: ''
  })
  const [receiverData, setReceiverData] = useState({
    name: '',
    rfc: '',
    fiscalRegime: '',
    fiscalAddress: '',
    CFDIuse: ''
  })
  const [concepts, setConcepts] = useState({
    total: 0,
    subtotal: 0,
    taxes: 0
  })
  const [sales, setSales] = useState([])
  const [receiptOfTheSale, setReceiptOfTheSale] = useState([])
  const [shopping, setShopping] = useState([])
  const [expenses, setExpenses] = useState([])
  const [selectedOption, setSelectedOption] = useState('')
  const [completed, setCompleted] = useState(false)

  const handleFileChange = event => {
    const file = event.target.files[0]
    const reader = new FileReader()

    reader.onload = e => onLoadXMLFile(e.target.result)

    reader.readAsText(file)

    setSelectedOption('')
  }

  const onLoadXMLFile = xmlFile => {
    if (!xmlFile) return

    const xmlDocument = new XMLParser().parseFromString(xmlFile)

    if (!xmlDocument) return

    if (selectedOption === 'ingreso') {
      accountingForTheFinancialStatementOfIncome(xmlDocument)
      accountingForTheFinancialStatementOfReceiptOfTheSale(xmlDocument)

      xmlDocument.children.map(child => {
        const { name, attributes } = child

        if (name.includes('Emisor')) {
          setTransmitterData({
            name: attributes.Nombre,
            rfc: attributes.Rfc,
            fiscalRegime: attributes.RegimenFiscal
          })
        }

        if (name.includes('Receptor')) {
          setReceiverData({
            name: attributes.Nombre,
            rfc: attributes.Rfc,
            fiscalRegime: attributes.RegimenFiscalReceptor,
            fiscalAddress: attributes.DomicilioFiscalReceptor,
            CFDIuse: attributes.UsoCFDI
          })
        }

        if (name.includes('Impuestos')) {
          setConcepts(prev => {
            return {
              ...prev,
              taxes: child.attributes.TotalImpuestosTrasladados
            }
          })
        }
      })

      setConcepts(prev => {
        return {
          ...prev,
          total: xmlDocument.attributes.Total,
          subtotal: xmlDocument.attributes.SubTotal
        }
      })

      return
    }

    if (selectedOption === 'compras') {
      return accountingForTheFinancialStatementOfShopping(xmlDocument)
    }

    if (selectedOption === 'gasto') {
      return accountingForTheFinancialStatementOfExpenses(xmlDocument)
    }
  }

  const accountingForTheFinancialStatementOfIncome = xmlDocument => {
    if (!xmlDocument) return

    const account = {
      CLIENTES: {
        id: accountingAccountsList.find(account => account.name === 'CLIENTES').id || null
      },
      VENTAS: {
        id: accountingAccountsList.find(account => account.name === 'VENTAS').id || null
      },
      IVA_POR_TRASLADAR: {
        id: accountingAccountsList.find(account => account.name === 'IVA POR TRASLADAR').id || null
      }
    }

    if (!account.CLIENTES.id || !account.VENTAS.id || !account.IVA_POR_TRASLADAR.id) return

    const { attributes } = xmlDocument

    // Clientes
    if (attributes.Total) {
      setSales(prev => [...prev, { accountId: account.CLIENTES.id, charge: attributes.Total }])
    }

    // Ventas
    xmlDocument.children.map(child => {
      if (child.name.includes('Impuestos')) {
        setSales(prev => [
          ...prev,
          { accountId: account.VENTAS.id, credit: child.attributes.TotalImpuestosTrasladados }
        ])

        const traslado = child.children[0]?.children
        if (traslado) {
          setSales(prev => [...prev, { accountId: account.IVA_POR_TRASLADAR.id, credit: traslado[0].attributes.Base }])
        }
      }
    })
  }

  const accountingForTheFinancialStatementOfReceiptOfTheSale = xmlDocument => {
    if (!xmlDocument) return

    const account = {
      BANCOS: {
        id: accountingAccountsList.find(account => account.name === 'BANCOS').id || null
      },
      CLIENTES: {
        id: accountingAccountsList.find(account => account.name === 'CLIENTES').id || null
      },
      IVA_POR_TRASLADAR: {
        id: accountingAccountsList.find(account => account.name === 'IVA POR TRASLADAR').id || null
      },
      IVA_TRASLADADO: {
        id: accountingAccountsList.find(account => account.name === 'IVA TRASLADADO').id || null
      }
    }

    if (!account.BANCOS.id || !account.CLIENTES.id || !account.IVA_POR_TRASLADAR.id || !account.IVA_TRASLADADO.id)
      return

    const { attributes } = xmlDocument

    // Bancos
    if (attributes.Total) {
      setReceiptOfTheSale(prev => [...prev, { accountId: account.BANCOS.id, charge: attributes.Total }])
    }

    // Clientes
    if (attributes.Total) {
      setReceiptOfTheSale(prev => [...prev, { accountId: account.CLIENTES.id, credit: attributes.Total }])
    }

    // IVA por trasladar
    xmlDocument.children.map(child => {
      if (child.name.includes('Impuestos')) {
        setReceiptOfTheSale(prev => [
          ...prev,
          { accountId: account.IVA_POR_TRASLADAR.id, charge: child.attributes.TotalImpuestosTrasladados }
        ])

        const traslado = child.children[0]?.children
        if (traslado) {
          setReceiptOfTheSale(prev => [
            ...prev,
            { accountId: account.IVA_TRASLADADO.id, credit: traslado[0].attributes.Importe }
          ])
        }
      }
    })
  }

  const accountingForTheFinancialStatementOfShopping = xmlDocument => {
    const account = {
      COMPRAS_ALMACENES: {
        id: accountingAccountsList.find(account => account.name === 'COMPRAS ALMACENES').id || null
      },
      IVA_ACREDITABLE: {
        id: accountingAccountsList.find(account => account.name === 'IVA ACREDITABLE').id || null
      },
      BANCOS: {
        id: accountingAccountsList.find(account => account.name === 'BANCOS').id || null
      }
    }

    if (!account.COMPRAS_ALMACENES.id || !account.IVA_ACREDITABLE.id || !account.BANCOS.id) return

    xmlDocument.children.map(child => {
      // Compras almacenes
      if (child.name.includes('Conceptos') && child.children.length > 0) {
        setShopping(prev => [
          ...prev,
          { accountId: account.COMPRAS_ALMACENES.id, charge: child.children[0].attributes.Importe }
        ])
      }

      // IVA acreditable
      if (child.name.includes('Impuestos')) {
        setShopping(prev => [
          ...prev,
          { accountId: account.IVA_ACREDITABLE.id, charge: child.attributes.TotalImpuestosTrasladados }
        ])
      }
    })

    // Bancos
    if (xmlDocument.attributes.Total) {
      setShopping(prev => [...prev, { accountId: account.BANCOS.id, credit: xmlDocument.attributes.Total }])
    }
  }

  const accountingForTheFinancialStatementOfExpenses = xmlDocument => {
    const account = {
      GASTOS_GENERALES: {
        id: accountingAccountsList.find(account => account.name === 'GASTOS GENERALES').id || null
      },
      IVA_ACREDITABLE: {
        id: accountingAccountsList.find(account => account.name === 'IVA ACREDITABLE').id || null
      },
      BANCOS: {
        id: accountingAccountsList.find(account => account.name === 'BANCOS').id || null
      }
    }

    if (!account.GASTOS_GENERALES.id || !account.IVA_ACREDITABLE.id || !account.BANCOS.id) return

    // Gastos generales
    if (xmlDocument.attributes.SubTotal) {
      setExpenses(prev => [
        ...prev,
        { accountId: account.GASTOS_GENERALES.id, charge: xmlDocument.attributes.SubTotal }
      ])
    }

    // IVA acreditable
    xmlDocument.children.map(child => {
      if (child.name.includes('Impuestos')) {
        setExpenses(prev => [
          ...prev,
          { accountId: account.IVA_ACREDITABLE.id, charge: child.attributes.TotalImpuestosTrasladados }
        ])
      }
    })

    // Bancos
    if (xmlDocument.attributes.Total) {
      setExpenses(prev => [...prev, { accountId: account.BANCOS.id, credit: xmlDocument.attributes.Total }])
    }
  }

  return (
    <div>
      {!completed && (
        <div className="mb-3 rounded">
          {/* Tipo de documento */}
          <div className="mb-3 border border-gray-300 rounded-md bg-black text-white">
            <div className="py-3 flex justify-around">
              <h3 className="font-bold">Tipo de documento:</h3>
              <label>
                <input
                  type="radio"
                  value="ingreso"
                  checked={selectedOption === 'ingreso'}
                  onChange={e => setSelectedOption(e.target.value)}
                />
                <span className="mx-2 font-bold">Ingreso</span>
              </label>
              <label>
                <input
                  type="radio"
                  value="compras"
                  checked={selectedOption === 'compras'}
                  onChange={e => setSelectedOption(e.target.value)}
                />
                <span className="mx-2 font-bold">Compras</span>
              </label>
              <label>
                <input
                  type="radio"
                  value="gasto"
                  checked={selectedOption === 'gasto'}
                  onChange={e => setSelectedOption(e.target.value)}
                />
                <span className="mx-2 font-bold">Gasto</span>
              </label>
            </div>
          </div>

          {/* Cargar el documento */}
          {selectedOption && (
            <div className="border border-dashed border-purple-500 p-4 text-center">
              <input type="file" onChange={handleFileChange} />
            </div>
          )}
        </div>
      )}

      {transmitterData.name && receiverData.name && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <XMLInformationConceptsComponent title="Emisor:">
              <>
                <p className="p-1">Nombre: {transmitterData.name}</p>
                <p className="p-1">RFC: {transmitterData.rfc}</p>
              </>
            </XMLInformationConceptsComponent>

            <XMLInformationConceptsComponent title="Receptor:">
              <>
                <p className="p-1">Nombre: {receiverData.name}</p>
                <p className="p-1">RFC: {receiverData.rfc}</p>
                <p className="p-1">Régimen fiscal: {receiverData.fiscalRegime}</p>
              </>
            </XMLInformationConceptsComponent>

            <XMLInformationConceptsComponent title="Conceptos:">
              <>
                <p className="p-1">Total: ${concepts.total}</p>
                <p className="p-1">Subtotal: ${concepts.subtotal}</p>
                <p className="p-1">Iva: ${concepts.taxes}</p>
              </>
            </XMLInformationConceptsComponent>
          </div>
          <h1 className="text-[#415a77] font-bold text-2xl py-4">Estado financiero</h1>
        </>
      )}

      {sales.length > 0 && <XMLInformationFinancialStatementComponent title="Ventas" result={sales} />}
      {receiptOfTheSale.length > 0 && (
        <XMLInformationFinancialStatementComponent title="Cobro de la venta" result={receiptOfTheSale} />
      )}
      {shopping.length > 0 && <XMLInformationFinancialStatementComponent title="Compras" result={shopping} />}
      {expenses.length > 0 && <XMLInformationFinancialStatementComponent title="Gastos" result={expenses} />}
    </div>
  )
}

const XMLInformationConceptsComponent = props => {
  return (
    <div className="p-3 mb-5 rounded shadow bg-[#001d3d] text-white shadow-md">
      <h3 className="font-bold my-3">{props.title}</h3>
      <div className="text-[0.8rem]">{props.children}</div>
    </div>
  )
}

const XMLInformationFinancialStatementComponent = props => {
  return (
    <div className="my-4 shadow-md p-3">
      <h1 className="text-[#005f73] font-bold text-[1.2rem] py-4">{props.title}</h1>
      <div className="bg-[#001d3d] text-white rounded-md p-3 shadow-md grid grid-cols-4 text-center">
        <h3 className="font-bold">ID cuenta</h3>
        <h3 className="font-bold">Cuenta contable</h3>
        <h3 className="font-bold">Cargo</h3>
        <h3 className="font-bold">Abono</h3>
      </div>
      {props.result.map((sale, index) => {
        return (
          <div key={index} className="grid grid-cols-4 text-[0.8rem]">
            <div className="p-3 shadow">
              <p>{sale.accountId}</p>
            </div>
            <div className="p-3 shadow">
              <p>{accountingAccountsList.find(account => account.id === sale.accountId).name}</p>
            </div>
            <div className="p-3 shadow">
              <p> {sale.charge ? `$${sale.charge}` : ''} </p>
            </div>
            <div className="p-3 shadow">
              <p>{sale.credit ? `$${sale.credit}` : ''}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
