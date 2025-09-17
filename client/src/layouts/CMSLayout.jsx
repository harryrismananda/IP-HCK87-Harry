import { Outlet } from "react-router"
import { SideBar } from "../components/SideBar"
import { useState } from "react"

export const CMSLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-base-100">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden">
        <div 
          className={`fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity ${
            sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setSidebarOpen(false)}
        />
        <div className={`fixed left-0 top-0 z-30 transform transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <SideBar onClose={() => setSidebarOpen(false)} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <SideBar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header with menu button */}
        <div className="lg:hidden bg-base-200 p-4 border-b border-base-300">
          <button 
            className="btn btn-square btn-ghost"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        {/* Page content */}
        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />    
        </div>
      </div>
    </div>
  )
}
