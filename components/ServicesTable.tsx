"use client";

import { useState } from "react";

export type Service = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  price: number;
  status: string;
};

export default function ServicesTable({ initialServices = [] }: { initialServices: Service[] }) {
  const [services, setServices] = useState<Service[]>(initialServices);
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [serviceToRemove, setServiceToRemove] = useState<Service | null>(null);

  // Form state
  const getToday = () => new Date().toISOString().split('T')[0];
  const getNextYear = () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  };

  const [newName, setNewName] = useState("");
  const [newStartDate, setNewStartDate] = useState(getToday());
  const [newEndDate, setNewEndDate] = useState(getNextYear());
  const [newPrice, setNewPrice] = useState("");

  const totalAmount = services.filter(s => s.status === 'Active').reduce((sum, service) => sum + service.price, 0);

  const handleToggleStatus = (id: string) => {
    setServices(services.map(s => {
      if (s.id === id) {
        return { ...s, status: s.status === "Active" ? "Inactive" : "Active" };
      }
      return s;
    }));
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newStartDate || !newEndDate || !newPrice) return;
    
    const nextService: Service = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName,
      startDate: newStartDate,
      endDate: newEndDate,
      price: parseFloat(newPrice),
      status: "Active"
    };
    
    setServices([...services, nextService]);
    setNewName("");
    setNewStartDate(getToday());
    setNewEndDate(getNextYear());
    setNewPrice("");
    setIsAddOpen(false);
  };

  const confirmRemove = () => {
    if (serviceToRemove) {
      setServices(services.filter(s => s.id !== serviceToRemove.id));
      setServiceToRemove(null);
    }
  };

  return (
    <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/30 dark:bg-zinc-900/10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-white">Services Taken</h2>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="text-sm px-4 py-2 bg-blue-600 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors font-medium flex items-center justify-center shadow-sm"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
          Add Service
        </button>
      </div>

      {services.length > 0 ? (
        <>
          <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm mb-3 bg-white dark:bg-zinc-900">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 text-xs uppercase text-zinc-500 dark:text-zinc-400 font-medium">
                  <th className="py-2.5 px-4 whitespace-nowrap">Service Name</th>
                  <th className="py-2.5 px-4 whitespace-nowrap text-zinc-500 text-xs">Start Date</th>
                  <th className="py-2.5 px-4 whitespace-nowrap text-zinc-500 text-xs">End Date</th>
                  <th className="py-2.5 px-4 whitespace-nowrap text-right">Price</th>
                  <th className="py-2.5 px-4 text-center whitespace-nowrap">Status</th>
                  <th className="py-2.5 px-4 text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {services.map((service) => (
                  <tr key={service.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors group">
                    <td className="py-2.5 px-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">{service.name}</td>
                    <td className="py-2.5 px-4 text-sm text-zinc-600 dark:text-zinc-400 whitespace-nowrap">{service.startDate}</td>
                    <td className="py-2.5 px-4 text-sm text-zinc-600 dark:text-zinc-400 whitespace-nowrap">{service.endDate}</td>
                    <td className="py-2.5 px-4 text-sm text-zinc-900 dark:text-zinc-100 font-medium text-right whitespace-nowrap">
                      ${service.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <div className="flex items-center justify-center">
                        <button 
                          onClick={() => handleToggleStatus(service.id)}
                          className={`relative inline-flex h-5 w-9 mr-2 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 ${service.status === 'Active' ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                          title={`Click to mark as ${service.status === 'Active' ? 'Inactive' : 'Active'}`}
                        >
                          <span className="sr-only">Toggle status</span>
                          <span 
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${service.status === 'Active' ? 'translate-x-4' : 'translate-x-0.5'}`}
                          />
                        </button>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider w-[64px] justify-center ${
                          service.status === 'Active' 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400' 
                            : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}>
                          {service.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button 
                        onClick={() => setServiceToRemove(service)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1"
                        title="Remove Service"
                      >
                        <span className="sr-only">Remove</span>
                        <svg className="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end pr-2 py-1">
            <div className="flex items-center gap-4 border-t-0 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm min-w-[300px] justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Total Amount</span>
              <span className="text-xl font-bold text-zinc-900 dark:text-white">
                ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className="p-8 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No active services. Add one to get started.</p>
        </div>
      )}

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden transform transition-all scale-100">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/50">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Add New Service</h3>
            </div>
            <form onSubmit={handleAddService} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Service Name</label>
                <input 
                  type="text" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                  className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                  placeholder="e.g. Graphic Design"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Start Date</label>
                  <input 
                    type="date" 
                    value={newStartDate} 
                    onChange={(e) => setNewStartDate(e.target.value)} 
                    className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">End Date</label>
                  <input 
                    type="date" 
                    value={newEndDate} 
                    onChange={(e) => setNewEndDate(e.target.value)} 
                    className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Price ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  value={newPrice} 
                  onChange={(e) => setNewPrice(e.target.value)} 
                  className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                  placeholder="e.g. 1500.00"
                  required
                />
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800/50 mt-2">
                <button 
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 mt-2 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 mt-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-zinc-900"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Confirmation Modal */}
      {serviceToRemove && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 transform transition-all scale-100">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Remove Service</h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-8">
              Are you sure you want to remove <strong>{serviceToRemove.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setServiceToRemove(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmRemove}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
