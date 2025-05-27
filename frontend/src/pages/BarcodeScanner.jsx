"use client"

import { useState, useEffect, useRef } from "react"
import { useProductStore } from "../stores/productStore"
import { useCartStore } from "../stores/cartStore"
import { formatCurrency } from "../utils/barcodeUtils"
import Quagga from "quagga"
import { Camera, ShoppingCart, X, Check } from "lucide-react"

const BarcodeScanner = () => {
  const scannerRef = useRef(null)
  const { getProductByBarcode } = useProductStore()
  const { addItem } = useCartStore()

  const [scanning, setScanning] = useState(false)
  const [manualBarcode, setManualBarcode] = useState("")
  const [scannedProduct, setScannedProduct] = useState(null)
  const [notification, setNotification] = useState(null)

  // Initialize scanner
  const initScanner = () => {
    if (scannerRef.current) {
      Quagga.init(
        {
          inputStream: {
            name: "Live",
            type: "LiveStream",
            target: scannerRef.current,
            constraints: {
              width: "100%",
              height: "100%",
              facingMode: "environment",
            },
          },
          locator: {
            patchSize: "medium",
            halfSample: true,
          },
          numOfWorkers: 2,
          decoder: {
            readers: ["ean_reader", "ean_8_reader", "code_128_reader"],
          },
          locate: true,
        },
        (err) => {
          if (err) {
            console.error("Error initializing Quagga:", err)
            return
          }
          Quagga.start()
          setScanning(true)
        },
      )

      Quagga.onDetected(handleBarcodeDetected)
    }
  }

  // Clean up scanner on unmount
  useEffect(() => {
    return () => {
      if (scanning) {
        Quagga.stop()
      }
    }
  }, [scanning])

  // Handle barcode detection
  const handleBarcodeDetected = (result) => {
    const barcode = result.codeResult.code

    // Stop scanning temporarily
    Quagga.stop()
    setScanning(false)

    // Look up product
    const product = getProductByBarcode(barcode)

    if (product) {
      setScannedProduct(product)
      setManualBarcode("")
    } else {
      setNotification({
        type: "error",
        message: `No product found with barcode: ${barcode}`,
      })

      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null)
      }, 3000)
    }
  }

  // Handle manual barcode lookup
  const handleManualLookup = (e) => {
    e.preventDefault()

    if (!manualBarcode.trim()) return

    const product = getProductByBarcode(manualBarcode)

    if (product) {
      setScannedProduct(product)
      setManualBarcode("")
    } else {
      setNotification({
        type: "error",
        message: `No product found with barcode: ${manualBarcode}`,
      })

      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null)
      }, 3000)
    }
  }

  // Add product to cart
  const handleAddToCart = () => {
    if (scannedProduct) {
      addItem(scannedProduct)

      setNotification({
        type: "success",
        message: `${scannedProduct.name} added to cart`,
      })

      // Clear notification and product after 3 seconds
      setTimeout(() => {
        setNotification(null)
        setScannedProduct(null)
      }, 3000)
    }
  }

  // Reset scanner
  const handleReset = () => {
    setScannedProduct(null)
    setManualBarcode("")

    if (!scanning) {
      initScanner()
    }
  }

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Barcode Scanner</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Scan Barcode</h2>

          {!scannedProduct ? (
            <>
              <div
                ref={scannerRef}
                className={`relative bg-slate-900 rounded-lg overflow-hidden h-64 flex items-center justify-center mb-4 ${
                  scanning ? "w-full h-64" : ""
                }`}
              >
                {!scanning && (
                  <button onClick={initScanner} className="btn-primary flex items-center">
                    <Camera size={18} className="mr-1" />
                    Start Camera
                  </button>
                )}
              </div>

              <div className="text-center text-sm text-slate-400 mb-6">Point your camera at a barcode to scan</div>

              <div className="text-center">
                <div className="text-slate-300 mb-2">- OR -</div>
                <form onSubmit={handleManualLookup} className="flex">
                  <input
                    type="text"
                    value={manualBarcode}
                    onChange={(e) => setManualBarcode(e.target.value)}
                    placeholder="Enter barcode manually"
                    className="input rounded-r-none"
                  />
                  <button type="submit" className="btn-primary rounded-l-none">
                    Lookup
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="bg-slate-700 rounded-lg p-4 mb-4">
                <img
                  src={scannedProduct.image || "/placeholder.svg"}
                  alt={scannedProduct.name}
                  className="w-32 h-32 object-cover rounded-lg mx-auto mb-4"
                />
                <h3 className="text-xl font-semibold">{scannedProduct.name}</h3>
                <p className="text-blue-400 text-xl font-bold my-2">{formatCurrency(scannedProduct.price)}</p>
                <div className="text-sm text-slate-400 mb-2">Barcode: {scannedProduct.barcode}</div>
                <div
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    scannedProduct.stock > 10
                      ? "bg-emerald-900 text-emerald-300"
                      : scannedProduct.stock > 0
                        ? "bg-amber-900 text-amber-300"
                        : "bg-red-900 text-red-300"
                  }`}
                >
                  {scannedProduct.stock > 0 ? `${scannedProduct.stock} in stock` : "Out of stock"}
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button onClick={handleReset} className="btn-secondary flex items-center">
                  <X size={18} className="mr-1" />
                  Cancel
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={scannedProduct.stock <= 0}
                  className="btn-primary flex items-center"
                >
                  <ShoppingCart size={18} className="mr-1" />
                  Add to Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {notification && (
        <div
          className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
            notification.type === "success" ? "bg-emerald-900 text-emerald-300" : "bg-red-900 text-red-300"
          } slide-up`}
        >
          {notification.message}
        </div>
      )}
    </div>
  )
}

export default BarcodeScanner
