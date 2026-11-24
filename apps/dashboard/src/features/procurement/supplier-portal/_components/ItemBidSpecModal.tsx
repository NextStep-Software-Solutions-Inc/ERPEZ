import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'
import type { DirectContractingItem } from '../types/direct-contracting-item-type'

interface ItemBidSpecModalProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  item: DirectContractingItem
  onSave: (id: string, model: string, brand: string, color: string) => void
}

export function ItemBidSpecModal({ open, onOpenChange, item, onSave }: ItemBidSpecModalProps) {
  const [model, setModel] = useState(item.bidModel || '')
  const [brand, setBrand] = useState(item.bidBrand || '')
  const [color, setColor] = useState(item.bidColor || '')

  useEffect(() => {
    if (open) {
      setModel(item.bidModel || '')
      setBrand(item.bidBrand || '')
      setColor(item.bidColor || '')
    }
  }, [open, item])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Item Bid Specification</DialogTitle>
          <DialogDescription>Enter the specifications for {item.itemName}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="da-model">Model</Label>
            <Input id="da-model" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Enter model" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="da-brand">Brand</Label>
            <Input id="da-brand" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Enter brand" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="da-color">Color</Label>
            <Input id="da-color" value={color} onChange={(e) => setColor(e.target.value)} placeholder="Enter color" />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave(item.id, model, brand, color)
              onOpenChange(false)
            }}
          >
            <Save className="h-4 w-4 mr-2" /> Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
