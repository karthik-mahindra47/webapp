'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2, Edit, Plus, Upload, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

const SparePartsManager = () => {
  const [spareParts, setSpareParts] = useState([]);
  const [selectedParts, setSelectedParts] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentPart, setCurrentPart] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state for new/edit part
  const [formData, setFormData] = useState({
    equipment: '',
    itemDescription: '',
    oemPartNumber: '',
    oem: '',
    qty: '',
    igtPartNumber: '',
    location: '',
    subLocation: ''
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle part selection
  const handlePartSelection = (partId) => {
    setSelectedParts(prev => {
      if (prev.includes(partId)) {
        return prev.filter(id => id !== partId);
      }
      return [...prev, partId];
    });
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    setSpareParts(prev => prev.filter(part => !selectedParts.includes(part.id)));
    setSelectedParts([]);
  };

  // Handle delete all
  const handleDeleteAll = () => {
    setSpareParts([]);
    setSelectedParts([]);
  };

  // Handle single part delete
  const handleDelete = (partId) => {
    setSpareParts(prev => prev.filter(part => part.id !== partId));
  };

  // Handle edit
  const handleEdit = (part) => {
    setCurrentPart(part);
    setFormData(part);
    setIsEditDialogOpen(true);
  };

  // Handle save (new/edit)
  const handleSave = () => {
    if (currentPart) {
      // Edit existing part
      setSpareParts(prev => prev.map(part => 
        part.id === currentPart.id ? { ...formData, id: part.id } : part
      ));
      setIsEditDialogOpen(false);
    } else {
      // Add new part
      setSpareParts(prev => [...prev, { ...formData, id: Date.now() }]);
      setIsAddDialogOpen(false);
    }
    setFormData({
      equipment: '',
      itemDescription: '',
      oemPartNumber: '',
      oem: '',
      qty: '',
      igtPartNumber: '',
      location: '',
      subLocation: ''
    });
    setCurrentPart(null);
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, { type: 'binary' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      
      // Transform data to match our structure
      const transformedData = data.map(row => ({
        id: Date.now() + Math.random(),
        equipment: row.Equipment || '',
        itemDescription: row['Item Description'] || '',
        oemPartNumber: row['OEM Part Number'] || '',
        oem: row.OEM || '',
        qty: row.QTY || '',
        igtPartNumber: row['IGT Part Number'] || '',
        location: row.Location || '',
        subLocation: row['Sub Location'] || ''
      }));
      
      setSpareParts(prev => [...prev, ...transformedData]);
    };
    
    reader.readAsBinaryString(file);
  };

  // Filter parts based on search term
  const filteredParts = spareParts.filter(part => 
    Object.values(part).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Spare Parts Management</h1>
        
        {/* Search and Actions Bar */}
        <div className="flex flex-wrap gap-4 mb-4">
          <Input
            type="text"
            placeholder="Search spare parts..."
            className="w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Part
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Spare Part</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="equipment"
                  placeholder="Equipment"
                  value={formData.equipment}
                  onChange={handleInputChange}
                />
                <Input
                  name="itemDescription"
                  placeholder="Item Description"
                  value={formData.itemDescription}
                  onChange={handleInputChange}
                />
                <Input
                  name="oemPartNumber"
                  placeholder="OEM Part Number"
                  value={formData.oemPartNumber}
                  onChange={handleInputChange}
                />
                <Input
                  name="oem"
                  placeholder="OEM"
                  value={formData.oem}
                  onChange={handleInputChange}
                />
                <Input
                  name="qty"
                  placeholder="Quantity"
                  type="number"
                  value={formData.qty}
                  onChange={handleInputChange}
                />
                <Input
                  name="igtPartNumber"
                  placeholder="IGT Part Number"
                  value={formData.igtPartNumber}
                  onChange={handleInputChange}
                />
                <Input
                  name="location"
                  placeholder="Location"
                  value={formData.location}
                  onChange={handleInputChange}
                />
                <Input
                  name="subLocation"
                  placeholder="Sub Location"
                  value={formData.subLocation}
                  onChange={handleInputChange}
                />
              </div>
              <Button onClick={handleSave}>Save Part</Button>
            </DialogContent>
          </Dialog>

          <div className="relative">
            <Input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              id="file-upload"
              onChange={handleFileUpload}
            />
            <Button 
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => document.getElementById('file-upload').click()}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Import Excel
            </Button>
          </div>

          {selectedParts.length > 0 && (
            <Button 
              variant="destructive" 
              onClick={handleBulkDelete}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected ({selectedParts.length})
            </Button>
          )}
          
          <Button 
            variant="destructive" 
            onClick={handleDeleteAll}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete All
          </Button>
        </div>

        {/* Parts Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-full bg-white">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={selectedParts.length === spareParts.length}
                    onChange={() => {
                      if (selectedParts.length === spareParts.length) {
                        setSelectedParts([]);
                      } else {
                        setSelectedParts(spareParts.map(part => part.id));
                      }
                    }}
                  />
                </th>
                <th className="p-2 text-left font-medium">Equipment</th>
                <th className="p-2 text-left font-medium">Description</th>
                <th className="p-2 text-left font-medium">OEM Part #</th>
                <th className="p-2 text-left font-medium">OEM</th>
                <th className="p-2 text-left font-medium">QTY</th>
                <th className="p-2 text-left font-medium">IGT Part #</th>
                <th className="p-2 text-left font-medium">Location</th>
                <th className="p-2 text-left font-medium">Sub Location</th>
                <th className="p-2 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredParts.map(part => (
                <tr key={part.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={selectedParts.includes(part.id)}
                      onChange={() => handlePartSelection(part.id)}
                    />
                  </td>
                  <td className="p-2">{part.equipment}</td>
                  <td className="p-2">{part.itemDescription}</td>
                  <td className="p-2">{part.oemPartNumber}</td>
                  <td className="p-2">{part.oem}</td>
                  <td className="p-2">{part.qty}</td>
                  <td className="p-2">{part.igtPartNumber}</td>
                  <td className="p-2">{part.location}</td>
                  <td className="p-2">{part.subLocation}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(part)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(part.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Spare Part</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <Input
              name="equipment"
              placeholder="Equipment"
              value={formData.equipment}
              onChange={handleInputChange}
            />
            <Input
              name="itemDescription"
              placeholder="Item Description"
              value={formData.itemDescription}
              onChange={handleInputChange}
            />
            <Input
              name="oemPartNumber"
              placeholder="OEM Part Number"
              value={formData.oemPartNumber}
              onChange={handleInputChange}
            />
            <Input
              name="oem"
              placeholder="OEM"
              value={formData.oem}
              onChange={handleInputChange}
            />
            <Input
              name="qty"
              placeholder="Quantity"
              type="number"
              value={formData.qty}
              onChange={handleInputChange}
            />
            <Input
              name="igtPartNumber"
              placeholder="IGT Part Number"
              value={formData.igtPartNumber}
              onChange={handleInputChange}
            />
            <Input
              name="location"
              placeholder="Location"
              value={formData.location}
              onChange={handleInputChange}
            />
            <Input
              name="subLocation"
              placeholder="Sub Location"
              value={formData.subLocation}
              onChange={handleInputChange}
            />
          </div>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SparePartsManager;
