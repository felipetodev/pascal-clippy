
export default function SearchButton () {
  return (
    <div className="flex items-center gap-6">
      <button type="button" className="md:w-full lg:w-96 order-2 lg:order-1">
        <div className=" flex group items-center justify-between bg-scaleA-200 border transition hover:border-scale-600 hover:bg-scaleA-300 border-scale-500 pl-1.5 md:pl-3 pr-1.5 w-full h-[32px] rounded">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sbui-icon text-scale-1100">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <p className="hidden md:flex text-scale-1100 text-sm group-hover:text-scale-1200 transition">Search docs...</p>
          </div>
          <div className="hidden md:flex items-center space-x-1">
            <div className="text-scale-1200 md:flex items-center justify-center h-5 w-10 border rounded bg-scale-500 border-scale-700 gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="sbui-icon ">
                <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path>
              </svg>
              <span className="text-[12px]">K</span>
            </div>
          </div>
        </div>
      </button>
    </div>
  )
}
