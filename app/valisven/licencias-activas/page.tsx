'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  MonitorSmartphone, 
  Key, 
  Search, 
  X, 
  Copy, 
  Eye, 
  Grid, 
  Shield, 
  PlayCircle, 
  Laptop,
  Plus,
  Tag,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Briefcase,
  Edit3,
  Trash2
} from 'lucide-react';
import { LoadingCube } from '@/app/components/LoadingCube';

export default function LicenciasActivasPage() {
  const supabase = createClient();

  const [licenciasActivas, setLicenciasActivas] = useState<any[]>([]);
  const [catalogo, setCatalogo] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination limits
  const [activasLimit, setActivasLimit] = useState(10);
  const [catalogoLimit, setCatalogoLimit] = useState(10);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Edit & Delete states
  const [licenciaToDelete, setLicenciaToDelete] = useState<any>(null);
  const [catalogoToDelete, setCatalogoToDelete] = useState<any>(null);
  const [licenciaToEdit, setLicenciaToEdit] = useState<any>(null);
  const [catalogoToEdit, setCatalogoToEdit] = useState<any>(null);

  
  const [nuevoProducto, setNuevoProducto] = useState({
    tipo: 'SVOD',
    producto: '',
    costo_distribuidor: '',
    costo_venta: ''
  });

  useEffect(() => {
    fetchData();
  }, []);


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

    setLoading(true);

    // Fetch Licencias Activas (Inventario/Bóveda)
    const { data: actData } = await supabase
      .from('valisven_licencias_activas')
      .select(`
        *,
        cliente:valisven_clientes(nombre, celular),
        licencia:valisven_licencias(producto, tipo)
      `)
      .order('fecha_ingreso', { ascending: false });

    // Fetch Catálogo (Productos)
    const { data: catData } = await supabase
      .from('valisven_licencias')
      .select('*')
      .order('fecha_creacion', { ascending: false });

    if (actData) setLicenciasActivas(actData);
    if (catData) setCatalogo(catData);
    
    setLoading(false);
  };

  const handleCopy = (text: string) => {
    if(!text) return;
    navigator.clipboard.writeText(text);
    alert('Copiado al portapapeles');
  };

  const handleRegisterProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsSubmitting(false);
      return;
    }

    const cDistribuidor = parseFloat(nuevoProducto.costo_distribuidor) || 0;
    const cVenta = parseFloat(nuevoProducto.costo_venta) || 0;

    const { error } = await supabase
      .from('valisven_licencias')
      .insert([{
        user_id: user.id,
        tipo: nuevoProducto.tipo,
        producto: nuevoProducto.producto,
        costo_distribuidor: cDistribuidor,
        costo_venta: cVenta
      }]);

    setIsSubmitting(false);

    if (error) {
      alert('Error registrando producto: ' + error.message);
    } else {
      setSuccessMessage('Producto registrado en el catálogo.');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      
      setNuevoProducto({ tipo: 'Streaming', producto: '', costo_distribuidor: '', costo_venta: '' });
      fetchData();
    }
  };

  const getProductIcon = (tipo: string) => {
    const t = tipo?.toLowerCase() || '';
    if (t.includes('svod')) return <PlayCircle className="w-5 h-5" />;
    if (t.includes('software')) return <Laptop className="w-5 h-5" />;
    if (t.includes('ai')) return <MonitorSmartphone className="w-5 h-5" />;
    if (t.includes('música') || t.includes('musica')) return <PlayCircle className="w-5 h-5" />;
    return <Grid className="w-5 h-5" />;
  };
  
  const getProductColor = (tipo: string) => {
    const t = tipo?.toLowerCase() || '';
    if (t.includes('svod')) return 'bg-red-700/20 text-red-400';
    if (t.includes('software')) return 'bg-emerald-500/20 text-emerald-400';
    if (t.includes('ai')) return 'bg-purple-500/20 text-purple-400';
    if (t.includes('música') || t.includes('musica')) return 'bg-green-500/20 text-green-400';
    return 'bg-blue-500/20 text-blue-400';
  };

  const getEstadoLicencia = (lic: any) => {
    if (!lic.fecha_vencimiento) {
      return { texto: 'En Bóveda', color: 'bg-slate-500/10 text-slate-400 border border-slate-500/20', icon: Key };
    }
    
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    const venci = new Date(lic.fecha_vencimiento);
    
    if (venci < hoy) {
      return { texto: 'Vencida', color: 'bg-rose-500/10 text-rose-400 border border-rose-500/20', icon: AlertTriangle };
    }
    
    // Si faltan menos de 7 días, advertencia
    const diffTime = Math.abs(venci.getTime() - hoy.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    if (diffDays <= 7) {
      return { texto: 'Por Vencer', color: 'bg-amber-500/10 text-amber-400 border border-amber-500/20', icon: Clock };
    }

    return { texto: 'Activa', color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', icon: CheckCircle2 };
  };

  const filteredActivas = licenciasActivas
    .filter(l => {
      const term = searchQuery.toLowerCase();
      const clienteName = l.cliente?.nombre?.toLowerCase() || '';
      const productName = l.licencia?.producto?.toLowerCase() || '';
      return clienteName.includes(term) || productName.includes(term);
    })
    .sort((a, b) => {
      if (!a.fecha_vencimiento) return 1;
      if (!b.fecha_vencimiento) return -1;
      return new Date(a.fecha_vencimiento).getTime() - new Date(b.fecha_vencimiento).getTime();
    });

  return (
    <div className="flex flex-col w-full">
      {showSuccess && <LoadingCube text={successMessage} theme="fin" />}
      {/* Header Area */}
      <div className="relative w-full overflow-hidden rounded-xl bg-slate-900/40 shadow-xl p-6 mb-8 border border-white/5">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-xs uppercase tracking-wider font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                LICENCIAS ACTIVAS
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-sm font-bold shadow-lg shadow-amber-500/25 transition-all active:scale-95"
              onClick={() => setRegisterModalOpen(true)}
            >
              <Plus className="w-5 h-5" />
              <span>Registrar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabla Licencias Activas */}
      <section className="rounded-xl bg-slate-950/80 shadow-2xl p-4 sm:p-6 mb-8 border border-white/5">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MonitorSmartphone className="w-5 h-5 text-amber-400" />
              Registro de Productos Activos
            </h2>
          </div>
          <div className="relative max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 w-5 h-5" />
            <input 
              className="w-full bg-slate-900/90 text-white placeholder:text-slate-500 text-sm pl-12 pr-10 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 shadow-inner" 
              placeholder="Buscar por cliente o producto..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              type="text"
            />
            {searchQuery && (
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white" onClick={() => setSearchQuery('')}>
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-slate-400 animate-pulse">Cargando licencias...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-900/60 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="py-3 px-4 rounded-tl-lg">Producto</th>
                    <th className="py-3 px-4">Cliente Asignado</th>
                    <th className="py-3 px-4">Vigencia</th>
                    <th className="py-3 px-4 text-center">Estado</th>
                    <th className="py-3 px-4">Observación</th>
                    <th className="py-3 px-4 text-right rounded-tr-lg">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {filteredActivas.slice(0, activasLimit).map((lic) => {
                    const statusInfo = getEstadoLicencia(lic);
                    const StatusIcon = statusInfo.icon;
                    return (
                      <tr key={lic.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${getProductColor(lic.licencia?.tipo)}`}>
                              {getProductIcon(lic.licencia?.tipo)}
                            </div>
                            <div>
                              <div className="text-white font-semibold text-sm">{lic.licencia?.producto || 'Desconocido'}</div>
                              <div className="text-xs text-slate-400">{lic.licencia?.tipo}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {lic.cliente ? (
                            <div className="flex flex-col">
                              <span className="text-white font-semibold text-sm">{lic.cliente.nombre}</span>
                              <span className="text-slate-400 text-xs">{lic.cliente.celular}</span>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-xs italic">Sin cliente asignado</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            {lic.fecha_vencimiento ? (
                              <>
                                <span className="font-mono text-xs text-slate-300">Exp: {new Date(lic.fecha_vencimiento).toLocaleDateString('es-PA')}</span>
                                {lic.fecha_activacion && <span className="font-mono text-xs text-slate-500 mt-0.5">Act: {new Date(lic.fecha_activacion).toLocaleDateString('es-PA')}</span>}
                              </>
                            ) : (
                              <span className="text-xs text-slate-500 italic">No definida</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${statusInfo.color}`}>
                            <StatusIcon className="w-3 h-3" /> {statusInfo.texto}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="inline-flex items-center gap-2 bg-slate-900 px-2.5 py-1 rounded-lg">
                            <span className="text-amber-300 tracking-wider font-mono text-xs">
                              {lic.clave_credencial ? '••••-••••' : 'Sin credencial'}
                            </span>
                            {lic.clave_credencial && (
                              <button onClick={() => handleCopy(lic.clave_credencial)} className="text-slate-400 hover:text-amber-300" title="Copiar credencial completa">
                                <Copy className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          {lic.observacion && <p className="text-[10px] text-slate-500 mt-1 max-w-[150px] truncate" title={lic.observacion}>{lic.observacion}</p>}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => setLicenciaToEdit(lic)} className="p-1.5 text-slate-400 hover:text-amber-400 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors" title="Editar">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setLicenciaToDelete(lic)} className="p-1.5 text-slate-400 hover:text-red-400 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors" title="Borrar">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredActivas.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-slate-500">No hay licencias activas registradas.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {filteredActivas.length > activasLimit && (
              <div className="mt-4 flex justify-center">
                <button 
                  onClick={() => setActivasLimit(9999)}
                  className="text-xs text-slate-400 hover:text-white bg-slate-900 px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Ver Todas las Licencias
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Tabla Catálogo de Licencias */}
      <section className="rounded-xl bg-slate-950/80 shadow-2xl p-4 sm:p-6 mb-8 border border-white/5">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-cyan-400" />
              Catálogo de Licencias Ofrecidas
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-slate-400 animate-pulse">Cargando catálogo...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-900/60 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="py-3 px-4 rounded-tl-lg">Producto</th>
                    <th className="py-3 px-4">Categoría / Tipo</th>
                    <th className="py-3 px-4 text-right">Costo Distribuidor</th>
                    <th className="py-3 px-4 text-right">Precio Sugerido Venta</th>
                    <th className="py-3 px-4 text-right rounded-tr-lg">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {catalogo.slice(0, catalogoLimit).map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getProductColor(cat.tipo)}`}>
                            {getProductIcon(cat.tipo)}
                          </div>
                          <span className="text-white font-semibold">{cat.producto}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-[11px] font-semibold">
                          <Tag className="w-3 h-3" /> {cat.tipo}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-rose-400 font-bold">
                        B/. {parseFloat(cat.costo_distribuidor).toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-emerald-400 font-bold">
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
                    </tr>
                  ))}
                  {catalogo.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-slate-500">No tienes productos registrados en tu catálogo. Usa el botón superior para Registrar.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {catalogo.length > catalogoLimit && (
              <div className="mt-4 flex justify-center">
                <button 
                  onClick={() => setCatalogoLimit(9999)}
                  className="text-xs text-slate-400 hover:text-white bg-slate-900 px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Ver Todo el Catálogo
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Modal Registrar Catálogo */}

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

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-950 shadow-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="text-xl text-white font-bold">Registrar Producto</h3>
              </div>
              <button className="text-slate-400 hover:text-white" onClick={() => setRegisterModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form className="mt-6 flex flex-col gap-5" onSubmit={handleRegisterProduct}>
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold mb-1.5">
                    <Tag className="w-3.5 h-3.5" /> Tipo / Categoría
                  </label>
                  <select 
                    value={nuevoProducto.tipo} 
                    onChange={e => setNuevoProducto({...nuevoProducto, tipo: e.target.value})}
                    className="w-full bg-slate-900 text-white text-sm px-3.5 py-2.5 rounded-xl focus:ring-2 focus:ring-amber-500/40 outline-none border border-white/5">
                    <option>SVOD</option>
                    <option>AI</option>
                    <option>Música</option>
                    <option>Software</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1.5">Nombre del Producto</label>
                  <input 
                    value={nuevoProducto.producto}
                    onChange={e => setNuevoProducto({...nuevoProducto, producto: e.target.value})}
                    className="w-full bg-slate-900 text-white text-sm px-3.5 py-2.5 rounded-xl focus:ring-2 focus:ring-amber-500/40 outline-none border border-white/5" 
                    placeholder="Ej: Microsoft 365 Familia" required type="text" 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold mb-1.5">
                    <DollarSign className="w-3.5 h-3.5" /> Costo Distribuidor (B/.)
                  </label>
                  <input 
                    value={nuevoProducto.costo_distribuidor}
                    onChange={e => setNuevoProducto({...nuevoProducto, costo_distribuidor: e.target.value})}
                    className="w-full bg-slate-900 text-white font-mono text-sm px-3.5 py-2.5 rounded-xl focus:ring-2 focus:ring-amber-500/40 outline-none border border-white/5" 
                    placeholder="0.00" required type="number" step="0.01" 
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold mb-1.5">
                    <DollarSign className="w-3.5 h-3.5" /> Precio Venta Público (B/.)
                  </label>
                  <input 
                    value={nuevoProducto.costo_venta}
                    onChange={e => setNuevoProducto({...nuevoProducto, costo_venta: e.target.value})}
                    className="w-full bg-slate-900 text-white font-mono text-sm px-3.5 py-2.5 rounded-xl focus:ring-2 focus:ring-amber-500/40 outline-none border border-white/5" 
                    placeholder="0.00" required type="number" step="0.01" 
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-2 pt-4 border-t border-white/5">
                <button type="button" className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 text-sm font-semibold transition-colors" onClick={() => setRegisterModalOpen(false)}>Cancelar</button>
                <button disabled={isSubmitting} type="submit" className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/30 transition-all disabled:opacity-50">Guardar Producto</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
