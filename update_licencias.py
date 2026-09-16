import re

with open('app/valisven/licencias-activas/page.tsx', 'r') as f:
    content = f.read()

# 1. Imports
content = re.sub(r'Briefcase\n} from \'lucide-react\';', r"Briefcase,\n  Edit3,\n  Trash2\n} from 'lucide-react';", content)

# 2. States
state_insert = """  const [successMessage, setSuccessMessage] = useState('');
  
  // Edit & Delete states
  const [licenciaToDelete, setLicenciaToDelete] = useState<any>(null);
  const [catalogoToDelete, setCatalogoToDelete] = useState<any>(null);
  const [licenciaToEdit, setLicenciaToEdit] = useState<any>(null);
  const [catalogoToEdit, setCatalogoToEdit] = useState<any>(null);
"""
content = re.sub(r'  const \[successMessage, setSuccessMessage\] = useState\(\'\'\);', state_insert, content)

# 3. Actions
actions_code = """
  // Handlers para borrar
  const handleDeleteLicencia = async () => {
    if (!licenciaToDelete) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('valisven_licencias_activas').delete().eq('id', licenciaToDelete.id);
      if (error) throw error;
      setLicenciasActivas(licenciasActivas.filter(l => l.id !== licenciaToDelete.id));
      setSuccessMessage('Licencia activa eliminada con éxito');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      setLicenciaToDelete(null);
    } catch (err: any) {
      alert('Error al eliminar licencia: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCatalogo = async () => {
    if (!catalogoToDelete) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('valisven_licencias').delete().eq('id', catalogoToDelete.id);
      if (error) throw error;
      setCatalogo(catalogo.filter(c => c.id !== catalogoToDelete.id));
      setSuccessMessage('Producto del catálogo eliminado');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      setCatalogoToDelete(null);
    } catch (err: any) {
      alert('Error al eliminar producto (puede tener licencias activas o ventas vinculadas): ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitEditLicencia = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('valisven_licencias_activas')
        .update({
          fecha_activacion: licenciaToEdit.fecha_activacion,
          fecha_vencimiento: licenciaToEdit.fecha_vencimiento,
          estado: licenciaToEdit.estado,
          observacion: licenciaToEdit.observacion,
          clave_credencial: licenciaToEdit.clave_credencial
        })
        .eq('id', licenciaToEdit.id);
      if (error) throw error;
      setSuccessMessage('Licencia actualizada con éxito');
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setLicenciaToEdit(null);
        fetchData();
      }, 2000);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitEditCatalogo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('valisven_licencias')
        .update({
          tipo: catalogoToEdit.tipo,
          producto: catalogoToEdit.producto,
          costo_distribuidor: parseFloat(catalogoToEdit.costo_distribuidor) || 0,
          costo_venta: parseFloat(catalogoToEdit.costo_venta) || 0
        })
        .eq('id', catalogoToEdit.id);
      if (error) throw error;
      setSuccessMessage('Producto actualizado con éxito');
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setCatalogoToEdit(null);
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

# 4. Modales rendering (Delete & Edit) at the end just before <div className="fixed inset-0 z-50 flex items-center justify-center p-4"> (Register Modal)
modals = """
      {/* Modales de Edición y Borrado */}
      {licenciaToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setLicenciaToDelete(null)} />
          <div className="relative bg-slate-900 border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4 border border-red-500/30">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Eliminar Licencia Activa</h3>
              <p className="text-sm text-slate-400 mb-6">¿Deseas eliminar esta licencia activa? Esta acción no se puede deshacer.</p>
              <div className="flex w-full gap-3">
                <button onClick={() => setLicenciaToDelete(null)} className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors">Cancelar</button>
                <button onClick={handleDeleteLicencia} disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold transition-colors disabled:opacity-50">Borrar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {catalogoToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setCatalogoToDelete(null)} />
          <div className="relative bg-slate-900 border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4 border border-red-500/30">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Eliminar Producto</h3>
              <p className="text-sm text-slate-400 mb-6">¿Estás seguro de que deseas eliminar este producto del catálogo?</p>
              <div className="flex w-full gap-3">
                <button onClick={() => setCatalogoToDelete(null)} className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors">Cancelar</button>
                <button onClick={handleDeleteCatalogo} disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold transition-colors disabled:opacity-50">Borrar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {licenciaToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setLicenciaToEdit(null)} />
          <div className="relative bg-[#0B1021] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-white/5">
              <h3 className="text-xl text-white font-bold flex items-center gap-2"><Edit3 className="w-5 h-5 text-amber-500" /> Editar Licencia</h3>
              <button onClick={() => setLicenciaToEdit(null)} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-6">
              <form id="edit-lic-form" onSubmit={submitEditLicencia} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-300 font-semibold mb-1.5 block">Fecha Activación</label>
                    <input type="date" value={licenciaToEdit.fecha_activacion} onChange={e => setLicenciaToEdit({...licenciaToEdit, fecha_activacion: e.target.value})} className="w-full bg-slate-900 text-white px-3.5 py-2.5 rounded-xl border border-white/5" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 font-semibold mb-1.5 block">Fecha Vencimiento</label>
                    <input type="date" value={licenciaToEdit.fecha_vencimiento} onChange={e => setLicenciaToEdit({...licenciaToEdit, fecha_vencimiento: e.target.value})} className="w-full bg-slate-900 text-white px-3.5 py-2.5 rounded-xl border border-white/5" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-semibold mb-1.5 block">Estado</label>
                  <select value={licenciaToEdit.estado} onChange={e => setLicenciaToEdit({...licenciaToEdit, estado: e.target.value})} className="w-full bg-slate-900 text-white px-3.5 py-2.5 rounded-xl border border-white/5">
                    <option>Activa</option><option>Por Vencer</option><option>Vencida</option><option>Cancelada</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-semibold mb-1.5 block">Credenciales</label>
                  <input value={licenciaToEdit.clave_credencial || ''} onChange={e => setLicenciaToEdit({...licenciaToEdit, clave_credencial: e.target.value})} className="w-full bg-slate-900 text-white px-3.5 py-2.5 rounded-xl border border-white/5" placeholder="user:pass" />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-semibold mb-1.5 block">Observación</label>
                  <textarea value={licenciaToEdit.observacion || ''} onChange={e => setLicenciaToEdit({...licenciaToEdit, observacion: e.target.value})} className="w-full bg-slate-900 text-white px-3.5 py-2.5 rounded-xl border border-white/5" rows={2}></textarea>
                </div>
              </form>
            </div>
            <div className="p-6 pt-0 flex justify-end gap-3 mt-2">
              <button onClick={() => setLicenciaToEdit(null)} className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 text-sm font-semibold">Cancelar</button>
              <button form="edit-lic-form" disabled={isSubmitting} type="submit" className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm">Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}

      {catalogoToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setCatalogoToEdit(null)} />
          <div className="relative bg-[#0B1021] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-white/5">
              <h3 className="text-xl text-white font-bold flex items-center gap-2"><Edit3 className="w-5 h-5 text-amber-500" /> Editar Producto</h3>
              <button onClick={() => setCatalogoToEdit(null)} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-6">
              <form id="edit-cat-form" onSubmit={submitEditCatalogo} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-300 font-semibold mb-1.5 block">Categoría</label>
                  <select value={catalogoToEdit.tipo} onChange={e => setCatalogoToEdit({...catalogoToEdit, tipo: e.target.value})} className="w-full bg-slate-900 text-white px-3.5 py-2.5 rounded-xl border border-white/5">
                    <option>SVOD</option><option>AI</option><option>Música</option><option>Software</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-semibold mb-1.5 block">Producto</label>
                  <input value={catalogoToEdit.producto} onChange={e => setCatalogoToEdit({...catalogoToEdit, producto: e.target.value})} className="w-full bg-slate-900 text-white px-3.5 py-2.5 rounded-xl border border-white/5" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-300 font-semibold mb-1.5 block">Costo Distribuidor</label>
                    <input type="number" step="0.01" value={catalogoToEdit.costo_distribuidor} onChange={e => setCatalogoToEdit({...catalogoToEdit, costo_distribuidor: e.target.value})} className="w-full bg-slate-900 text-white px-3.5 py-2.5 rounded-xl border border-white/5" required />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 font-semibold mb-1.5 block">Precio Venta</label>
                    <input type="number" step="0.01" value={catalogoToEdit.costo_venta} onChange={e => setCatalogoToEdit({...catalogoToEdit, costo_venta: e.target.value})} className="w-full bg-slate-900 text-white px-3.5 py-2.5 rounded-xl border border-white/5" required />
                  </div>
                </div>
              </form>
            </div>
            <div className="p-6 pt-0 flex justify-end gap-3 mt-2">
              <button onClick={() => setCatalogoToEdit(null)} className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 text-sm font-semibold">Cancelar</button>
              <button form="edit-cat-form" disabled={isSubmitting} type="submit" className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm">Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}

      {registerModalOpen && (
"""
content = re.sub(r'      \{registerModalOpen && \(', modals, content)


# 5. Table edits
# Licencias Activas
td_licencias = """                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => setLicenciaToEdit(lic)} className="p-1.5 text-slate-400 hover:text-amber-400 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors" title="Editar">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setLicenciaToDelete(lic)} className="p-1.5 text-slate-400 hover:text-red-400 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors" title="Borrar">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>"""
content = re.sub(r'                        <td className="py-4 px-4 text-right">\n                          <button className="p-1\.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-300 transition-colors" title="Ver detalles">\n                            <Eye className="w-4 h-4" />\n                          </button>\n                        </td>\n                      </tr>', td_licencias, content)


# Catalogo
# Add Acciones column
content = re.sub(r'<th className="py-3 px-4 text-right rounded-tr-lg">Precio Sugerido Venta</th>', r'<th className="py-3 px-4 text-right">Precio Sugerido Venta</th>\n                    <th className="py-3 px-4 text-right rounded-tr-lg">Acciones</th>', content)

td_catalogo = """                      <td className="py-4 px-4 text-right font-mono text-emerald-400 font-bold">
                        B/. {parseFloat(cat.costo_venta).toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setCatalogoToEdit(cat)} className="p-1.5 text-slate-400 hover:text-cyan-400 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors" title="Editar">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => setCatalogoToDelete(cat)} className="p-1.5 text-slate-400 hover:text-red-400 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors" title="Borrar">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>"""
content = re.sub(r'                      <td className="py-4 px-4 text-right font-mono text-emerald-400 font-bold">\n                        B/\. \{parseFloat\(cat\.costo_venta\)\.toFixed\(2\)\}\n                      </td>\n                    </tr>', td_catalogo, content)

with open('app/valisven/licencias-activas/page.tsx', 'w') as f:
    f.write(content)
