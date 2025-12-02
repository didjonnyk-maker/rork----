export type UserRole = "Сотрудник" | "Операционист" | "Администратор" | "Директор" | "Учредитель";

export type Position = 
  | "Кассир" 
  | "Продавец" 
  | "Универсал" 
  | "Операционист-кассир" 
  | "Администратор" 
  | "Директор"
  | "Учредитель";

export type ShiftStatus = 
  | "Свободно" 
  | "Забронировано" 
  | "В работе" 
  | "Закрыто" 
  | "Подтверждено" 
  | "Отклонение в ДС";

export type EmployeeStatus = "В пути" | "Опаздывает" | "На месте" | "Не вышел" | "Не на смене";

export type ShiftType = "День" | "Ночь";

export type RecurrenceType = "daily" | "weekly" | "custom";

export type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export type MarketId = "danek" | "yunusalieva";

export interface Market {
  id: MarketId;
  name: string;
  address: string;
}

export const MARKETS: Market[] = [
  { id: "danek", name: "Данек", address: "8 мкр, 18/1" },
  { id: "yunusalieva", name: "Юнусалиева", address: "Юнусалиева 173/3" },
];

export interface User {
  id: string;
  name: string;
  role: UserRole;
  position: Position;
  marketId?: MarketId;
  hourlyRate?: number;
  kpiCoefficient?: number;
  balance?: number;
  passcode?: string;
}

export interface Shift {
  id: string;
  marketId: MarketId;
  date: string;
  startTime: string;
  endTime: string;
  position: Position;
  status: ShiftStatus;
  employeeId?: string;
  employeeName?: string;
  arrivedAt?: string;
  employeeStatus?: EmployeeStatus;
  isUrgent?: boolean;
  cancellationRequested?: boolean;
}

export interface ShiftTemplate {
  id: string;
  marketId: MarketId;
  recurrenceType: RecurrenceType;
  daysOfWeek?: DayOfWeek[];
  startTime: string;
  endTime: string;
  position: Position;
  active: boolean;
}

export interface CashierReport {
  id: string;
  marketId?: MarketId;
  date: string;
  shiftId: string;
  employeeId: string;
  employeeName: string;
  shiftType: ShiftType;
  cashZ: number;
  cardZ: number;
  returnsZ: number;
  cashActual: number;
  cardActual: number;
  withdrawals: number;
  cashDiscrepancy: number;
  cardDiscrepancy: number;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  comment?: string;
}

export interface ShiftHistory {
  id: string;
  shift: Shift;
  report?: CashierReport;
  closedAt: string;
}

export interface KPISettings {
  disciplineWeight: number;
  cashAccuracyWeight: number;
  noComplaintsWeight: number;
  trainingWeight: number;
  tasksWeight: number;
}

export type TaskStatus = "Новое" | "Доступно" | "В работе" | "Выполнено" | "На модерации" | "Проверено" | "Возвращено";

export interface Task {
  id: string;
  marketId: MarketId;
  title: string;
  description?: string;
  assignedTo?: string;
  takenBy?: string;
  createdBy: string;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  returnComment?: string;
  resultText?: string;
  resultPhotos?: string[];
  moderatedBy?: string;
  moderatedAt?: string;
  directorReviewed?: boolean;
  directorComment?: string;
  scheduledDate?: string;
  cancelled?: boolean;
  cancelledAt?: string;
}

export interface SalaryPayment {
  id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  date: string;
  periodStart: string;
  periodEnd: string;
  paidBy: string;
}

export interface Advance {
  id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  date: string;
  approvedBy?: string;
}

export interface Bonus {
  id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  date: string;
  reason: string;
  createdBy: string;
}

export const EMPLOYEE_POSITIONS: Position[] = ["Кассир", "Продавец", "Универсал"];
export const ADMIN_POSITIONS: Position[] = ["Операционист-кассир", "Администратор", "Директор", "Учредитель"];
export const ALL_POSITIONS: Position[] = [...EMPLOYEE_POSITIONS, ...ADMIN_POSITIONS];

export const ROLE_BY_POSITION: Record<Position, UserRole> = {
  "Кассир": "Сотрудник",
  "Продавец": "Сотрудник",
  "Универсал": "Сотрудник",
  "Операционист-кассир": "Операционист",
  "Администратор": "Администратор",
  "Директор": "Директор",
  "Учредитель": "Учредитель",
};

export const DEFAULT_HOURLY_RATE = 120;
export const SHIFT_CANCEL_PENALTY = 1400;
export const REPLACEMENT_RATE_MULTIPLIER = 2;

export interface EmployeeKPI {
  employeeId: string;
  discipline: number;
  cashAccuracy: number;
  noComplaints: number;
  training: number;
  tasksCompletion: number;
  coefficient: number;
}

export interface SalaryCalculation {
  employeeId: string;
  employeeName: string;
  hoursWorked: number;
  hourlyRate: number;
  baseAmount: number;
  kpiCoefficient: number;
  adjustedAmount: number;
  penalties: number;
  shortages: number;
  advances: number;
  bonuses: number;
  totalPayout: number;
  netSalary: number;
  period: string;
  paidAmount: number;
  remainingAmount: number;
}

export interface Penalty {
  id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  reason: string;
  date: string;
  createdBy: string;
}

export interface ShiftReplacement {
  id: string;
  originalEmployeeId: string;
  replacementEmployeeId: string;
  shiftId: string;
  penalty: number;
  bonus: number;
  date: string;
}

export type TrainingMaterialType = "text" | "pdf" | "video";

export type MaterialAssignmentStatus = "assigned" | "viewed" | "passed";

export interface TrainingMaterial {
  id: string;
  title: string;
  description?: string;
  content: string;
  category: string;
  type: TrainingMaterialType;
  fileUrl?: string;
  link?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  assignedToAll: boolean;
  assignedGroups?: Position[];
  versionHistory?: { version: number; updatedAt: string; changes: string }[];
}

export interface MaterialAssignment {
  id: string;
  materialId: string;
  employeeId: string;
  status: MaterialAssignmentStatus;
  assignedAt: string;
  viewedAt?: string;
  passedAt?: string;
  materialVersion: number;
}

export interface EmployeeTrainingProgress {
  employeeId: string;
  materialId: string;
  completedAt?: string;
  materialVersion: number;
}

export type EmployeeOnWayStatus = "idle" | "on_way" | "arrived";

export interface EmployeeShiftActivity {
  shiftId: string;
  employeeId: string;
  onWayAt?: string;
  arrivedAt?: string;
  closedAt?: string;
  closedByEmployee?: boolean;
}

export interface ShiftTimeReport {
  id: string;
  shiftId: string;
  employeeId: string;
  employeeName: string;
  position: Position;
  marketId: MarketId;
  date: string;
  reportedStartTime: string;
  reportedEndTime: string;
  actualHours: number;
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  approved?: boolean;
  notes?: string;
}

export interface HourAdjustment {
  id: string;
  employeeId: string;
  employeeName: string;
  hours: number;
  reason: string;
  date: string;
  createdBy: string;
}

export interface CashierReportModeration {
  reportId: string;
  operatorCashActual?: number;
  operatorCardActual?: number;
  operatorAgreed: boolean;
  operatorName: string;
  moderatedAt: string;
  directorApproved?: boolean;
  directorName?: string;
  directorApprovedAt?: string;
}
