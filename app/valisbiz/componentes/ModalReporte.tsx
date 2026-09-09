'use client';

import { useState, useTransition } from 'react';
import { X, FileDown, Share2, Calendar, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { getDatosReporteDia, type DatosReporteDia } from '../acciones/reporte';

interface ModalReporteProps {
  onClose: () => void;
}

// Días y meses en español
const DIAS_ES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function fechaElegante(fechaStr: string) {
  const [y, m, d] = fechaStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dia = DIAS_ES[date.getDay()];
  const mes = MESES_ES[date.getMonth()];
  return `${dia} ${d} de ${mes} ${y}`;
}

function fmt(n: number) {
  return n.toLocaleString('es-PA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function generarPDF(datos: DatosReporteDia): Promise<Blob> {
  // Importación dinámica para evitar SSR
  const { jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const PW = 297; // A4 landscape width
  const MARGIN = 14;
  const CONTENT_W = PW - MARGIN * 2;

  // ── 1. Logo Keiko ──────────────────────────────────────────────────
  try {
    const response = await fetch('/keiko-logo.png');
    const blob = await response.blob();
    const reader = new FileReader();
    const logoBase64 = await new Promise<string>((resolve) => {
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
    doc.addImage(logoBase64, 'PNG', MARGIN, 8, 38, 22);
  } catch {
    // Si no carga el logo, continúa sin él
  }

  // ── 2. Banner rojo: INFORMES DE VENTAS DIARIAS ─────────────────────
  const bannerY = 36;
  doc.setFillColor(220, 0, 0); // rojo Keiko
  doc.rect(MARGIN, bannerY, CONTENT_W, 12, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('INFORMES DE VENTAS DIARIAS', PW / 2, bannerY + 8.5, { align: 'center' });

  // ── 3. Fila amarilla: etiquetas SUPERVISOR / AGENCIA / FECHA ───────
  const labelY = bannerY + 12;
  const col1W = CONTENT_W * 0.4;
  const col2W = CONTENT_W * 0.35;
  const col3W = CONTENT_W * 0.25;

  doc.setFillColor(255, 220, 0); // amarillo Keiko
  doc.rect(MARGIN, labelY, col1W, 8, 'F');
  doc.rect(MARGIN + col1W, labelY, col2W, 8, 'F');
  doc.rect(MARGIN + col1W + col2W, labelY, col3W, 8, 'F');

  // Líneas negras separadoras
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(MARGIN, labelY, CONTENT_W, 8);
  doc.line(MARGIN + col1W, labelY, MARGIN + col1W, labelY + 8);
  doc.line(MARGIN + col1W + col2W, labelY, MARGIN + col1W + col2W, labelY + 8);

  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('SUPERVISOR', MARGIN + col1W / 2, labelY + 5.5, { align: 'center' });
  doc.text('AGENCIA', MARGIN + col1W + col2W / 2, labelY + 5.5, { align: 'center' });
  doc.text('FECHA', MARGIN + col1W + col2W + col3W / 2, labelY + 5.5, { align: 'center' });

  // ── 4. Fila datos: Jennifer Camaño / Panamá Oeste / fecha ──────────
  const dataY = labelY + 8;
  doc.setFillColor(255, 255, 255);
  doc.rect(MARGIN, dataY, CONTENT_W, 10, 'F');
  doc.setDrawColor(0, 0, 0);
  doc.rect(MARGIN, dataY, CONTENT_W, 10);
  doc.line(MARGIN + col1W, dataY, MARGIN + col1W, dataY + 10);
  doc.line(MARGIN + col1W + col2W, dataY, MARGIN + col1W + col2W, dataY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(datos.supervisor, MARGIN + col1W / 2, dataY + 6.5, { align: 'center' });
  doc.text(datos.agencia, MARGIN + col1W + col2W / 2, dataY + 6.5, { align: 'center' });
  doc.text(fechaElegante(datos.fecha), MARGIN + col1W + col2W + col3W / 2, dataY + 6.5, { align: 'center' });

  // ── 5. Observación ──────────────────────────────────────────────────
  const obsY = dataY + 10;
  doc.setFillColor(255, 255, 255);
  doc.rect(MARGIN, obsY, CONTENT_W, 18, 'F');
  doc.setDrawColor(0, 0, 0);
  doc.rect(MARGIN, obsY, CONTENT_W, 18);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`OBSERVACION:  ${datos.observacion}`, MARGIN + 3, obsY + 6);

  // ── 6. Tabla de vendedores ──────────────────────────────────────────
  const tableY = obsY + 18;

  const totalVistas = datos.registros.reduce((s, r) => s + r.vistas, 0);
  const totalConCompra = datos.registros.reduce((s, r) => s + r.con_compra, 0);
  const totalSinCompra = datos.registros.reduce((s, r) => s + r.sin_compra, 0);
  const totalContado = datos.registros.reduce((s, r) => s + r.contado, 0);
  const totalCredito = datos.registros.reduce((s, r) => s + r.credito, 0);
  const totalGeneral = datos.registros.reduce((s, r) => s + r.total, 0);

  // Filas de datos (rellenar hasta al menos 8 filas para mantener el formato)
  const filas = datos.registros.map(r => [
    r.vendedor_nombre,
    r.vistas.toString(),
    r.con_compra.toString(),
    r.sin_compra.toString(),
    fmt(r.contado),
    fmt(r.credito),
    fmt(r.total),
  ]);

  // Rellenar filas vacías hasta completar 8
  while (filas.length < 8) {
    filas.push(['', '', '', '', '', '', '']);
  }

  autoTable(doc, {
    startY: tableY,
    margin: { left: MARGIN, right: MARGIN },
    head: [[
      '',
      'vistas',
      'con compra',
      'sin compra',
      'contado',
      'credito',
      'total',
    ]],
    body: [
      ...filas,
      // Fila total con fondo amarillo
      ['', '', '', '', '', '', fmt(totalGeneral)],
    ],
    foot: [],
    columnStyles: {
      0: { cellWidth: CONTENT_W * 0.22, halign: 'left' },
      1: { cellWidth: CONTENT_W * 0.1, halign: 'center' },
      2: { cellWidth: CONTENT_W * 0.12, halign: 'center' },
      3: { cellWidth: CONTENT_W * 0.12, halign: 'center' },
      4: { cellWidth: CONTENT_W * 0.14, halign: 'right' },
      5: { cellWidth: CONTENT_W * 0.14, halign: 'right' },
      6: { cellWidth: CONTENT_W * 0.16, halign: 'right', fontStyle: 'bold' },
    },
    headStyles: {
      fillColor: [0, 0, 0],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 9,
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
    },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    // Colorear fila de total en amarillo
    didParseCell: (data) => {
      if (data.section === 'body' && data.row.index === filas.length) {
        data.cell.styles.fillColor = [255, 220, 0];
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.textColor = [0, 0, 0];
      }
    },
    theme: 'grid',
  });

  return doc.output('blob');
}

export default function ModalReporte({ onClose }: ModalReporteProps) {
  const hoy = new Date().toISOString().split('T')[0];
  const [fecha, setFecha] = useState(hoy);
  const [isPending, startTransition] = useTransition();
  const [estado, setEstado] = useState<'idle' | 'generando' | 'listo' | 'error'>('idle');
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const nombreArchivo = `Informe_Ventas_Diarias_${fecha}.pdf`;

  const handleGenerar = () => {
    setEstado('generando');
    setErrorMsg('');
    startTransition(async () => {
      try {
        const datos = await getDatosReporteDia(fecha);
        const blob = await generarPDF(datos);
        const url = URL.createObjectURL(blob);
        setPdfBlob(blob);
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

  const handleCompartir = async () => {
    if (!pdfBlob) return;
    const file = new File([pdfBlob], nombreArchivo, { type: 'application/pdf' });
    if (navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: 'Informe de Ventas Diarias',
          text: `Reporte Keiko · ${fechaElegante(fecha)}`,
          files: [file],
        });
      } catch {
        // Usuario canceló
      }
    } else {
      // Fallback: abrir en nueva pestaña
      window.open(pdfUrl!, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              <FileDown className="w-5 h-5" />
              Generar Reporte PDF
            </h2>
            <p className="text-red-100 text-xs mt-0.5">Informe de Ventas Diarias · Formato Keiko</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5">
          {/* Preview del formato */}
          <div className="border-2 border-slate-200 rounded-xl overflow-hidden">
            {/* Mini preview del reporte */}
            <div className="bg-red-600 text-white text-center text-[10px] font-bold py-1.5 tracking-widest uppercase">
              INFORMES DE VENTAS DIARIAS
            </div>
            <div className="grid grid-cols-3 bg-yellow-300 text-[9px] font-bold text-center border-b border-black">
              <span className="border-r border-black py-1">SUPERVISOR</span>
              <span className="border-r border-black py-1">AGENCIA</span>
              <span className="py-1">FECHA</span>
            </div>
            <div className="grid grid-cols-3 text-[8px] text-center border-b border-slate-300 bg-white">
              <span className="border-r border-slate-200 py-1 truncate px-1">Jennifer Camaño</span>
              <span className="border-r border-slate-200 py-1 truncate px-1">Panamá Oeste</span>
              <span className="py-1 text-slate-500 px-1">
                {fechaElegante(fecha).split(' ').slice(0, 3).join(' ')}
              </span>
            </div>
            <div className="grid grid-cols-7 bg-black text-white text-[7px] font-bold text-center py-1">
              <span className="col-span-2 border-r border-white/30">Vendedor</span>
              <span className="border-r border-white/30">Vistas</span>
              <span className="border-r border-white/30">C/C</span>
              <span className="border-r border-white/30">S/C</span>
              <span className="border-r border-white/30">Contado</span>
              <span>Total</span>
            </div>
            <div className="text-[7px] text-slate-400 text-center py-2 bg-slate-50 italic">
              · · · datos del día seleccionado · · ·
            </div>
          </div>

          {/* Selector de fecha */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <Calendar className="w-4 h-4 text-red-500" />
              Fecha del reporte
            </label>
            <input
              type="date"
              value={fecha}
              max={new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString().split('T')[0]}
              onChange={e => {
                setFecha(e.target.value);
                setEstado('idle');
                if (pdfUrl) { URL.revokeObjectURL(pdfUrl); setPdfUrl(null); }
                setPdfBlob(null);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-all"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Se incluirán todos los registros del vendedor para ese día.
            </p>
          </div>

          {/* Estado */}
          {estado === 'error' && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {errorMsg}
            </div>
          )}
          {estado === 'listo' && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              PDF generado correctamente. Descarga o comparte.
            </div>
          )}

          {/* Botones */}
          {estado !== 'listo' ? (
            <button
              onClick={handleGenerar}
              disabled={isPending || estado === 'generando' || !fecha}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-md"
            >
              {estado === 'generando' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Generando PDF...</>
              ) : (
                <><FileDown className="w-4 h-4" /> Generar PDF</>
              )}
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleDescargar}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <FileDown className="w-4 h-4" />
                Descargar
              </button>
              <button
                onClick={handleCompartir}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <Share2 className="w-4 h-4" />
                Compartir
              </button>
            </div>
          )}

          {/* Regenerar */}
          {estado === 'listo' && (
            <button
              onClick={() => { setEstado('idle'); setPdfBlob(null); if (pdfUrl) URL.revokeObjectURL(pdfUrl); setPdfUrl(null); }}
              className="text-xs text-slate-400 hover:text-slate-600 text-center transition-colors"
            >
              Cambiar fecha y regenerar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
