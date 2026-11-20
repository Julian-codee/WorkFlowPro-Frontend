/**
 * Datos ficticios del módulo de Finanzas.
 *
 * ⚠️ No provienen del backend: son de ejemplo y viven solo en memoria.
 * Se sustituyen cuando conectes los endpoints de /financial.
 *
 * Los movimientos, los períodos semanales y los cierres se generan a partir de
 * la misma fuente para que el dashboard, el calendario y el historial siempre
 * cuadren entre sí.
 */

import {
  ADJUSTMENT_STATUSES,
  ADJUSTMENT_TYPES,
  CLOSURE_STATUSES,
  MOVEMENT_STATUSES,
  MOVEMENT_TYPES,
  PERIOD_STATUSES,
  getWeekKey,
  getWeekRange,
  getIsoWeekNumber,
  parseISODate,
  summarizeMovements,
  toISODate,
} from "../constants";

/** Fecha de referencia del entorno simulado. */
export const MOCK_TODAY = "2026-11-19";

/* ──────────────────────────────────────────────────────────────────────────
 * Cuentas
 * ────────────────────────────────────────────────────────────────────────── */

export const MOCK_ACCOUNTS = [
  {
    id: "acc_001",
    name: "Caja principal · Sede Lima",
    type: "cash",
    currency: "PEN",
    opening_balance: 8000,
    balance: 0,
    owner: "Ana Morales",
    branch: "Sede central",
    status: "active",
    notes: "Caja operativa para cobros en efectivo y pagos menores.",
    created_at: "2026-01-05T09:00:00Z",
    updated_at: "2026-11-18T18:20:00Z",
  },
  {
    id: "acc_002",
    name: "Caja secundaria · Tienda Miraflores",
    type: "cash",
    currency: "PEN",
    opening_balance: 2500,
    balance: 0,
    owner: "Carlos Ruiz",
    branch: "Tienda Miraflores",
    status: "active",
    notes: "Caja de apoyo para laSucursal.",
    created_at: "2026-02-10T09:00:00Z",
    updated_at: "2026-11-17T12:05:00Z",
  },
  {
    id: "acc_003",
    name: "Cuenta corriente · Banco de Crédito",
    type: "bank",
    currency: "PEN",
    opening_balance: 100000,
    balance: 0,
    owner: "Ana Morales",
    branch: "BCP · Cuenta corriente S/ 001-0455678",
    status: "active",
    notes: "Cuenta principal de cobros y pagos a proveedores.",
    created_at: "2026-01-05T09:05:00Z",
    updated_at: "2026-11-18T19:02:00Z",
  },
  {
    id: "acc_004",
    name: "Fondo de reserva · Interbank",
    type: "savings",
    currency: "PEN",
    opening_balance: 60000,
    balance: 0,
    owner: "Ana Morales",
    branch: "Interbank · Ahorro S/ 002-0098123",
    status: "active",
    notes: "Reserva para investing de dos meses de operación.",
    created_at: "2026-01-05T09:08:00Z",
    updated_at: "2026-09-30T10:30:00Z",
  },
  {
    id: "acc_005",
    name: "Billetera Yape · Ventas",
    type: "digital_wallet",
    currency: "PEN",
    opening_balance: 1200,
    balance: 0,
    owner: "Carlos Ruiz",
    branch: "Yape · +51 987 654 321",
    status: "active",
    notes: "Cobros directos por transferencia móvil.",
    created_at: "2026-03-02T11:20:00Z",
    updated_at: "2026-11-18T20:41:00Z",
  },
  {
    id: "acc_006",
    name: "Billetera Plin · Marketing",
    type: "digital_wallet",
    currency: "PEN",
    opening_balance: 12000,
    balance: 0,
    owner: "Patricia Quispe",
    branch: "Plin · 998 112 774",
    status: "active",
    notes: "Billetera para campañas de marketing y publicidad.",
    created_at: "2026-04-18T15:45:00Z",
    updated_at: "2026-11-16T09:12:00Z",
  },
  {
    id: "acc_007",
    name: "Cuenta USD · Chase Bank",
    type: "bank",
    currency: "USD",
    opening_balance: 12000,
    balance: 0,
    owner: "Ana Morales",
    branch: "Chase · USD 8842-11903",
    status: "archived",
    notes: "Cuenta en divisa, archivada tras migrar los pagos.",
    created_at: "2026-01-05T09:12:00Z",
    updated_at: "2026-08-14T17:00:00Z",
  },
];

/* ──────────────────────────────────────────────────────────────────────────
 * Generación determinista de movimientos
 * ────────────────────────────────────────────────────────────────────────── */

/** PRNG determinista: la misma fecha produce siempre los mismos datos. */
function seededRandom(seed) {
  let hash = 1779033703 ^ seed.length;

  for (let index = 0; index < seed.length; index += 1) {
    hash = Math.imul(hash ^ seed.charCodeAt(index), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }

  let value = Math.imul(hash ^ (hash >>> 16), 2246822507);
  value = Math.imul(value ^ (value >>> 13), 3266489909);

  return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
}

function round(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

const INCOME_TEMPLATES = [
  {
    concept: "Implementación WorkFlowPro · Plan Growth",
    category: "sale",
    min: 1800,
    max: 5200,
    account: "acc_003",
    method: "transfer",
    reference: "FAC",
  },
  {
    concept: "Suscripción mensual · Clientes activos",
    category: "subscription",
    min: 3200,
    max: 7800,
    account: "acc_003",
    method: "transfer",
    reference: "FAC",
  },
  {
    concept: "Soporte técnico mensual",
    category: "maintenance",
    min: 450,
    max: 1600,
    account: "acc_001",
    method: "cash",
    reference: "BOL",
  },
  {
    concept: "Capacitación in-company",
    category: "training",
    min: 900,
    max: 2800,
    account: "acc_002",
    method: "transfer",
    reference: "FAC",
  },
  {
    concept: "Venta de licencias adicionales",
    category: "sale",
    min: 1200,
    max: 3600,
    account: "acc_005",
    method: "digital_wallet",
    reference: "FAC",
  },
  {
    concept: "Reintegro de caja por devolución de proveedor",
    category: "other_income",
    min: 150,
    max: 700,
    account: "acc_001",
    method: "cash",
    reference: "BOL",
  },
];

const EXPENSE_TEMPLATES = [
  {
    concept: "Compra de insumos y equipos",
    category: "suppliers",
    min: 380,
    max: 2400,
    account: "acc_001",
    method: "cash",
    reference: "BOL",
  },
  {
    concept: "Pago a proveedores de servicios",
    category: "suppliers",
    min: 900,
    max: 5200,
    account: "acc_003",
    method: "transfer",
    reference: "FACT",
  },
  {
    concept: "Planilla del equipo",
    category: "payroll",
    min: 15000,
    max: 19500,
    account: "acc_003",
    method: "transfer",
    reference: "PLAN",
  },
  {
    concept: "Alquiler de oficina",
    category: "rent",
    min: 4800,
    max: 4800,
    account: "acc_003",
    method: "transfer",
    reference: "FACT",
  },
  {
    concept: "Servicios básicos (luz, agua, internet)",
    category: "utilities",
    min: 980,
    max: 1650,
    account: "acc_003",
    method: "transfer",
    reference: "FACT",
  },
  {
    concept: "Pago de impuestos y retenciones",
    category: "taxes",
    min: 2800,
    max: 4600,
    account: "acc_003",
    method: "transfer",
    reference: "FACT",
  },
  {
    concept: "Campañas de marketing digital",
    category: "marketing",
    min: 600,
    max: 3100,
    account: "acc_006",
    method: "digital_wallet",
    reference: "BOL",
  },
  {
    concept: "Licencias de software y herramientas",
    category: "software",
    min: 320,
    max: 1450,
    account: "acc_003",
    method: "credit_card",
    reference: "FACT",
  },
  {
    concept: "Movilidad y viáticos del equipo",
    category: "other_expense",
    min: 120,
    max: 680,
    account: "acc_001",
    method: "cash",
    reference: "BOL",
  },
];

const NOTE_POOL = [
  "",
  "",
  "",
  "Pagado con autorización de Gerencia.",
  "Comprobante electronicamente validado.",
  "Entregado al área de Tesorería.",
  "Pendiente de rattachar soporte.",
];

/** Rango de datos simulados. */
const RANGE_START = "2026-08-31";
const RANGE_END = "2026-11-19";

function buildMovements() {
  const movements = [];
  const start = parseISODate(RANGE_START);
  const end = parseISODate(RANGE_END);

  let sequence = 1;

  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const iso = toISODate(date);
    const day = date.getDate();
    const weekday = date.getDay();
    const isWeekend = weekday === 0 || weekday === 6;
    const random = seededRandom(iso);

    const daily = [];

    // ── Movimientos recurrentes del mes ──────────────────────────────────
    if (day === 1) {
      daily.push({
        type: MOVEMENT_TYPES.EXPENSE,
        template: EXPENSE_TEMPLATES.find((item) => item.category === "rent"),
      });
    }

    if (day === 5) {
      daily.push({
        type: MOVEMENT_TYPES.INCOME,
        template: INCOME_TEMPLATES.find((item) => item.category === "subscription"),
      });
    }

    if (day === 15) {
      daily.push({
        type: MOVEMENT_TYPES.EXPENSE,
        template: EXPENSE_TEMPLATES.find((item) => item.category === "utilities"),
      });
    }

    if (day === 20) {
      daily.push({
        type: MOVEMENT_TYPES.EXPENSE,
        template: EXPENSE_TEMPLATES.find((item) => item.category === "taxes"),
      });
    }

    if (day === 28) {
      daily.push({
        type: MOVEMENT_TYPES.EXPENSE,
        template: EXPENSE_TEMPLATES.find((item) => item.category === "payroll"),
      });
    }

    // ── Movimientos del día ──────────────────────────────────────────────
    const extraCount = isWeekend ? (random > 0.72 ? 1 : 0) : Math.floor(random * 3);

    for (let index = 0; index < extraCount; index += 1) {
      const isIncome = seededRandom(`${iso}-income-${index}`) > 0.48;
      const pool = isIncome ? INCOME_TEMPLATES : EXPENSE_TEMPLATES;
      const pick = seededRandom(`${iso}-pick-${index}`);
      const template = pool[Math.floor(pick * pool.length)];

      daily.push({ type: isIncome ? MOVEMENT_TYPES.INCOME : MOVEMENT_TYPES.EXPENSE, template });
    }

    for (const entry of daily) {
      if (!entry.template) continue;

      const amountRandom = seededRandom(`${iso}-${entry.template.concept}`);
      const amount = round(
        entry.template.min + amountRandom * (entry.template.max - entry.template.min),
      );

      const noteRandom = seededRandom(`${iso}-${entry.template.concept}-note`);
      const notes = NOTE_POOL[Math.floor(noteRandom * NOTE_POOL.length)];

      // Fecha de registro: normalmente el mismo día; a veces días después.
      const lateDays = Math.floor(seededRandom(`${iso}-late`) * 100) < 12 ? 9 + Math.floor(amountRandom * 8) : 0;

      const registeredDate = new Date(date);
      registeredDate.setDate(date.getDate() + lateDays);

      // La fecha de registro nunca es posterior a la fecha de referencia del mock.
      if (toISODate(registeredDate) > MOCK_TODAY) {
        registeredDate.setTime(parseISODate(MOCK_TODAY).getTime());
      }

      const statusRandom = seededRandom(`${iso}-${entry.template.concept}-status`);
      const status =
        statusRandom > 0.93
          ? MOVEMENT_STATUSES.RECONCILED
          : MOVEMENT_STATUSES.REGISTERED;

      movements.push({
        id: `mov_${String(sequence).padStart(4, "0")}`,
        type: entry.type,
        concept: entry.template.concept,
        category: entry.template.category,
        amount,
        account_id: entry.template.account,
        payment_method: entry.template.method,
        movement_date: iso,
        registered_at: `${toISODate(registeredDate)}T${String(8 + Math.floor(amountRandom * 9)).padStart(2, "0")}:${String(Math.floor(amountRandom * 60)).padStart(2, "0")}:00Z`,
        status,
        reference: `${entry.template.reference}-2026-${String(sequence).padStart(4, "0")}`,
        notes,
        origin: toISODate(registeredDate) > iso ? "late" : "regular",
      });

      sequence += 1;
    }
  }

  return movements;
}

export const MOCK_MOVEMENTS = buildMovements();

/* ──────────────────────────────────────────────────────────────────────────
 * Períodos semanales
 * ────────────────────────────────────────────────────────────────────────── */

/** Cuentas que komponen la caja física (efectivo). */
export const MOCK_CASH_ACCOUNT_IDS = MOCK_ACCOUNTS.filter(
  (account) => account.type === "cash" && account.status === "active",
).map((account) => account.id);

function buildPeriods() {
  const currentWeekKey = getWeekKey(MOCK_TODAY);
  const periods = [];

  let cashBalance = MOCK_ACCOUNTS.filter(
    (account) => MOCK_CASH_ACCOUNT_IDS.includes(account.id),
  ).reduce((acc, account) => acc + account.opening_balance, 0);

  let cursor = getWeekRange(RANGE_START).start;
  const lastWeek = getWeekRange(RANGE_END).start;

  while (cursor <= lastWeek) {
    const range = getWeekRange(cursor);
    const weekMovements = MOCK_MOVEMENTS.filter(
      (movement) => movement.movement_date >= range.start && movement.movement_date <= range.end,
    );

    const summary = summarizeMovements(weekMovements);

    // El arqueo de caja solo contempla los movimientos de las cuentas de efectivo.
    const cashSummary = summarizeMovements(
      weekMovements.filter((movement) => MOCK_CASH_ACCOUNT_IDS.includes(movement.account_id)),
    );

    const isCurrent = range.key === currentWeekKey;
    const isClosed = range.key < currentWeekKey;

    periods.push({
      id: `per_${range.key}`,
      week_key: range.key,
      start_date: range.start,
      end_date: range.end,
      number: getIsoWeekNumber(range.start),
      year: parseISODate(range.start).getFullYear(),
      status: isClosed ? PERIOD_STATUSES.CLOSED : PERIOD_STATUSES.OPEN,
      income: summary.income,
      expense: summary.expense,
      balance: summary.balance,
      movement_count: summary.count,
      cash_income: cashSummary.income,
      cash_expense: cashSummary.expense,
      cash_balance: cashSummary.balance,
      opening_balance: round(cashBalance),
      closed_at: isClosed ? `${range.end}T20:00:00Z` : null,
      closed_by: isClosed ? "Ana Morales" : null,
    });

    cashBalance += cashSummary.balance;

    const next = parseISODate(range.end);
    next.setDate(next.getDate() + 1);
    cursor = toISODate(next);
  }

  return periods;
}

export const MOCK_PERIODS = buildPeriods();

/* ──────────────────────────────────────────────────────────────────────────
 * Cierres de caja
 * ────────────────────────────────────────────────────────────────────────── */

const RESPONSIBLES = ["Ana Morales", "Carlos Ruiz", "Patricia Quispe", "Javier Torres"];

const SHORTAGE_REASONS = [
  "Faltante en el arqueo de caja",
  "Diferencia por cambio entregado",
  "Retiro de efectivo sin comprobante",
];

const SURPLUS_REASONS = [
  "Sobrante por cambio entregado",
  "Ingreso registrado en efectivo no depositado",
  "Error de digitación en el conteo",
];

const JUSTIFICATIONS = [
  "Se regulariza con el depósito del día siguiente y se adjunta el voucher.",
  "Diferencia atribuida a retenciones no entregados; se compensa en el arqueo siguiente.",
  "Caso revisado con el responsable de tienda y aceptado por Gerencia.",
  "Ajuste aprobado por la Gerencia Financeira para el período.",
];

function buildClosures() {
  const closures = [];

  MOCK_PERIODS.forEach((period, index) => {
    if (period.status !== PERIOD_STATUSES.CLOSED) return;

    const weekNumber = period.number;
    let difference = 0;

    if (weekNumber % 3 === 0) difference = -120;
    else if (weekNumber % 5 === 0) difference = 80;

    const expectedCash = round(period.opening_balance + (period.cash_balance ?? period.balance));
    const actualCash = round(expectedCash + difference);

    const adjustments = [];

    if (difference !== 0) {
      const isShortage = difference < 0;
      const isPending = weekNumber % 7 === 0;

      adjustments.push({
        id: `adj_${period.week_key}_1`,
        type: isShortage ? ADJUSTMENT_TYPES.SHORTAGE : ADJUSTMENT_TYPES.SURPLUS,
        amount: round(Math.abs(difference)),
        reason:
          isShortage
            ? SHORTAGE_REASONS[weekNumber % SHORTAGE_REASONS.length]
            : SURPLUS_REASONS[weekNumber % SURPLUS_REASONS.length],
        justification: JUSTIFICATIONS[weekNumber % JUSTIFICATIONS.length],
        status: isPending ? ADJUSTMENT_STATUSES.PENDING : ADJUSTMENT_STATUSES.RESOLVED,
        created_at: `${period.end_date}T21:15:00Z`,
        resolved_at: isPending ? null : `${period.end_date}T23:40:00Z`,
        resolved_by: isPending ? null : "Ana Morales",
      });
    }

    closures.push({
      id: `clo_${period.week_key}`,
      period_id: period.id,
      week_key: period.week_key,
      start_date: period.start_date,
      end_date: period.end_date,
      number: period.number,
      year: period.year,
      status:
        adjustments.length > 0
          ? CLOSURE_STATUSES.ADJUSTED
          : CLOSURE_STATUSES.CONFIRMED,
      total_income: period.income,
      total_expense: period.expense,
      net: period.balance,
      expected_cash: expectedCash,
      actual_cash: actualCash,
      difference: round(actualCash - expectedCash),
      responsible: RESPONSIBLES[index % RESPONSIBLES.length],
      notes: `Cierre de caja de la semana ${period.number}.`,
      observations:
        difference !== 0
          ? "Se detectó diferencia entre el saldo esperado y el conteo físico."
          : "Sin diferencias detectadas en el conteo.",
      created_at: `${period.end_date}T20:30:00Z`,
      confirmed_at: `${period.end_date}T23:55:00Z`,
      adjustments,
    });
  });

  // La semana en curso queda con un cierre en revisión: el conteo todavía no
  // está confirmado y el período permanece abierto.
  const currentPeriod = MOCK_PERIODS.find((period) => period.status === PERIOD_STATUSES.OPEN);

  if (currentPeriod) {
    const expectedCash = round(
      currentPeriod.opening_balance + (currentPeriod.cash_balance ?? currentPeriod.balance),
    );

    closures.unshift({
      id: `clo_${currentPeriod.week_key}`,
      period_id: currentPeriod.id,
      week_key: currentPeriod.week_key,
      start_date: currentPeriod.start_date,
      end_date: currentPeriod.end_date,
      number: currentPeriod.number,
      year: currentPeriod.year,
      status: CLOSURE_STATUSES.DRAFT,
      total_income: currentPeriod.income,
      total_expense: currentPeriod.expense,
      net: currentPeriod.balance,
      expected_cash: expectedCash,
      actual_cash: expectedCash,
      difference: 0,
      responsible: "Ana Morales",
      notes: `Cierre de caja de la semana ${currentPeriod.number} pendiente de confirmación.`,
      observations: "Conteo preliminar: el saldo real se registra al confirmar el cierre.",
      created_at: `${MOCK_TODAY}T18:30:00Z`,
      confirmed_at: null,
      adjustments: [],
    });
  }

  return closures.reverse();
}

export const MOCK_CLOSURES = buildClosures();

/** Historial de cierres (misma fuente, con filtros aplicados en el servicio). */
export const MOCK_CLOSURES_HISTORY = MOCK_CLOSURES;

/** Resumen global precargado para el dashboard. */
export const MOCK_FINANCIAL_STATS = {
  currency: "PEN",
  available_balance: MOCK_ACCOUNTS.filter((account) => account.status === "active").reduce(
    (acc, account) => acc + account.opening_balance,
    0,
  ),
};
