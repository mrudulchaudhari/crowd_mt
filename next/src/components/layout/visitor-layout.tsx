"use client"

import type React from "react"
import { useState } from "react"
import { Home, Map, AlertTriangle, HelpCircle, Phone } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { Modal } from "@/src/components/ui/modal"
import { cn } from "@/lib/utils"

interface VisitorLayoutProps {
  children: React.ReactNode
}

const navigationItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/map", icon: Map, label: "Map" },
  { href: "/alerts", icon: AlertTriangle, label: "Alerts" },
  { href: "/help", icon: HelpCircle, label: "Help" },
]

const emergencyContacts = [
  { name: "Emergency Services", number: "911", type: "emergency" },
  { name: "Festival Security", number: "(555) 123-4567", type: "security" },
  { name: "Medical Tent", number: "(555) 123-4568", type: "medical" },
  { name: "Lost & Found", number: "(555) 123-4569", type: "info" },
]

export function VisitorLayout({ children }: VisitorLayoutProps) {
  const pathname = usePathname()
  const [sosModalOpen, setSosModalOpen] = useState(false)

  const handleEmergencyCall = (number: string) => {
    window.location.href = `tel:${number}`
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content */}
      <main className="flex-1 pb-20">{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-40">
        <div className="flex items-center justify-around py-2 px-4">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors",
                  isActive
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100",
                )}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Floating SOS Button */}
      <Button
        onClick={() => setSosModalOpen(true)}
        className="fixed bottom-24 right-4 z-50 h-14 w-14 rounded-full shadow-lg bg-red-600 hover:bg-red-700 text-white border-2 border-white dark:border-gray-900"
        aria-label="Emergency SOS"
      >
        <Phone className="h-6 w-6" />
      </Button>

      {/* SOS Emergency Modal */}
      <Modal
        isOpen={sosModalOpen}
        onClose={() => setSosModalOpen(false)}
        title="Emergency Contacts"
        className="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Tap any number below to call immediately. For life-threatening emergencies, call 911.
          </p>

          <div className="space-y-3">
            {emergencyContacts.map((contact, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{contact.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{contact.number}</p>
                </div>
                <Button
                  onClick={() => handleEmergencyCall(contact.number)}
                  variant={contact.type === "emergency" ? "danger" : "primary"}
                  size="sm"
                  className="ml-4"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Location Services:</strong> Enable location sharing when calling emergency services to help them
              find you quickly.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  )
}
