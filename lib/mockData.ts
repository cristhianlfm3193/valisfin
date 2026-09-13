export const familyData = {
  names: "Cristhian & Jennifer",
  status: "Hogar Protegido",
  month: "Septiembre 2026",
  heroMessage: "¡Hola, Cristhian y Jennifer!",
  heroQuote: "\"Cada balboa administrado con sabiduría es un paso seguro hacia el futuro, la educación y la sonrisa de nuestra pequeña.\"",
  heroImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuBngW9FDhZHeCm5ywRMhxvXP02HnMoCWtZV843eIhM09rWNPbLjHYpGz3ec0mVOD4L9Z5DQujnx_LRJO2_YVfz3ynQ2VLjhkon2iHWB8cMcWVey1YHxPTTVdQ3jd1A4K93FCyqw2nbMzj1yyZwSg3VD8EZafF2X5cZ7qJhaWViOfx0hqlAZBtG7zojkmhRnpFKuILCuMt107gxTciRbJSLWCd_12NPV8K6hIhw_xTfjF3cz3BTSmv8fdLn9nH40atLUjg",
};

export const metrics = {
  actualBalance: 829.75,
  incomesReceived: 1023.70,
  availableEstimated: -6.25,
  paymentsDone: 144.00,
  dailyExpenses: 49.95,
  pendingPayments: 836.00,
  goalsCompleted: 2,
  goalsTotal: 14,
  goalsPercentage: 14,
};

export const coupleBreakdown = [
  {
    id: "cf",
    name: "Cristhian Fuentes",
    initials: "CF",
    role: "Co-administrador",
    color: "blue",
    incomes: 594.84,
    expenses: 118.95,
    balance: 475.89
  },
  {
    id: "jc",
    name: "Jennifer Camaño",
    initials: "JC",
    role: "Co-administradora",
    color: "purple",
    incomes: 428.86,
    expenses: 75.00,
    balance: 353.86
  }
];

export const upcomingBills = [
  {
    id: 1,
    icon: "🍼",
    colorClass: "bg-pink-50 text-pink-700",
    title: "Cuidado & Estimulación Bebé",
    subtitle: "Vence en 4 días • Mensualidad",
    amount: 180.00
  },
  {
    id: 2,
    icon: "⚡",
    colorClass: "bg-blue-50 text-blue-700",
    title: "Electricidad Naturgy",
    subtitle: "Vence en 6 días • Servicio hogar",
    amount: 74.50
  },
  {
    id: 3,
    icon: "🌐",
    colorClass: "bg-slate-100 text-slate-700",
    title: "Internet Residencial",
    subtitle: "Vence en 10 días • Conectividad",
    amount: 48.15
  }
];

export const vehicleData = {
  status: "Al día",
  info: "Próximo cambio de aceite y filtro programado para los 45,000 km. Combustible promedio semanal: B/.35.00.",
  budgetUsed: 84.00,
  budgetTotal: 140.00,
  percentage: 60
};

// Datos simulados para la página de Ingresos
export const ingresosMetrics = {
  projected: 2242.14,
  projectedCount: 8,
  received: 1023.70,
  receivedCount: 3,
  pending: 1218.44,
  pendingCount: 5,
  percent: 45.6
};

export const ingresosBreakdown = [
  {
    id: "cf",
    name: "Cristhian Fuentes",
    initials: "CF",
    subtitle: "Salarios & Gastos de Representación",
    color: "emerald",
    abonos: 4,
    projected: 1189.68,
    received: 594.84,
    pending: 594.84,
    footer: "50% recaudado a la fecha",
    footerDates: "Cortes 02, 11, 17 y 25",
    dotColor: "bg-emerald-500"
  },
  {
    id: "jc",
    name: "Jennifer Camaño",
    initials: "JC",
    subtitle: "Salario base, Carro & Comisión Meta",
    color: "teal",
    abonos: 4,
    projected: 1052.46,
    received: 428.86,
    pending: 623.60,
    footer: "Incluye bono sujeto a meta (B/. 120.00)",
    footerDates: "Cortes 15 y 30",
    dotColor: "bg-indigo-500"
  }
];

export const quincena1Ingresos = [
  {
    id: "inc-1",
    title: "Gasto de representación",
    person: "Cristhian Fuentes",
    initials: "CF",
    status: "received", // 'received' or 'pending'
    dateExpected: "02/09/2026",
    dateReceived: "02/09/2026",
    amount: 140.43,
  },
  {
    id: "inc-2",
    title: "Salario Cristhian (Quincena 1)",
    person: "Cristhian Fuentes",
    initials: "CF",
    status: "received",
    dateExpected: "11/09/2026",
    dateReceived: "03/09/2026",
    amount: 454.41,
  },
  {
    id: "inc-3",
    title: "Salario Jennifer (Quincena 15)",
    person: "Jennifer Camaño",
    initials: "JC",
    status: "received",
    dateExpected: "15/09/2026",
    dateReceived: "03/09/2026",
    amount: 428.86,
  }
];

export const quincena2Ingresos = [
  {
    id: "inc-4",
    title: "Gasto de representación",
    person: "Cristhian Fuentes",
    initials: "CF",
    status: "pending",
    dateExpected: "17/09/2026",
    dateReceived: null,
    amount: 140.43,
    type: "Programado regular"
  },
  {
    id: "inc-5",
    title: "Salario Cristhian (Quincena 2)",
    person: "Cristhian Fuentes",
    initials: "CF",
    status: "pending",
    dateExpected: "25/09/2026",
    dateReceived: null,
    amount: 454.41,
    type: "Programado regular"
  },
  {
    id: "inc-6",
    title: "Salario Jennifer (Quincena 30)",
    person: "Jennifer Camaño",
    initials: "JC",
    status: "pending",
    dateExpected: "30/09/2026",
    dateReceived: null,
    amount: 623.60,
    type: "Incluye bono (B/. 120.00)"
  }
];

export const initialFixedPayments = [
  {
    id: "fp-1",
    category: "servicios",
    isPaid: false,
    responsible: "Cristhian Fuentes • Servicios",
    title: "Luz (Electricidad)",
    amount: 25.00,
    subtitle: "Predeterminado fijo"
  },
  {
    id: "fp-2",
    category: "servicios",
    isPaid: true,
    responsible: "Cristhian Fuentes • Telecom",
    title: "Internet Residencial",
    amount: 44.00,
    subtitle: "Registrado este mes"
  },
  {
    id: "fp-3",
    category: "servicios",
    isPaid: true,
    responsible: "Cristhian Fuentes • Servicios",
    title: "Tasa de Basura",
    amount: 12.00,
    subtitle: "Registrado este mes"
  },
  {
    id: "fp-4",
    category: "autos",
    isPaid: false,
    responsible: "Cristhian Fuentes • Auto",
    title: "Seguro Carro Cristhian",
    amount: 45.00,
    subtitle: "Predeterminado fijo"
  },
  {
    id: "fp-5",
    category: "educacion",
    isPaid: false,
    responsible: "Jennifer Camaño • Niña",
    title: "Guardería Valeria",
    amount: 180.00,
    subtitle: "Predeterminado fijo"
  },
  {
    id: "fp-6",
    category: "autos",
    isPaid: false,
    responsible: "Jennifer Camaño • Financiamiento",
    title: "Cuota Carro Jenny",
    amount: 325.00,
    subtitle: "Predeterminado fijo"
  },
  {
    id: "fp-7",
    category: "autos",
    isPaid: false,
    responsible: "Jennifer Camaño • Auto",
    title: "Seguro Carro Jenny",
    amount: 60.00,
    subtitle: "Predeterminado fijo"
  },
  {
    id: "fp-8",
    category: "telecom",
    isPaid: false,
    responsible: "Plan Móvil • Mensual",
    title: "Contrato Celular",
    amount: 24.00,
    subtitle: "Predeterminado fijo"
  },
  {
    id: "fp-9",
    category: "banco",
    isPaid: false,
    responsible: "Cristhian Fuentes • Deuda",
    title: "Tarjeta de Crédito",
    amount: 60.00,
    subtitle: "Predeterminado fijo"
  },
  {
    id: "fp-10",
    category: "ahorro",
    isPaid: true,
    responsible: "Jennifer Camaño • Futuro",
    title: "Ahorro de Valeria",
    amount: 50.00,
    subtitle: "Transferencia exitosa"
  }
];
