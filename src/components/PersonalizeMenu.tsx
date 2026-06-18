"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Settings, Moon, Sun, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const COLORS = [
  { name: "purple", class: "bg-violet-500" },
  { name: "blue", class: "bg-blue-500" },
  { name: "green", class: "bg-green-500" },
  { name: "rose", class: "bg-rose-500" },
  { name: "orange", class: "bg-orange-500" },
  { name: "mango", class: "bg-yellow-500" },
]

export function PersonalizeMenu() {
  const { setTheme, theme } = useTheme()
  const [accent, setAccent] = React.useState("purple")

  React.useEffect(() => {
    const savedAccent = localStorage.getItem("app-accent") || "purple"
    setAccent(savedAccent)
    document.documentElement.setAttribute("data-color", savedAccent)
  }, [])

  const handleAccentChange = (color: string) => {
    setAccent(color)
    localStorage.setItem("app-accent", color)
    document.documentElement.setAttribute("data-color", color)
  }

  const handleBgUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    localStorage.setItem("app-bg-url", url)
    // Dispatch a custom event so page.tsx can listen to it
    window.dispatchEvent(new Event("app-bg-changed"))
  }

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        localStorage.setItem("app-bg-url", base64String)
        window.dispatchEvent(new Event("app-bg-changed"))
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="border-slate-300 dark:border-slate-700/50 bg-white/50 dark:bg-black/30 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-black/50 hover:text-slate-900 dark:hover:text-white transition-all">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Personalize</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200 dark:border-white/10">
        <DropdownMenuLabel className="text-slate-900 dark:text-slate-200">Theme</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-200 dark:bg-white/10" />
        
        <DropdownMenuItem onClick={() => setTheme("light")} className={cn("text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10", theme === "light" && "bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className={cn("text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10", theme === "dark" && "bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white")}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className={cn("text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10", theme === "system" && "bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white")}>
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-slate-200 dark:bg-white/10 mt-2" />
        <DropdownMenuLabel className="text-slate-900 dark:text-slate-200">Accent Color</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-200 dark:bg-white/10" />
        
        <div className="flex items-center justify-between px-2 py-2">
          {COLORS.map((c) => (
            <button
              key={c.name}
              onClick={() => handleAccentChange(c.name)}
              className={cn(
                "h-6 w-6 rounded-full flex items-center justify-center ring-offset-slate-100 dark:ring-offset-slate-950 transition-all hover:scale-110",
                c.class,
                accent === c.name ? "ring-2 ring-slate-900 dark:ring-white ring-offset-2" : "opacity-70 hover:opacity-100"
              )}
              title={c.name.charAt(0).toUpperCase() + c.name.slice(1)}
            />
          ))}
        </div>

        <DropdownMenuSeparator className="bg-slate-200 dark:bg-white/10 mt-2" />
        <DropdownMenuLabel className="text-slate-900 dark:text-slate-200">Background Image</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-200 dark:bg-white/10" />
        
        <div className="p-2 space-y-2">
          <input 
            type="text" 
            placeholder="Image URL..." 
            onChange={handleBgUrlChange}
            className="w-full text-xs px-2 py-1.5 rounded bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand"
          />
          <div className="relative">
            <input 
              type="file" 
              accept="image/*"
              onChange={handleBgUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button variant="outline" size="sm" className="w-full text-xs bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
              Upload Image
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
