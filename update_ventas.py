import re

with open('app/valisven/ventas/page.tsx', 'r') as f:
    content = f.read()

# 1. Imports
content = re.sub(r'Filter\n} from \'lucide-react\';', r"Filter,\n  Trash2,\n  Edit3\n} from 'lucide-react';", content)

# 2. States
state_insert = """  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit & Delete states
  const [ventaToDelete, setVentaToDelete] = useState<any>(null);
  const [clienteToDelete, setClienteToDelete] = useState<any>(null);
  const [ventaToEdit, setVentaToEdit] = useState<any>(null);
  const [clienteToEdit, setClienteToEdit] = useState<any>(null);
"""
content = re.sub(r'  const \[isSubmitting, setIsSubmitting\] = useState\(false\);', state_insert, content)

# 3. Actions - handleDeleteVenta, handleDeleteCliente, handleEditCliente, handleEditVenta
actions_code = """
  // Handlers para borrar
  const handleDeleteVenta = async () => {
    if (!ventaToDelete) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('valisven_ventas').delete().eq('id', ventaToDelete.id);
      if (error) throw error;
      setVentas(ventas.filter(v => v.id !== ventaToDelete.id));
      setSuccessMessage('Venta eliminada con éxito');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      setVentaToDelete(null);
    } catch (err: any) {
      alert('Error al eliminar: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCliente = async () => {
    if (!clienteToDelete) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('valisven_clientes').delete().eq('id', clienteToDelete.id);
      if (error) throw error;
      setClientes(clientes.filter(c => c.id !== clienteToDelete.id));
      setSuccessMessage('Cliente eliminado con éxito');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      setClienteToDelete(null);
    } catch (err: any) {
      alert('Error al eliminar cliente (posiblemente tiene ventas/licencias activas asociadas): ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler para editar cliente
  const submitEditCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('valisven_clientes')
        .update({
          nombre: clienteToEdit.nombre,
          correo: clienteToEdit.correo,
          celular: clienteToEdit.celular
        })
        .eq('id', clienteToEdit.id);
      if (error) throw error;
      setSuccessMessage('Cliente actualizado con éxito');
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setClienteToEdit(null);
        fetchData();
      }, 2000);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitEditVenta = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const pVenta = parseFloat(ventaToEdit.precio_venta) || 0;
      const cDist = parseFloat(ventaToEdit.costo_distribuidor) || 0;
      const gNeta = pVenta - cDist;
      const { error } = await supabase
        .from('valisven_ventas')
        .update({
          tipo_venta: ventaToEdit.tipo_venta,
          tiempo_vigencia: ventaToEdit.tiempo_vigencia,
          costo_venta: pVenta,
          costo_distribuidor: cDist,
          ganancia_neta: gNeta
        })
        .eq('id', ventaToEdit.id);
      if (error) throw error;
      setSuccessMessage('Venta actualizada con éxito');
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setVentaToEdit(null);
        fetchData();
      }, 2000);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchData = async () => {
"""
content = re.sub(r'  const fetchData = async \(\) => \{', actions_code, content)

# 4. Modales rendering (Delete & Edit) at the end just before <div className="fixed inset-0 z-50 flex items-center justify-center p-4"> (New Sale Modal)
modals = """
      {/* Modales de Edición y Borrado */}
      {ventaToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setVentaToDelete(null)} />
          <div className="relative bg-slate-900 border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4 border border-red-500/30">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Eliminar Venta</h3>
              <p className="text-sm text-slate-400 mb-6">
                ¿Estás seguro de que deseas eliminar esta venta? Esta acción no se puede deshacer.
              </p>
              <div className="flex w-full gap-3">
                <button onClick={() => setVentaToDelete(null)} className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors">Cancelar</button>
                <button onClick={handleDeleteVenta} disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold transition-colors disabled:opacity-50">Borrar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {clienteToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setClienteToDelete(null)} />
          <div className="relative bg-slate-900 border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4 border border-red-500/30">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Eliminar Cliente</h3>
              <p className="text-sm text-slate-400 mb-6">
                ¿Estás seguro de que deseas eliminar este cliente? Si tiene licencias o ventas activas, la acción podría fallar.
              </p>
              <div className="flex w-full gap-3">
                <button onClick={() => setClienteToDelete(null)} className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors">Cancelar</button>
                <button onClick={handleDeleteCliente} disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold transition-colors disabled:opacity-50">Borrar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {clienteToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setClienteToEdit(null)} />
          <div className="relative bg-[#0B1021] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-white/5">
              <h3 className="text-xl text-white font-bold flex items-center gap-2"><Edit3 className="w-5 h-5 text-amber-500" /> Editar Cliente</h3>
              <button onClick={() => setClienteToEdit(null)} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-6">
              <form id="edit-cliente-form" onSubmit={submitEditCliente} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-300 font-semibold mb-1.5 block">Nombre del Cliente</label>
                  <input value={clienteToEdit.nombre} onChange={e => setClienteToEdit({...clienteToEdit, nombre: e.target.value})} className="w-full bg-slate-900 text-white px-3.5 py-2.5 rounded-xl border border-white/5" required />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-semibold mb-1.5 block">Correo Electrónico (Opcional)</label>
                  <input value={clienteToEdit.correo} onChange={e => setClienteToEdit({...clienteToEdit, correo: e.target.value})} type="email" className="w-full bg-slate-900 text-white px-3.5 py-2.5 rounded-xl border border-white/5" />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-semibold mb-1.5 block">Celular (Opcional)</label>
                  <input value={clienteToEdit.celular} onChange={e => setClienteToEdit({...clienteToEdit, celular: e.target.value})} className="w-full bg-slate-900 text-white px-3.5 py-2.5 rounded-xl border border-white/5" />
                </div>
              </form>
            </div>
            <div className="p-6 pt-0 flex justify-end gap-3 mt-4">
              <button onClick={() => setClienteToEdit(null)} className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 text-sm font-semibold">Cancelar</button>
              <button form="edit-cliente-form" disabled={isSubmitting} type="submit" className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm">Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}

      {ventaToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setVentaToEdit(null)} />
          <div className="relative bg-[#0B1021] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-white/5">
              <h3 className="text-xl text-white font-bold flex items-center gap-2"><Edit3 className="w-5 h-5 text-amber-500" /> Editar Venta</h3>
              <button onClick={() => setVentaToEdit(null)} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-6">
              <form id="edit-venta-form" onSubmit={submitEditVenta} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-300 font-semibold mb-1.5 block">Tipo de Venta</label>
                    <select value={ventaToEdit.tipo_venta} onChange={e => setVentaToEdit({...ventaToEdit, tipo_venta: e.target.value})} className="w-full bg-slate-900 text-white px-3.5 py-2.5 rounded-xl border border-white/5">
                      <option>Nueva Licencia / Venta</option>
                      <option>Renovación</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 font-semibold mb-1.5 block">Vigencia</label>
                    <select value={ventaToEdit.tiempo_vigencia} onChange={e => setVentaToEdit({...ventaToEdit, tiempo_vigencia: e.target.value})} className="w-full bg-slate-900 text-white px-3.5 py-2.5 rounded-xl border border-white/5">
                      <option>30 Días</option><option>1 Mes</option><option>3 Meses</option><option>6 Meses</option><option>1 Año</option><option>Permanente (Lifetime)</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-300 font-semibold mb-1.5 block">Precio Venta (B/.)</label>
                    <input type="number" step="0.01" value={ventaToEdit.precio_venta} onChange={e => setVentaToEdit({...ventaToEdit, precio_venta: e.target.value})} className="w-full bg-slate-900 text-white px-3.5 py-2.5 rounded-xl border border-white/5" required />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 font-semibold mb-1.5 block">Costo Distribuidor (B/.)</label>
                    <input type="number" step="0.01" value={ventaToEdit.costo_distribuidor} onChange={e => setVentaToEdit({...ventaToEdit, costo_distribuidor: e.target.value})} className="w-full bg-slate-900 text-white px-3.5 py-2.5 rounded-xl border border-white/5" required />
                  </div>
                </div>
                <div className="mt-2 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <span className="text-xs text-emerald-400 block font-semibold mb-1">Ganancia Neta Recalculada:</span>
                  <span className="text-emerald-400 font-bold font-mono">B/. {((parseFloat(ventaToEdit.precio_venta)||0) - (parseFloat(ventaToEdit.costo_distribuidor)||0)).toFixed(2)}</span>
                </div>
              </form>
            </div>
            <div className="p-6 pt-0 flex justify-end gap-3 mt-2">
              <button onClick={() => setVentaToEdit(null)} className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 text-sm font-semibold">Cancelar</button>
              <button form="edit-venta-form" disabled={isSubmitting} type="submit" className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm">Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}

      {newSaleModal && (
"""
content = re.sub(r'      \{newSaleModal && \(', modals, content)

# 5. Table edits
# Ventas:
# add column header
content = re.sub(r'<th className="py-3 px-4 text-center">Estado</th>', r'<th className="py-3 px-4 text-center">Estado</th>\n                    <th className="py-3 px-4 text-right rounded-tr-lg">Acciones</th>', content)
content = re.sub(r'<th className="py-3 px-4 text-right rounded-tr-lg">Acciones</th>\n                    <th className="py-3 px-4 text-right rounded-tr-lg">Acciones</th>', r'<th className="py-3 px-4 text-right rounded-tr-lg">Acciones</th>', content)
# wait, there's no Acciones header initially? Ah, I saw `<th className="py-3 px-4 text-right rounded-tr-lg">Acciones</th>` in grep, so it's already there for Ventas!
# Let me replace the <td> that belongs to it.
td_acciones = """                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => setVentaToEdit({ ...sale, precio_venta: sale.costo_venta })} className="p-1.5 text-slate-400 hover:text-amber-400 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors" title="Editar">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setVentaToDelete(sale)} className="p-1.5 text-slate-400 hover:text-red-400 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors" title="Borrar">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>"""
content = re.sub(r'                        </td>\n                      </tr>', td_acciones, content)

# Clientes:
# Add header
content = re.sub(r'<th className="py-3 px-4 text-right rounded-tr-lg">ID Ref</th>', r'<th className="py-3 px-4 text-right">ID Ref</th>\n                    <th className="py-3 px-4 text-right rounded-tr-lg">Acciones</th>', content)
# Add <td>
td_clientes_acciones = """                      <td className="py-4 px-4 text-right font-mono text-xs text-slate-600">
                        {c.id.split('-')[0]}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setClienteToEdit(c)} className="p-1.5 text-slate-400 hover:text-cyan-400 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors" title="Editar">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => setClienteToDelete(c)} className="p-1.5 text-slate-400 hover:text-red-400 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors" title="Borrar">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>"""
content = re.sub(r'                      <td className="py-4 px-4 text-right font-mono text-xs text-slate-600">\n                        \{c\.id\.split\(\'-\'\)\[0\]\}\n                      </td>\n                    </tr>', td_clientes_acciones, content)

with open('app/valisven/ventas/page.tsx', 'w') as f:
    f.write(content)
