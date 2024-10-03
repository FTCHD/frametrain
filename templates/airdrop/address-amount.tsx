'use client'

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AddressAmount {
  address: string;
  amount: string;
}

export default function Component() {
  const [pairs, setPairs] = useState<AddressAmount[]>([{ address: '', amount: '' }])
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addPair = () => {
    setPairs([...pairs, { address: '', amount: '' }])
  }

  const removePair = (index: number) => {
    const newPairs = pairs.filter((_, i) => i !== index)
    setPairs(newPairs)
  }

  const handleInputChange = (index: number, field: 'address' | 'amount', value: string) => {
    const newPairs = [...pairs]
    newPairs[index][field] = value
    setPairs(newPairs)
  }

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const lines = content.split('\n')
      const newPairs: AddressAmount[] = []

      for (let i = 0; i < lines.length; i++) {
        const [address, amount] = lines[i].split(',').map(item => item.trim())
        if (address && amount) {
          newPairs.push({ address, amount })
        } else if (lines[i].trim() !== '') {
          setError(`Invalid format in CSV at line ${i + 1}`)
          return
        }
      }

      setPairs([...pairs, ...newPairs])
      setError(null)
    }

    reader.readAsText(file)
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      {pairs.map((pair, index) => (
        <div key={index} className="flex flex-col space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor={`address-${index}`}>Address</Label>
              <Input
                id={`address-${index}`}
                value={pair.address}
                onChange={(e) => handleInputChange(index, 'address', e.target.value)}
                placeholder="Enter address"
              />
            </div>
            <div>
              <Label htmlFor={`amount-${index}`}>Amount</Label>
              <Input
                id={`amount-${index}`}
                value={pair.amount}
                onChange={(e) => handleInputChange(index, 'amount', e.target.value)}
                placeholder="Enter amount"
              />
            </div>
          </div>
          <Button variant="destructive" onClick={() => removePair(index)}>Remove</Button>
        </div>
      ))}
      <Button onClick={addPair}>Add New Pair</Button>
      <div>
        <input
          type="file"
          accept=".csv"
          onChange={handleCsvUpload}
          ref={fileInputRef}
          className="hidden"
        />
        <Button onClick={() => fileInputRef.current?.click()}>Upload CSV</Button>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}