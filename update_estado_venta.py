import re

with open('app/valisven/ventas/page.tsx', 'r') as f:
    content = f.read()

# Add handler for updateEstadoPago
handler = """
  const updateEstadoPago = async (ventaId: string, nuevoEstado: string) => {
    try {
      const { error } = await supabase
        .from('valisven_ventas')
        .update({ estado_pago: nuevoEstado })
        .eq('id', ventaId);
        
      if (error) {
        // If the column doesn't exist yet, warn the user
        if (error.message.includes("column") || error.code === "42703") {
           alert("Por favor, crea la columna 'estado_pago' (tipo text) en la tabla 'valisven_ventas' en tu base de datos Supabase.");
        } else {
           throw error;
        }
      } else {
        // Update local state to reflect change instantly
        setVentas(ventas.map(v => v.id === ventaId ? { ...v, estado_pago: nuevoEstado } : v));
      }
    } catch (err: any) {
      alert('Error al actualizar estado: ' + err.message);
    }
  };

  const fetchData = async () => {
"""
content = re.sub(r'  const fetchData = async \(\) => \{', handler, content)

# Modify the Estado column rendering in the table
# Current:
# <td className="py-4 px-4 text-center">
#   <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${statusInfo.color}`}>
#     <StatusIcon className="w-3 h-3" /> {statusInfo.texto}
#   </span>
# </td>

new_estado_td = """                        <td className="py-4 px-4 text-center">
                          <select 
                            value={sale.estado_pago || 'Completado'} 
                            onChange={(e) => updateEstadoPago(sale.id, e.target.value)}
                            className={`text-xs font-bold rounded-lg px-2 py-1.5 border-r-4 outline-none appearance-none cursor-pointer transition-colors ${
                              (sale.estado_pago || 'Completado') === 'Completado' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500 hover:bg-emerald-500/20' :
                              (sale.estado_pago === 'Pendiente') ? 'bg-amber-500/10 text-amber-400 border-amber-500 hover:bg-amber-500/20' :
                              'bg-rose-500/10 text-rose-400 border-rose-500 hover:bg-rose-500/20'
                            }`}
                          >
                            <option value="Completado" className="bg-slate-900 text-emerald-400">Completado</option>
                            <option value="Pendiente" className="bg-slate-900 text-amber-400">Pendiente</option>
                            <option value="Declinado" className="bg-slate-900 text-rose-400">Declinado</option>
                          </select>
                        </td>"""

content = re.sub(r'                        <td className="py-4 px-4 text-center">\n                          <span className=\{`inline-flex items-center gap-1\.5 px-2\.5 py-1 rounded-full text-\[11px\] font-bold \$\{statusInfo\.color\}`\}>\n                            <StatusIcon className="w-3 h-3" /> \{statusInfo\.texto\}\n                          </span>\n                        </td>', new_estado_td, content)

with open('app/valisven/ventas/page.tsx', 'w') as f:
    f.write(content)

