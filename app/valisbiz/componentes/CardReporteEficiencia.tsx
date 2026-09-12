'use client';

import { useState, useTransition } from 'react';
import { FileDown, Loader2, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { getDatosReporteEficiencia, type DatosReporteEficiencia } from '../acciones/reporte';

function fechaElegante(fechaStr: string) {
  const [y, m, d] = fechaStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const DIAS_ES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const MESES_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const dia = DIAS_ES[date.getDay()];
  const mes = MESES_ES[date.getMonth()];
  return `${d} ${mes} ${y}`;
}

async function generarPDF(datos: DatosReporteEficiencia): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
  const PW = 216;
  const MARGIN = 15;
  const CONTENT_W = PW - MARGIN * 2;

  // 1. Logo
  try {
    const response = await fetch('/keiko-logo.png');
    const blob = await response.blob();
    const logoBase64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
    doc.addImage(logoBase64, 'PNG', MARGIN, 8, 42, 27);
  } catch {
    // continúa sin logo
  }

  // 2. Banner rojo
  const bannerY = 40;
  doc.setFillColor(210, 0, 0);
  doc.rect(MARGIN, bannerY, CONTENT_W, 13, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text('REPORTE DE EFICIENCIA DE RUTA', PW / 2, bannerY + 9, { align: 'center' });

  // 3. Fila amarilla: etiquetas
  const labelY = bannerY + 13;
  const col1W = CONTENT_W * 0.42;
  const col2W = CONTENT_W * 0.33;
  const col3W = CONTENT_W - col1W - col2W;

  doc.setFillColor(255, 215, 0);
  doc.rect(MARGIN, labelY, col1W, 8, 'F');
  doc.rect(MARGIN + col1W, labelY, col2W, 8, 'F');
  doc.rect(MARGIN + col1W + col2W, labelY, col3W, 8, 'F');

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.6);
  doc.rect(MARGIN, labelY, CONTENT_W, 8);
  doc.line(MARGIN + col1W, labelY, MARGIN + col1W, labelY + 8);
  doc.line(MARGIN + col1W + col2W, labelY, MARGIN + col1W + col2W, labelY + 8);

  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('SUPERVISOR', MARGIN + col1W / 2, labelY + 5.5, { align: 'center' });
  doc.text('AGENCIA', MARGIN + col1W + col2W / 2, labelY + 5.5, { align: 'center' });
  doc.text('PERIODO', MARGIN + col1W + col2W + col3W / 2, labelY + 5.5, { align: 'center' });

  // 4. Datos del periodo
  const dataY = labelY + 8;
  doc.setFillColor(255, 255, 255);
  doc.rect(MARGIN, dataY, CONTENT_W, 11, 'F');
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.rect(MARGIN, dataY, CONTENT_W, 11);
  doc.line(MARGIN + col1W, dataY, MARGIN + col1W, dataY + 11);
  doc.line(MARGIN + col1W + col2W, dataY, MARGIN + col1W + col2W, dataY + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(datos.supervisor, MARGIN + col1W / 2, dataY + 7, { align: 'center' });
  doc.text(datos.agencia, MARGIN + col1W + col2W / 2, dataY + 7, { align: 'center' });
  doc.setFontSize(8);
  const periodoTxt = `${fechaElegante(datos.fecha_desde)} - ${fechaElegante(datos.fecha_hasta)}`;
  doc.text(periodoTxt, MARGIN + col1W + col2W + col3W / 2, dataY + 7, { align: 'center' });

  // 5. Tabla de vendedores
  const tableY = dataY + 15;

  const filas = datos.registros.map(r => [
    r.vendedor_nombre,
    r.sitios_asignados.toString(),
    r.visitas.toString(),
    r.con_compra.toString(),
    r.sin_compra.toString(),
    `${r.porcentaje_recorrido.toFixed(1)}%`,
    `${r.porcentaje_efectividad.toFixed(1)}%`
  ]);

  autoTable(doc, {
    startY: tableY,
    margin: { left: MARGIN, right: MARGIN },
    head: [[
      'Vendedor',
      'Asignados',
      'Visitas',
      'C / C',
      'S / C',
      '% Recorrido',
      'Efectividad'
    ]],
    body: filas,
    columnStyles: {
      0: { cellWidth: CONTENT_W * 0.28, halign: 'left' },
      1: { cellWidth: CONTENT_W * 0.12, halign: 'center' },
      2: { cellWidth: CONTENT_W * 0.12, halign: 'center' },
      3: { cellWidth: CONTENT_W * 0.12, halign: 'center' },
      4: { cellWidth: CONTENT_W * 0.12, halign: 'center' },
      5: { cellWidth: CONTENT_W * 0.12, halign: 'right', fontStyle: 'bold' },
      6: { cellWidth: CONTENT_W * 0.12, halign: 'right', fontStyle: 'bold' },
    },
    headStyles: {
      fillColor: [0, 0, 0],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'center',
      cellPadding: 2.5,
    },
    bodyStyles: {
      fontSize: 9,
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
      cellPadding: 2,
      minCellHeight: 7,
    },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    theme: 'grid',
  });

  return doc.output('blob');
}

export default function CardReporteEficiencia() {
  const hoy = new Date().toISOString().split('T')[0];
  const primerDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  
  const [fechaDesde, setFechaDesde] = useState(primerDiaMes);
  const [fechaHasta, setFechaHasta] = useState(hoy);
  
  const [isPending, startTransition] = useTransition();
  const [estado, setEstado] = useState<'idle' | 'generando' | 'listo' | 'error'>('idle');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const nombreArchivo = `Eficiencia_Ruta_${fechaDesde}_al_${fechaHasta}.pdf`;

  const handleGenerar = () => {
    setEstado('generando');
    setErrorMsg('');
    startTransition(async () => {
      try {
        const datos = await getDatosReporteEficiencia(fechaDesde, fechaHasta);
        const blob = await generarPDF(datos);
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        setEstado('listo');
      } catch (e: any) {
        setEstado('error');
        setErrorMsg(e?.message || 'Error al generar el PDF');
      }
    });
  };

  const handleDescargar = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = nombreArchivo;
    a.click();
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 flex flex-col gap-5 mt-2 mb-2">
      <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
        <div>
          <h3 className="text-lg font-bold text-[#131b2e] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-rose-600" />
            Reporte de Eficiencia de Ruta (PDF)
          </h3>
          <p className="text-sm text-[#3d4a42]">Genera un informe detallado con % de recorrido y efectividad de venta por periodo.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="flex flex-col flex-1 sm:flex-none">
            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Desde</label>
            <input 
              type="date"
              value={fechaDesde}
              onChange={e => { setFechaDesde(e.target.value); setEstado('idle'); }}
              className="bg-slate-50 border border-slate-200 text-[#131b2e] text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-rose-500 focus:bg-white transition-colors w-full sm:w-40"
            />
          </div>
          
          <div className="flex flex-col flex-1 sm:flex-none">
            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Hasta</label>
            <input 
              type="date"
              value={fechaHasta}
              onChange={e => { setFechaHasta(e.target.value); setEstado('idle'); }}
              className="bg-slate-50 border border-slate-200 text-[#131b2e] text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-rose-500 focus:bg-white transition-colors w-full sm:w-40"
            />
          </div>
          
          <div className="flex flex-col justify-end w-full sm:w-auto mt-2 sm:mt-0">
            {estado !== 'listo' ? (
              <button 
                onClick={handleGenerar}
                disabled={isPending || estado === 'generando'}
                className="bg-rose-600 hover:bg-rose-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-sm transition-all h-[42px] flex items-center justify-center gap-2"
              >
                {estado === 'generando' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileDown className="w-4 h-4" />
                )}
                {estado === 'generando' ? 'Generando...' : 'Generar PDF'}
              </button>
            ) : (
              <button 
                onClick={handleDescargar}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-sm transition-all h-[42px] flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Descargar PDF
              </button>
            )}
          </div>
        </div>
      </div>
      {estado === 'error' && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errorMsg}
        </div>
      )}
    </div>
  );
}
