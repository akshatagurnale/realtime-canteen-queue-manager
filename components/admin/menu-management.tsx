'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle, Trash2, ToggleLeft, Plus, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface FoodItem {
  id: number
  name: string
  price: number
  category: string
  is_available: boolean
  image_url?: string
}

export function MenuManagement() {
  const [items, setItems] = useState<FoodItem[]>([])
  const [categories, setCategories] = useState<string[]>([]) 
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  
  const [showNewCatInput, setShowNewCatInput] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '', 
    description: '',
  })

  useEffect(() => {
    initSetup()
  }, [])

  const initSetup = async () => {
    setLoading(true)
    await Promise.all([fetchCategories(), fetchItems()])
    setLoading(false)
  }

  const fetchCategories = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('categories')
      .select('name')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching categories:', error)
    } else if (data && data.length > 0) {
      const catList = data.map(c => c.name)
      setCategories(catList)
      setFormData(prev => ({ ...prev, category: catList[0] }))
    }
  }

  const fetchItems = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('food_items')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching items:', error)
    } else {
      setItems(data || [])
    }
  }

  const handleAddNewCategory = async () => {
    if (!newCategoryName.trim()) return
    const supabase = createClient()
    const formattedName = newCategoryName.trim()

    const { error } = await supabase
      .from('categories')
      .insert([{ name: formattedName }])

    if (!error) {
      setCategories(prev => [...prev, formattedName].sort())
      setFormData(prev => ({ ...prev, category: formattedName }))
      setNewCategoryName('')
      setShowNewCatInput(false)
    } else {
      alert('Section already exists or error occurred: ' + error.message)
    }
  }

  // New handler function to delete a section option
  const handleDeleteCategory = async (catName: string) => {
    const totalLinkedItems = items.filter(item => item.category === catName).length
    
    if (totalLinkedItems > 0) {
      alert(`Cannot delete "${catName}". There are currently ${totalLinkedItems} food items actively assigned to this section. Change or remove those items first!`)
      return
    }

    if (!confirm(`Are you sure you want to completely remove the "${catName}" section?`)) return

    const supabase = createClient()
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('name', catName)

    if (!error) {
      const updatedCats = categories.filter(c => c !== catName)
      setCategories(updatedCats)
      if (formData.category === catName) {
        setFormData(prev => ({ ...prev, category: updatedCats[0] || '' }))
      }
    } else {
      alert('Failed to delete category: ' + error.message)
    }
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    let publicImageUrl = null

    if (imageFile) {
      try {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('food-images')
          .upload(fileName, imageFile)

        if (uploadError) throw uploadError

        const { data } = supabase.storage
          .from('food-images')
          .getPublicUrl(fileName)

        publicImageUrl = data.publicUrl
      } catch (uploadError: any) {
        console.error('Storage upload failure:', uploadError.message)
        alert('Failed to upload food photo. Saving item details without an image.')
      }
    }

    const { error } = await supabase.from('food_items').insert([
      {
        name: formData.name,
        price: parseFloat(formData.price),
        category: formData.category,
        description: formData.description,
        is_available: true,
        image_url: publicImageUrl,
      },
    ])

    if (!error) {
      setFormData({ name: '', price: '', category: categories[0] || '', description: '' })
      setImageFile(null)
      setShowAddForm(false)
      fetchItems()
    } else {
      console.error('Error adding database row:', error.message)
    }
  }

  const toggleAvailability = async (id: number, currentStatus: boolean) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('food_items')
      .update({ is_available: !currentStatus })
      .eq('id', id)

    if (!error) fetchItems()
  }

  const deleteItem = async (id: number) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('food_items')
      .delete()
      .eq('id', id)

    if (!error) fetchItems()
  }

  if (loading) {
    return <div className="text-center text-slate-600 pt-10">Loading menu layout...</div>
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Menu Items</CardTitle>
              <CardDescription>Add, edit, or disable food items</CardDescription>
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
      </Card>

      {showAddForm && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Food Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-white"
                />
                <Input
                  type="number"
                  placeholder="Price (₹)"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  step="0.01"
                  required
                  className="bg-white"
                />
                
                <div className="flex flex-col space-y-2">
                  {!showNewCatInput ? (
                    <div className="flex gap-2">
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="px-3 py-2 border border-slate-300 rounded-md bg-white flex-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowNewCatInput(true)}
                        title="Add new section category"
                        className="bg-white"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="New Section Name (e.g. Snacks)"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="bg-white flex-1"
                      />
                      <Button type="button" onClick={handleAddNewCategory} size="sm">
                        Save
                      </Button>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => { setShowNewCatInput(false); setNewCategoryName(''); }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  {/* Section Management Tray: Render categories as removable badges */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 block pl-0.5">Active Sections (Click X to delete)</label>
                    <div className="flex flex-wrap gap-1.5 p-2 bg-white rounded-md border border-slate-200 max-h-24 overflow-y-auto">
                      {categories.map((cat) => (
                        <span 
                          key={cat} 
                          className="inline-flex items-center gap-1.5 pl-2 pr-1 py-0.5 rounded bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium"
                        >
                          {cat}
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-slate-200 text-slate-400 hover:text-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <Input
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-white"
                />
                
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-600 block pl-1">Food Item Photo</label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="bg-white file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Add Item</Button>
                <Button variant="outline" onClick={() => { setShowAddForm(false); setImageFile(null); setShowNewCatInput(false); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3">
        {items.map((item) => (
          <Card key={item.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.name} 
                      className="h-16 w-16 rounded-md object-cover border bg-slate-100 flex-shrink-0"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-md bg-slate-100 border flex items-center justify-center text-[10px] text-slate-400 font-medium text-center p-1 flex-shrink-0">
                      No Photo
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-slate-900">{item.name}</h3>
                    <p className="text-sm text-slate-600">₹{item.price} • {item.category}</p>
                    <p className={`text-xs mt-1 ${item.is_available ? 'text-green-600' : 'text-red-600'}`}>
                      {item.is_available ? '✓ Available' : '✗ Out of Stock'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAvailability(item.id, item.is_available)}
                  >
                    <ToggleLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteItem(item.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {items.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No items in menu. Add one to get started!</AlertDescription>
        </Alert>
      )}
    </div>
  )
}