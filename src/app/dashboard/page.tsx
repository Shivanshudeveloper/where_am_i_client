'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  FileText, 
  Users, 
  Clock, 
  AlertTriangle,
  Upload,
  X,
  Plus,
  CalendarIcon,
  Shield,
  ChevronRight,
  ChevronLeft,
  Send,
  User,
  Mail,
  Phone,
  CheckCircle,
  PlusCircle,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface Recipient {
  id: string
  name: string
  email: string
  phone: string
}

interface FileUpload {
  id: string
  name: string
  size: number
}

interface SavedMessage {
  id: string
  message: string
  files: FileUpload[]
  recipients: Recipient[]
  deliveryDate?: Date
  deliveryTime: string
  timezone: string
  status: 'In Review' | 'Active' | 'Expired'
  createdAt: Date
}

const Page = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [message, setMessage] = useState('')
  const [files, setFiles] = useState<FileUpload[]>([])
  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: '1', name: '', email: '', phone: '' }
  ])
  const [deliveryDate, setDeliveryDate] = useState<Date>()
  const [deliveryTime, setDeliveryTime] = useState('')
  const [timezone, setTimezone] = useState('UTC')
  const [savedMessages, setSavedMessages] = useState<SavedMessage[]>([
    {
      id: 'demo-1',
      message: 'Going hiking at Mount Rainier National Park on the Wonderland Trail. Expected return by 6 PM. Carrying emergency supplies, GPS device, and first aid kit. Weather forecast shows clear conditions.',
      files: [],
      recipients: [
        { id: 'r1', name: 'John Smith', email: 'john.smith@email.com', phone: '+1 (555) 123-4567' },
        { id: 'r2', name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '+1 (555) 987-6543' }
      ],
      deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      deliveryTime: '18:00',
      timezone: 'PST',
      status: 'Active',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    }
  ])
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const steps = [
    { id: 1, title: 'Message', icon: FileText },
    { id: 2, title: 'Contacts', icon: Users },
    { id: 3, title: 'Schedule', icon: Clock },
    { id: 4, title: 'Review', icon: CheckCircle }
  ]

  const timezones = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'EST', label: 'EST (Eastern Standard Time)' },
    { value: 'CST', label: 'CST (Central Standard Time)' },
    { value: 'MST', label: 'MST (Mountain Standard Time)' },
    { value: 'PST', label: 'PST (Pacific Standard Time)' },
    { value: 'GMT', label: 'GMT (Greenwich Mean Time)' },
    { value: 'CET', label: 'CET (Central European Time)' },
    { value: 'IST', label: 'IST (Indian Standard Time)' },
    { value: 'JST', label: 'JST (Japan Standard Time)' },
    { value: 'AEST', label: 'AEST (Australian Eastern Standard Time)' },
  ]

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files
    if (uploadedFiles) {
      const newFiles = Array.from(uploadedFiles).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size
      }))
      setFiles([...files, ...newFiles])
    }
  }

  const removeFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id))
  }

  const addRecipient = () => {
    if (recipients.length < 10) {
      setRecipients([...recipients, {
        id: Math.random().toString(36).substr(2, 9),
        name: '',
        email: '',
        phone: ''
      }])
    }
  }

  const removeRecipient = (id: string) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter(r => r.id !== id))
    }
  }

  const updateRecipient = (id: string, field: keyof Recipient, value: string) => {
    setRecipients(recipients.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    ))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const isStepValid = (step: number) => {
    switch(step) {
      case 1:
        return message.trim() !== ''
      case 2:
        return recipients.some(r => r.name && r.email)
      case 3:
        return deliveryDate && deliveryTime && timezone
      default:
        return true
    }
  }

  const resetForm = () => {
    setCurrentStep(1)
    setMessage('')
    setFiles([])
    setRecipients([{ id: '1', name: '', email: '', phone: '' }])
    setDeliveryDate(undefined)
    setDeliveryTime('')
    setTimezone('UTC')
    setEditingMessageId(null)
  }

  const handleActivate = () => {
    if (editingMessageId) {
      // Update existing message
      setSavedMessages(savedMessages.map(msg => 
        msg.id === editingMessageId 
          ? {
              ...msg,
              message,
              files: [...files],
              recipients: recipients.filter(r => r.name && r.email),
              deliveryDate,
              deliveryTime,
              timezone,
            }
          : msg
      ))
    } else {
      // Create new message
      const newMessage: SavedMessage = {
        id: Math.random().toString(36).substr(2, 9),
        message,
        files: [...files],
        recipients: recipients.filter(r => r.name && r.email),
        deliveryDate,
        deliveryTime,
        timezone,
        status: 'In Review',
        createdAt: new Date()
      }
      setSavedMessages([...savedMessages, newMessage])
    }
    setIsDialogOpen(false)
    resetForm()
  }

  const handleEdit = (msg: SavedMessage) => {
    setMessage(msg.message)
    setFiles([...msg.files])
    setRecipients(msg.recipients.length > 0 ? [...msg.recipients] : [{ id: '1', name: '', email: '', phone: '' }])
    setDeliveryDate(msg.deliveryDate)
    setDeliveryTime(msg.deliveryTime)
    setTimezone(msg.timezone)
    setEditingMessageId(msg.id)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setSavedMessages(savedMessages.filter(msg => msg.id !== id))
    setDeleteConfirmId(null)
  }

  const confirmDelete = (id: string) => {
    setDeleteConfirmId(id)
  }

  const truncateWords = (text: string, maxWords: number) => {
    const words = text.split(' ')
    if (words.length <= maxWords) return text
    return words.slice(0, maxWords).join(' ') + '...'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Safety Check-In</h1>
              <p className="text-xs sm:text-sm text-slate-600">Manage your emergency alerts</p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 cursor-pointer w-full sm:w-auto">
                <PlusCircle className="w-4 h-4" />
                New Message
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] sm:max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6">
              <DialogHeader className="space-y-1 sm:space-y-2">
                <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                  {editingMessageId ? 'Edit Safety Check-In' : 'Create Safety Check-In'}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">
                  {editingMessageId ? 'Update your emergency message details' : "Set up an emergency message that will be sent if you don't check in on time"}
                </DialogDescription>
              </DialogHeader>

        {/* Progress Steps */}
              <div className="mb-3 sm:mb-4">
                <div className="flex items-center justify-between relative px-2 sm:px-0">
              {steps.map((step, index) => (
                <div key={step.id} className="flex-1 relative">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                          "w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all",
                      currentStep >= step.id 
                        ? "bg-blue-600 border-blue-600 text-white" 
                        : "bg-white border-slate-300 text-slate-400"
                    )}>
                          <step.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                    <span className={cn(
                          "text-[9px] sm:text-xs mt-0.5 sm:mt-1.5 font-medium text-center leading-tight",
                      currentStep >= step.id ? "text-blue-600" : "text-slate-400"
                    )}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={cn(
                          "absolute top-3.5 sm:top-5 left-[50%] w-full h-0.5 -z-10",
                      currentStep > step.id ? "bg-blue-600" : "bg-slate-200"
                    )} />
                  )}
                </div>
              ))}
            </div>
                </div>

              <div className="space-y-4 sm:space-y-6">
                {/* Step 1: Message */}
                {currentStep === 1 && (
                  <div className="space-y-3">
                <div>
                      <Label htmlFor="message" className="font-medium mb-1.5 block text-xs sm:text-sm">
                    Emergency Message <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="message"
                        placeholder="Include your location, plans, expected return time..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                        className="min-h-[90px] sm:min-h-[120px] resize-none text-xs sm:text-sm"
                  />
                      <p className="text-[10px] sm:text-xs text-slate-500 mt-1">{message.length} characters</p>
                </div>

                <div>
                      <Label className="font-medium mb-1.5 block text-xs sm:text-sm">
                        Attachments (Optional)
                  </Label>
                      <div className="border-2 border-dashed border-slate-200 rounded-lg p-3 text-center hover:border-slate-300 transition-colors">
                        <Upload className="w-6 h-6 sm:w-7 sm:h-7 mx-auto mb-1 sm:mb-1.5 text-slate-400" />
                    <label htmlFor="file-upload" className="cursor-pointer">
                          <span className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium">Upload files</span>
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                        <p className="text-[9px] sm:text-xs text-slate-400 mt-0.5">PDF, JPG, PNG up to 10MB</p>
                  </div>
                  
                  {files.length > 0 && (
                        <div className="mt-2 space-y-1.5">
                      {files.map(file => (
                            <div key={file.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                <FileText className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-medium text-slate-700 truncate">{file.name}</p>
                                  <p className="text-[10px] text-slate-500">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.id)}
                                className="h-7 w-7 p-0 cursor-pointer flex-shrink-0"
                          >
                                <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Emergency Contacts */}
            {currentStep === 2 && (
                  <div className="space-y-3">
                    <div className="space-y-2.5">
                  {recipients.map((recipient, index) => (
                        <Card key={recipient.id} className="p-3 bg-gradient-to-br from-white to-slate-50 border-slate-200 hover:border-slate-300 transition-colors">
                          <div className="space-y-2.5">
                        <div>
                              <Label htmlFor={`name-${recipient.id}`} className="text-xs mb-1 flex items-center gap-1 font-medium">
                                <User className="w-3 h-3 text-slate-500" />
                            Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id={`name-${recipient.id}`}
                            placeholder="John Doe"
                            value={recipient.name}
                            onChange={(e) => updateRecipient(recipient.id, 'name', e.target.value)}
                                className="h-9 text-xs sm:text-sm"
                          />
                        </div>
                        
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                                <Label htmlFor={`email-${recipient.id}`} className="text-xs mb-1 flex items-center gap-1 font-medium">
                                  <Mail className="w-3 h-3 text-slate-500" />
                            Email <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id={`email-${recipient.id}`}
                            type="email"
                            placeholder="john@example.com"
                            value={recipient.email}
                            onChange={(e) => updateRecipient(recipient.id, 'email', e.target.value)}
                                  className="h-9 text-xs sm:text-sm"
                          />
                        </div>
                        
                        <div>
                                <Label htmlFor={`phone-${recipient.id}`} className="text-xs mb-1 flex items-center gap-1 font-medium">
                                  <Phone className="w-3 h-3 text-slate-500" />
                            Phone
                          </Label>
                          <Input
                            id={`phone-${recipient.id}`}
                            type="tel"
                            placeholder="+1 (555) 123-4567"
                            value={recipient.phone}
                            onChange={(e) => updateRecipient(recipient.id, 'phone', e.target.value)}
                                  className="h-9 text-xs sm:text-sm"
                          />
                        </div>
                            </div>

                            {recipients.length > 1 && (
                              <div className="flex justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeRecipient(recipient.id)}
                                  className="text-red-600 hover:bg-red-50 hover:border-red-300 cursor-pointer text-xs h-8"
                                >
                                  <X className="w-3.5 h-3.5 mr-1" />
                                  Remove
                                </Button>
                              </div>
                            )}
                      </div>
                    </Card>
                  ))}
                </div>

                {recipients.length < 10 && (
                  <Button
                    onClick={addRecipient}
                    variant="outline"
                        size="sm"
                        className="w-full cursor-pointer hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 text-xs sm:text-sm h-9"
                  >
                        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                        Add Contact
                  </Button>
                )}
              </div>
            )}

                {/* Step 3: Schedule */}
            {currentStep === 3 && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                        <Label className="font-medium mb-1.5 block text-xs">
                          Deadline Date <span className="text-red-500">*</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                                "w-full justify-start text-left font-normal h-9 text-xs",
                            !deliveryDate && "text-muted-foreground"
                          )}
                        >
                              <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                              {deliveryDate ? format(deliveryDate, "PP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={deliveryDate}
                          onSelect={setDeliveryDate}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                        <Label htmlFor="time" className="font-medium mb-1.5 block text-xs">
                          Time <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="time"
                      type="time"
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                          className="h-9 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                      <Label htmlFor="timezone" className="font-medium mb-1.5 block text-xs">
                    Timezone <span className="text-red-500">*</span>
                  </Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                        <SelectTrigger id="timezone" className="h-9 text-xs">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map(tz => (
                            <SelectItem key={tz.value} value={tz.value} className="text-xs">
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                      <p className="text-[9px] sm:text-[10px] text-slate-500 mt-1">
                        Alert sent immediately if no check-in by deadline
                  </p>
                </div>
              </div>
            )}

                {/* Step 4: Review */}
            {currentStep === 4 && (
                  <div className="space-y-2.5">
                    <div className="border rounded-lg p-3 bg-gradient-to-br from-white to-slate-50">
                      <div className="flex items-start gap-2 mb-2.5 pb-2.5 border-b">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-xs text-slate-900 mb-0.5">Emergency Message</h3>
                          <p className="text-xs text-slate-600 line-clamp-2">
                            {message}
                    </p>
                    {files.length > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              <FileText className="w-2.5 h-2.5 text-slate-400" />
                              <span className="text-[9px] text-slate-500">{files.length} file(s) attached</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-2 mb-2.5 pb-2.5 border-b">
                        <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                          <Users className="w-3.5 h-3.5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-xs text-slate-900 mb-0.5">
                            Contacts ({recipients.filter(r => r.name && r.email).length})
                    </h3>
                          <div className="space-y-0.5">
                            {recipients.filter(r => r.name && r.email).map((recipient, idx) => (
                              <div key={recipient.id} className="flex items-center gap-1.5">
                                <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                                  <span className="text-[9px] font-medium text-slate-600">{idx + 1}</span>
                                </div>
                                <p className="text-[10px] text-slate-600 truncate">
                                  {recipient.name} • {recipient.email}
                                </p>
                              </div>
                      ))}
                    </div>
                        </div>
                </div>

                      <div className="flex items-start gap-2">
                        <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                          <Clock className="w-3.5 h-3.5 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-xs text-slate-900 mb-0.5">Check-in Deadline</h3>
                          <p className="text-xs text-slate-600">
                            {deliveryDate && format(deliveryDate, "PP")} at {deliveryTime}
                          </p>
                          <p className="text-[9px] text-slate-500 mt-0.5">{timezone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex justify-between pt-3 border-t gap-2">
            <Button
              variant="outline"
                  size="sm"
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={currentStep === 1}
                  className="cursor-pointer h-9 text-xs px-3"
            >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                  Back
            </Button>
            
            {currentStep < 4 ? (
              <Button
                    size="sm"
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!isStepValid(currentStep)}
                    className="cursor-pointer h-9 text-xs px-3"
              >
                Next
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            ) : (
              <Button 
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 cursor-pointer h-9 text-xs px-3"
                disabled={!isStepValid(3)}
                    onClick={handleActivate}
              >
                    <Send className="w-3.5 h-3.5 mr-1" />
                    {editingMessageId ? 'Update' : 'Create'}
              </Button>
            )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Main Content */}
        {savedMessages.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="pt-8 pb-8 sm:pt-12 sm:pb-12">
              <div className="text-center max-w-md mx-auto px-4">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded-full mb-3 sm:mb-4">
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1.5 sm:mb-2">No Active Check-Ins</h3>
                <p className="text-xs sm:text-sm text-slate-600 mb-4 sm:mb-6">
                  Create a safety check-in to notify emergency contacts if you don't check in on time
                </p>
                <Button onClick={() => setIsDialogOpen(true)} className="gap-2 cursor-pointer w-full sm:w-auto text-sm">
                  <PlusCircle className="w-4 h-4" />
                  Create Your First Check-In
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {savedMessages.map((msg) => (
              <Card key={msg.id} className="hover:shadow-md transition-shadow">
                <CardContent className={cn(
                  msg.status === 'Active' ? 'pb-0' : 'pb-3 sm:pb-4'
                )}>
                  <div className="flex items-center justify-between mb-3 sm:mb-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Shield className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900 text-sm">Safety Check-In</h3>
                          <Badge variant={msg.status === 'In Review' ? 'secondary' : 'default'} className="text-xs px-2 py-0.5">
                            {msg.status}
                          </Badge>
                        </div>
                        <span className="text-xs text-slate-500 mt-0.5">
                          {msg.createdAt.toLocaleDateString()} at {msg.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    {/* Desktop Edit/Delete buttons - Only for In Review */}
                    {msg.status === 'In Review' && (
                      <div className="hidden sm:flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(msg)}
                          className="cursor-pointer hover:bg-blue-50 h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => confirmDelete(msg.id)}
                          className="cursor-pointer hover:bg-red-50 hover:text-red-600 h-8 w-8 p-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 sm:space-y-2.5">
                    <div>
                      <Label className="text-xs font-medium text-slate-500 mb-1 block">Emergency Message</Label>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {expandedMessageId === msg.id ? msg.message : truncateWords(msg.message, 20)}
                      </p>
                      {msg.message.split(' ').length > 20 && (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => setExpandedMessageId(expandedMessageId === msg.id ? null : msg.id)}
                          className="px-0 h-auto text-xs cursor-pointer mt-1"
                        >
                          {expandedMessageId === msg.id ? (
                            <>
                              <ChevronUp className="w-3.5 h-3.5 mr-1" />
                              View Less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3.5 h-3.5 mr-1" />
                              View More
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div>
                        <Label className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          Contacts
                        </Label>
                        <p className="text-sm text-slate-700">{msg.recipients.length} contact(s)</p>
                      </div>
                      
                      <div>
                        <Label className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Deadline
                        </Label>
                        <p className="text-sm text-slate-700 break-words">
                          {msg.deliveryDate ? format(msg.deliveryDate, "PP") : 'Not set'} {msg.deliveryTime}
                        </p>
                      </div>

                      <div>
                        <Label className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" />
                          Files
                        </Label>
                        <p className="text-sm text-slate-700">{msg.files.length} file(s)</p>
                      </div>
                    </div>

                    {msg.files.length > 0 && (
                      <div>
                        <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Attachments</Label>
                        <div className="flex flex-wrap gap-2">
                          {msg.files.map(file => (
                            <Badge key={file.id} variant="outline" className="text-xs py-1">
                              <FileText className="w-3 h-3 mr-1" />
                              {file.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Desktop Remove Button for Active messages */}
                    {msg.status === 'Active' && (
                      <div className="hidden sm:flex pt-3 border-t mt-3">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => confirmDelete(msg.id)}
                          className="w-full cursor-pointer h-9"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove Safety Check-In
                        </Button>
                      </div>
                    )}

                    {/* Mobile Edit/Delete buttons */}
                    <div className={cn(
                      "flex sm:hidden gap-2 border-t",
                      msg.status === 'Active' ? 'pt-3 mt-3' : 'pt-2'
                    )}>
                      {msg.status === 'In Review' ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(msg)}
                            className="flex-1 cursor-pointer hover:bg-blue-50 h-9"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => confirmDelete(msg.id)}
                            className="flex-1 cursor-pointer hover:bg-red-50 hover:text-red-600 hover:border-red-300 h-9"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => confirmDelete(msg.id)}
                          className="w-full cursor-pointer h-9"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove Safety Check-In
                        </Button>
                      )}
              </div>
            </div>
          </CardContent>
        </Card>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Confirm Removal
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to remove this safety check-in? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
                className="flex-1 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default Page