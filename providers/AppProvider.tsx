import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useEffect, useState } from "react";
import {
  Advance,
  CashierReport,
  EmployeeKPI,
  EmployeeStatus,
  EmployeeTrainingProgress,
  KPISettings,
  Penalty,
  SalaryPayment,
  Shift,
  ShiftHistory,
  ShiftReplacement,
  ShiftStatus,
  ShiftTemplate,
  Task,
  TaskStatus,
  TrainingMaterial,
  User,
  EMPLOYEE_POSITIONS,
  DEFAULT_HOURLY_RATE,
  SHIFT_CANCEL_PENALTY,
  REPLACEMENT_RATE_MULTIPLIER,
} from "@/types";

const STORAGE_KEYS = {
  USERS: "@tabel_users",
  SHIFTS: "@tabel_shifts",
  REPORTS: "@tabel_reports",
  CURRENT_USER: "@tabel_current_user",
  TEMPLATES: "@tabel_templates",
  HISTORY: "@tabel_history",
  TASKS: "@tabel_tasks",
  ADVANCES: "@tabel_advances",
  PENALTIES: "@tabel_penalties",
  KPI_SETTINGS: "@tabel_kpi_settings",
  EMPLOYEE_KPI: "@tabel_employee_kpi",
  REPLACEMENTS: "@tabel_replacements",
  TRAINING_MATERIALS: "@tabel_training_materials",
  TRAINING_PROGRESS: "@tabel_training_progress",
  SALARY_PAYMENTS: "@tabel_salary_payments",
};

export const [AppProvider, useApp] = createContextHook(() => {
  const [users, setUsers] = useState<User[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [reports, setReports] = useState<CashierReport[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [templates, setTemplates] = useState<ShiftTemplate[]>([]);
  const [history, setHistory] = useState<ShiftHistory[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [advances, setAdvances] = useState<Advance[]>([]);
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [kpiSettings, setKpiSettings] = useState<KPISettings>({
    disciplineWeight: 0.25,
    cashAccuracyWeight: 0.25,
    noComplaintsWeight: 0.2,
    trainingWeight: 0.15,
    tasksWeight: 0.15,
  });
  const [employeeKPIs, setEmployeeKPIs] = useState<EmployeeKPI[]>([]);
  const [replacements, setReplacements] = useState<ShiftReplacement[]>([]);
  const [trainingMaterials, setTrainingMaterials] = useState<TrainingMaterial[]>([]);
  const [trainingProgress, setTrainingProgress] = useState<EmployeeTrainingProgress[]>([]);
  const [salaryPayments, setSalaryPayments] = useState<SalaryPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [
        usersData,
        shiftsData,
        reportsData,
        currentUserData,
        templatesData,
        historyData,
        tasksData,
        advancesData,
        penaltiesData,
        kpiSettingsData,
        employeeKPIData,
        replacementsData,
        trainingMaterialsData,
        trainingProgressData,
        salaryPaymentsData,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USERS),
        AsyncStorage.getItem(STORAGE_KEYS.SHIFTS),
        AsyncStorage.getItem(STORAGE_KEYS.REPORTS),
        AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER),
        AsyncStorage.getItem(STORAGE_KEYS.TEMPLATES),
        AsyncStorage.getItem(STORAGE_KEYS.HISTORY),
        AsyncStorage.getItem(STORAGE_KEYS.TASKS),
        AsyncStorage.getItem(STORAGE_KEYS.ADVANCES),
        AsyncStorage.getItem(STORAGE_KEYS.PENALTIES),
        AsyncStorage.getItem(STORAGE_KEYS.KPI_SETTINGS),
        AsyncStorage.getItem(STORAGE_KEYS.EMPLOYEE_KPI),
        AsyncStorage.getItem(STORAGE_KEYS.REPLACEMENTS),
        AsyncStorage.getItem(STORAGE_KEYS.TRAINING_MATERIALS),
        AsyncStorage.getItem(STORAGE_KEYS.TRAINING_PROGRESS),
        AsyncStorage.getItem(STORAGE_KEYS.SALARY_PAYMENTS),
      ]);

      if (usersData) setUsers(JSON.parse(usersData));
      if (shiftsData) setShifts(JSON.parse(shiftsData));
      if (reportsData) setReports(JSON.parse(reportsData));
      if (currentUserData) setCurrentUser(JSON.parse(currentUserData));
      if (templatesData) setTemplates(JSON.parse(templatesData));
      if (historyData) setHistory(JSON.parse(historyData));
      if (tasksData) setTasks(JSON.parse(tasksData));
      if (advancesData) setAdvances(JSON.parse(advancesData));
      if (penaltiesData) setPenalties(JSON.parse(penaltiesData));
      if (kpiSettingsData) setKpiSettings(JSON.parse(kpiSettingsData));
      if (employeeKPIData) setEmployeeKPIs(JSON.parse(employeeKPIData));
      if (replacementsData) setReplacements(JSON.parse(replacementsData));
      if (trainingMaterialsData) setTrainingMaterials(JSON.parse(trainingMaterialsData));
      if (trainingProgressData) setTrainingProgress(JSON.parse(trainingProgressData));
      if (salaryPaymentsData) setSalaryPayments(JSON.parse(salaryPaymentsData));
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUsers = useCallback(async (newUsers: User[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(newUsers));
      setUsers(newUsers);
    } catch (error) {
      console.error("Error saving users:", error);
    }
  }, []);

  const saveShifts = useCallback(async (newShifts: Shift[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(newShifts));
      setShifts(newShifts);
    } catch (error) {
      console.error("Error saving shifts:", error);
    }
  }, []);

  const saveReports = useCallback(async (newReports: CashierReport[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(newReports));
      setReports(newReports);
    } catch (error) {
      console.error("Error saving reports:", error);
    }
  }, []);

  const saveTemplates = useCallback(async (newTemplates: ShiftTemplate[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(newTemplates));
      setTemplates(newTemplates);
    } catch (error) {
      console.error("Error saving templates:", error);
    }
  }, []);

  const saveHistory = useCallback(async (newHistory: ShiftHistory[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(newHistory));
      setHistory(newHistory);
    } catch (error) {
      console.error("Error saving history:", error);
    }
  }, []);

  const saveTasks = useCallback(async (newTasks: Task[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(newTasks));
      setTasks(newTasks);
    } catch (error) {
      console.error("Error saving tasks:", error);
    }
  }, []);

  const saveAdvances = useCallback(async (newAdvances: Advance[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ADVANCES, JSON.stringify(newAdvances));
      setAdvances(newAdvances);
    } catch (error) {
      console.error("Error saving advances:", error);
    }
  }, []);

  const saveSalaryPayments = useCallback(async (newPayments: SalaryPayment[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SALARY_PAYMENTS, JSON.stringify(newPayments));
      setSalaryPayments(newPayments);
    } catch (error) {
      console.error("Error saving salary payments:", error);
    }
  }, []);

  const login = useCallback(async (user: User) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      setCurrentUser(user);
    } catch (error) {
      console.error("Error logging in:", error);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      setCurrentUser(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }, []);

  const addUser = useCallback(
    (user: User) => {
      const newUsers = [...users, user];
      saveUsers(newUsers);
    },
    [users, saveUsers]
  );

  const updateUser = useCallback(
    (userId: string, updates: Partial<User>) => {
      const newUsers = users.map((user) =>
        user.id === userId ? { ...user, ...updates } : user
      );
      saveUsers(newUsers);
    },
    [users, saveUsers]
  );

  const addShift = useCallback(
    (shift: Shift) => {
      const newShifts = [...shifts, shift];
      saveShifts(newShifts);
    },
    [shifts, saveShifts]
  );

  const addShifts = useCallback(
    (newShiftsList: Shift[]) => {
      const newShifts = [...shifts, ...newShiftsList];
      saveShifts(newShifts);
    },
    [shifts, saveShifts]
  );

  const deleteShift = useCallback(
    (shiftId: string) => {
      const newShifts = shifts.filter((s) => s.id !== shiftId);
      saveShifts(newShifts);
    },
    [shifts, saveShifts]
  );

  const updateShift = useCallback(
    (shiftId: string, updates: Partial<Shift>) => {
      const newShifts = shifts.map((shift) =>
        shift.id === shiftId ? { ...shift, ...updates } : shift
      );
      saveShifts(newShifts);
    },
    [shifts, saveShifts]
  );

  const bookShift = useCallback(
    (shiftId: string, employeeId: string, employeeName: string) => {
      const newShifts = shifts.map((shift) =>
        shift.id === shiftId
          ? {
              ...shift,
              status: "Забронировано" as ShiftStatus,
              employeeId,
              employeeName,
            }
          : shift
      );
      saveShifts(newShifts);
    },
    [shifts, saveShifts]
  );

  const markArrival = useCallback(
    (shiftId: string) => {
      const now = new Date().toISOString();
      const newShifts = shifts.map((shift) =>
        shift.id === shiftId
          ? {
              ...shift,
              status: "В работе" as ShiftStatus,
              arrivedAt: now,
              employeeStatus: "На месте" as EmployeeStatus,
            }
          : shift
      );
      saveShifts(newShifts);
    },
    [shifts, saveShifts]
  );

  const markOnWay = useCallback(
    (shiftId: string) => {
      const newShifts = shifts.map((shift) =>
        shift.id === shiftId
          ? {
              ...shift,
              employeeStatus: "В пути" as EmployeeStatus,
            }
          : shift
      );
      saveShifts(newShifts);
    },
    [shifts, saveShifts]
  );

  const acceptShiftNow = useCallback(
    (shiftId: string, employeeId: string, employeeName: string) => {
      const now = new Date().toISOString();
      const newShifts = shifts.map((shift) =>
        shift.id === shiftId
          ? {
              ...shift,
              status: "В работе" as ShiftStatus,
              employeeId,
              employeeName,
              arrivedAt: now,
              employeeStatus: "На месте" as EmployeeStatus,
            }
          : shift
      );
      saveShifts(newShifts);
    },
    [shifts, saveShifts]
  );

  const getEmployeeStatus = useCallback(
    (shiftId: string): EmployeeStatus => {
      const shift = shifts.find((s) => s.id === shiftId);
      if (!shift) return "Не на смене";
      if (shift.arrivedAt) return "На месте";
      if (shift.employeeStatus === "В пути") return "В пути";
      
      const now = new Date();
      const shiftStart = new Date(`${shift.date}T${shift.startTime}`);
      const shiftEnd = new Date(`${shift.date}T${shift.endTime}`);
      if (shiftEnd < shiftStart) {
        shiftEnd.setDate(shiftEnd.getDate() + 1);
      }

      const diffMinutes = Math.floor((now.getTime() - shiftStart.getTime()) / 60000);
      
      // If shift has started and user not arrived -> Late
      if (diffMinutes > 0 && now < shiftEnd) {
        return "Опаздывает";
      } 
      // If within 60 mins before start -> On Way (implicitly)
      else if (diffMinutes > -60 && diffMinutes <= 0) {
        return "В пути";
      }
      return "Не на смене";
    },
    [shifts]
  );

  const addReport = useCallback(
    (report: CashierReport) => {
      const newReports = [...reports, report];
      saveReports(newReports);
      
      const newShifts = shifts.map((shift) =>
        shift.id === report.shiftId
          ? { ...shift, status: "Закрыто" as ShiftStatus }
          : shift
      );
      saveShifts(newShifts);
    },
    [reports, shifts, saveReports, saveShifts]
  );

  const addTemplate = useCallback(
    (template: ShiftTemplate) => {
      const newTemplates = [...templates, template];
      saveTemplates(newTemplates);
    },
    [templates, saveTemplates]
  );

  const updateTemplate = useCallback(
    (templateId: string, updates: Partial<ShiftTemplate>) => {
      const newTemplates = templates.map((template) =>
        template.id === templateId ? { ...template, ...updates } : template
      );
      saveTemplates(newTemplates);
    },
    [templates, saveTemplates]
  );

  const deleteTemplate = useCallback(
    (templateId: string) => {
      const newTemplates = templates.filter((t) => t.id !== templateId);
      saveTemplates(newTemplates);
    },
    [templates, saveTemplates]
  );

  const getAvailableShiftsForEmployee = useCallback(
    (position: string) => {
      if (position === "Универсал") {
        return shifts.filter(
          (shift) =>
            shift.status === "Свободно" &&
            EMPLOYEE_POSITIONS.includes(shift.position as typeof EMPLOYEE_POSITIONS[number])
        );
      }
      return shifts.filter(
        (shift) => shift.status === "Свободно" && shift.position === position
      );
    },
    [shifts]
  );

  const getEmployeeShifts = useCallback(
    (employeeId: string) => {
      return shifts.filter((shift) => shift.employeeId === employeeId);
    },
    [shifts]
  );

  const getUnfilledShiftsWarning = useCallback(() => {
    const today = new Date();
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(today.getDate() + 3);

    const unfilledShifts = shifts.filter((shift) => {
      const shiftDate = new Date(shift.date);
      return (
        shift.status === "Свободно" &&
        shiftDate >= today &&
        shiftDate <= threeDaysLater
      );
    });

    return unfilledShifts.length > 0 ? unfilledShifts.length : null;
  }, [shifts]);

  const getReportsForEmployee = useCallback(
    (employeeId: string) => {
      return reports.filter((report) => report.employeeId === employeeId);
    },
    [reports]
  );

  const closeShift = useCallback(
    (shiftId: string) => {
      const newShifts = shifts.map((shift) =>
        shift.id === shiftId
          ? { ...shift, status: "Закрыто" as ShiftStatus }
          : shift
      );
      saveShifts(newShifts);
    },
    [shifts, saveShifts]
  );

  const verifyReport = useCallback(
    (reportId: string, operatorName: string) => {
      const newReports = reports.map((report) =>
        report.id === reportId
          ? {
              ...report,
              verified: true,
              verifiedBy: operatorName,
              verifiedAt: new Date().toISOString(),
            }
          : report
      );
      saveReports(newReports);
    },
    [reports, saveReports]
  );

  const rejectReport = useCallback(
    (reportId: string, reason: string) => {
      const report = reports.find((r) => r.id === reportId);
      if (!report) return;

      const newReports = reports.map((r) =>
        r.id === reportId
          ? { ...r, rejectionReason: reason }
          : r
      );
      saveReports(newReports);

      const newShifts = shifts.map((shift) =>
        shift.id === report.shiftId
          ? { ...shift, status: "Отклонение в ДС" as ShiftStatus }
          : shift
      );
      saveShifts(newShifts);
    },
    [reports, shifts, saveReports, saveShifts]
  );

  const updateReport = useCallback(
    (reportId: string, updates: Partial<CashierReport>) => {
      const newReports = reports.map((report) =>
        report.id === reportId ? { ...report, ...updates } : report
      );
      saveReports(newReports);
    },
    [reports, saveReports]
  );

  const moveToHistory = useCallback(
    (shiftId: string) => {
      const shift = shifts.find((s) => s.id === shiftId);
      const report = reports.find((r) => r.shiftId === shiftId);

      if (shift) {
        const historyItem: ShiftHistory = {
          id: Date.now().toString(),
          shift: { ...shift, status: "Подтверждено" as ShiftStatus },
          report,
          closedAt: new Date().toISOString(),
        };

        const newHistory = [...history, historyItem];
        const newShifts = shifts.filter((s) => s.id !== shiftId);

        saveHistory(newHistory);
        saveShifts(newShifts);
      }
    },
    [shifts, reports, history, saveHistory, saveShifts]
  );

  const getUnverifiedReports = useCallback(() => {
    return reports.filter((report) => !report.verified);
  }, [reports]);

  const addTask = useCallback(
    (task: Task) => {
      const newTasks = [...tasks, task];
      saveTasks(newTasks);
    },
    [tasks, saveTasks]
  );

  const updateTask = useCallback(
    (taskId: string, updates: Partial<Task>) => {
      const newTasks = tasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      );
      saveTasks(newTasks);
    },
    [tasks, saveTasks]
  );

  const takeTask = useCallback(
    (taskId: string, employeeId: string) => {
      const newTasks = tasks.map((task) =>
        task.id === taskId
          ? { ...task, takenBy: employeeId, status: "В работе" as TaskStatus }
          : task
      );
      saveTasks(newTasks);
    },
    [tasks, saveTasks]
  );

  const completeTask = useCallback(
    (taskId: string, resultText?: string) => {
      const newTasks = tasks.map((task) =>
        task.id === taskId
          ? { 
              ...task, 
              status: "На модерации" as TaskStatus, 
              completedAt: new Date().toISOString(),
              resultText: resultText || task.resultText,
            }
          : task
      );
      saveTasks(newTasks);
    },
    [tasks, saveTasks]
  );

  const getAvailableTasks = useCallback(() => {
    return tasks.filter((task) => task.status === "Доступно");
  }, [tasks]);

  const getTasksForEmployee = useCallback(
    (employeeId: string) => {
      return tasks.filter((task) => task.takenBy === employeeId || task.assignedTo === employeeId);
    },
    [tasks]
  );

  const getEmployeeIncompleteTasks = useCallback(
    (employeeId: string) => {
      return tasks.filter(
        (task) =>
          task.takenBy === employeeId &&
          (task.status === "В работе" || task.status === "Возвращено")
      );
    },
    [tasks]
  );

  const addAdvance = useCallback(
    (advance: Advance) => {
      const newAdvances = [...advances, advance];
      saveAdvances(newAdvances);
    },
    [advances, saveAdvances]
  );

  const getAdvancesForEmployee = useCallback(
    (employeeId: string) => {
      return advances.filter((advance) => advance.employeeId === employeeId);
    },
    [advances]
  );

  const getUpcomingShifts = useCallback(
    (hoursAhead: number = 1) => {
      const now = new Date();
      const futureTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);

      return shifts.filter((shift) => {
        if (shift.status !== "Забронировано") return false;
        const shiftStart = new Date(`${shift.date}T${shift.startTime}`);
        return shiftStart >= now && shiftStart <= futureTime;
      });
    },
    [shifts]
  );

  const getCurrentShifts = useCallback(() => {
    const now = new Date();
    return shifts.filter((shift) => {
      if (shift.status !== "В работе" && shift.status !== "Забронировано") return false;
      const shiftStart = new Date(`${shift.date}T${shift.startTime}`);
      const shiftEnd = new Date(`${shift.date}T${shift.endTime}`);
      if (shiftEnd < shiftStart) {
        shiftEnd.setDate(shiftEnd.getDate() + 1);
      }
      return now >= shiftStart && now <= shiftEnd;
    });
  }, [shifts]);

  const getTomorrowShifts = useCallback(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    return shifts.filter((shift) => shift.date === tomorrowStr);
  }, [shifts]);

  const getDayAfterTomorrowShifts = useCallback(() => {
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    const dayAfterStr = dayAfter.toISOString().split("T")[0];
    return shifts.filter((shift) => shift.date === dayAfterStr);
  }, [shifts]);

  const savePenalties = useCallback(async (newPenalties: Penalty[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PENALTIES, JSON.stringify(newPenalties));
      setPenalties(newPenalties);
    } catch (error) {
      console.error("Error saving penalties:", error);
    }
  }, []);

  const addPenalty = useCallback(
    (penalty: Penalty) => {
      const newPenalties = [...penalties, penalty];
      savePenalties(newPenalties);
    },
    [penalties, savePenalties]
  );

  const getPenaltiesForEmployee = useCallback(
    (employeeId: string) => {
      return penalties.filter((p) => p.employeeId === employeeId);
    },
    [penalties]
  );

  const saveKpiSettings = useCallback(async (newSettings: KPISettings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.KPI_SETTINGS, JSON.stringify(newSettings));
      setKpiSettings(newSettings);
    } catch (error) {
      console.error("Error saving KPI settings:", error);
    }
  }, []);

  const updateKpiSettings = useCallback(
    (updates: Partial<KPISettings>) => {
      const newSettings = { ...kpiSettings, ...updates };
      saveKpiSettings(newSettings);
    },
    [kpiSettings, saveKpiSettings]
  );

  const saveEmployeeKPIs = useCallback(async (newKPIs: EmployeeKPI[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.EMPLOYEE_KPI, JSON.stringify(newKPIs));
      setEmployeeKPIs(newKPIs);
    } catch (error) {
      console.error("Error saving employee KPIs:", error);
    }
  }, []);

  const updateEmployeeKPI = useCallback(
    (employeeId: string, updates: Partial<EmployeeKPI>) => {
      const existingIndex = employeeKPIs.findIndex((k) => k.employeeId === employeeId);
      let newKPIs: EmployeeKPI[];
      if (existingIndex >= 0) {
        newKPIs = employeeKPIs.map((k) =>
          k.employeeId === employeeId ? { ...k, ...updates } : k
        );
      } else {
        const newKPI: EmployeeKPI = {
          employeeId,
          discipline: 100,
          cashAccuracy: 100,
          noComplaints: 100,
          training: 100,
          tasksCompletion: 100,
          coefficient: 1.0,
          ...updates,
        };
        newKPIs = [...employeeKPIs, newKPI];
      }
      saveEmployeeKPIs(newKPIs);
    },
    [employeeKPIs, saveEmployeeKPIs]
  );

  const getEmployeeKPI = useCallback(
    (employeeId: string): EmployeeKPI | null => {
      return employeeKPIs.find((k) => k.employeeId === employeeId) || null;
    },
    [employeeKPIs]
  );

  const calculateKPICoefficient = useCallback(
    (kpi: EmployeeKPI): number => {
      const weightedScore =
        (kpi.discipline * kpiSettings.disciplineWeight +
          kpi.cashAccuracy * kpiSettings.cashAccuracyWeight +
          kpi.noComplaints * kpiSettings.noComplaintsWeight +
          kpi.training * kpiSettings.trainingWeight +
          kpi.tasksCompletion * kpiSettings.tasksWeight) / 100;
      return Math.max(0.5, Math.min(1.5, weightedScore));
    },
    [kpiSettings]
  );

  const rateTask = useCallback(
    (taskId: string, rating: 1 | 2 | 3 | 4 | 5, verifierName: string) => {
      const task = tasks.find((t) => t.id === taskId);
      const newTasks = tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: "Проверено" as TaskStatus,
              rating,
              verifiedAt: new Date().toISOString(),
              verifiedBy: verifierName,
              moderatedBy: verifierName,
              moderatedAt: new Date().toISOString(),
            }
          : t
      );
      saveTasks(newTasks);

      // Recalculate KPI
      if (task && (task.takenBy || task.assignedTo)) {
        const employeeId = task.takenBy || task.assignedTo!;
        const employeeTasks = newTasks.filter(
          (t) => (t.takenBy === employeeId || t.assignedTo === employeeId) && t.status === "Проверено"
        );
        
        if (employeeTasks.length > 0) {
           // Calculate task completion score based on ratings
           // 5 stars = 100%, 1 star = 20%
           // Or just average rating normalized to 100
           const totalRating = employeeTasks.reduce((sum, t) => sum + (t.rating || 0), 0);
           const maxRating = employeeTasks.length * 5;
           const tasksCompletion = Math.round((totalRating / maxRating) * 100);

           updateEmployeeKPI(employeeId, { tasksCompletion });
        }
      }
    },
    [tasks, saveTasks, updateEmployeeKPI]
  );

  const saveReplacements = useCallback(async (newReplacements: ShiftReplacement[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.REPLACEMENTS, JSON.stringify(newReplacements));
      setReplacements(newReplacements);
    } catch (error) {
      console.error("Error saving replacements:", error);
    }
  }, []);

  const addReplacement = useCallback(
    (replacement: ShiftReplacement) => {
      const newReplacements = [...replacements, replacement];
      saveReplacements(newReplacements);
    },
    [replacements, saveReplacements]
  );

  const cancelShift = useCallback(
    (shiftId: string, originalEmployeeId: string) => {
      const shift = shifts.find((s) => s.id === shiftId);
      if (!shift) return;

      const newShifts = shifts.map((s) =>
        s.id === shiftId
          ? { ...s, status: "Свободно" as ShiftStatus, employeeId: undefined, employeeName: undefined }
          : s
      );
      saveShifts(newShifts);

      const penalty: Penalty = {
        id: Date.now().toString(),
        employeeId: originalEmployeeId,
        employeeName: shift.employeeName || "",
        amount: SHIFT_CANCEL_PENALTY,
        reason: "Отмена смены",
        date: new Date().toISOString(),
        createdBy: "Система",
      };
      addPenalty(penalty);
    },
    [shifts, saveShifts, addPenalty]
  );

  const addSalaryPayment = useCallback(
    (payment: SalaryPayment) => {
      const newPayments = [...salaryPayments, payment];
      saveSalaryPayments(newPayments);
    },
    [salaryPayments, saveSalaryPayments]
  );

  const calculateEmployeeSalary = useCallback(
    (employeeId: string, periodStart: string, periodEnd: string) => {
      const user = users.find((u) => u.id === employeeId);
      if (!user) return null;

      const employeeHistory = history.filter((h) => {
        const shiftDate = new Date(h.shift.date);
        return (
          h.shift.employeeId === employeeId &&
          shiftDate >= new Date(periodStart) &&
          shiftDate <= new Date(periodEnd)
        );
      });

      let totalHours = 0;
      employeeHistory.forEach((h) => {
        const start = new Date(`${h.shift.date}T${h.shift.startTime}`);
        let end = new Date(`${h.shift.date}T${h.shift.endTime}`);
        if (end < start) end.setDate(end.getDate() + 1);
        totalHours += (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      });

      const hourlyRate = user.hourlyRate || DEFAULT_HOURLY_RATE;
      const baseAmount = totalHours * hourlyRate;
      const kpi = getEmployeeKPI(employeeId);
      const kpiCoefficient = kpi ? calculateKPICoefficient(kpi) : 1.0;
      const adjustedAmount = baseAmount * kpiCoefficient;

      const employeePenalties = penalties.filter(
        (p) =>
          p.employeeId === employeeId &&
          new Date(p.date) >= new Date(periodStart) &&
          new Date(p.date) <= new Date(periodEnd)
      );
      const totalPenalties = employeePenalties.reduce((sum, p) => sum + p.amount, 0);

      const employeeAdvances = advances.filter(
        (a) =>
          a.employeeId === employeeId &&
          new Date(a.date) >= new Date(periodStart) &&
          new Date(a.date) <= new Date(periodEnd)
      );
      const totalAdvances = employeeAdvances.reduce((sum, a) => sum + a.amount, 0);

      const employeePayments = salaryPayments.filter(
        (p) =>
          p.employeeId === employeeId &&
          p.periodStart === periodStart &&
          p.periodEnd === periodEnd
      );
      const paidAmount = employeePayments.reduce((sum, p) => sum + p.amount, 0);

      let shortages = 0;
      employeeHistory.forEach((h) => {
        if (h.report) {
          if (h.report.cashDiscrepancy < 0) shortages += Math.abs(h.report.cashDiscrepancy);
          if (h.report.cardDiscrepancy < 0) shortages += Math.abs(h.report.cardDiscrepancy);
        }
      });

      const netSalary = Math.max(0, adjustedAmount - totalPenalties - shortages);
      const totalPayout = Math.max(0, netSalary - totalAdvances);
      const remainingAmount = Math.max(0, totalPayout - paidAmount);

      return {
        employeeId,
        employeeName: user.name,
        hoursWorked: totalHours,
        hourlyRate,
        baseAmount,
        kpiCoefficient,
        adjustedAmount,
        penalties: totalPenalties,
        shortages,
        advances: totalAdvances,
        netSalary,
        totalPayout,
        period: `${periodStart} - ${periodEnd}`,
        paidAmount,
        remainingAmount,
      };
    },
    [users, history, penalties, advances, salaryPayments, getEmployeeKPI, calculateKPICoefficient]
  );

  const getShiftsRequiringArrival = useCallback(() => {
    const now = new Date();
    const fifteenMinLater = new Date(now.getTime() + 15 * 60 * 1000);

    return shifts.filter((shift) => {
      if (shift.status !== "Забронировано" || shift.arrivedAt) return false;
      const shiftStart = new Date(`${shift.date}T${shift.startTime}`);
      return shiftStart <= fifteenMinLater && shiftStart >= now;
    });
  }, [shifts]);

  const getLateShifts = useCallback(() => {
    const now = new Date();
    return shifts.filter((shift) => {
      if (shift.status !== "Забронировано" || shift.arrivedAt) return false;
      const shiftStart = new Date(`${shift.date}T${shift.startTime}`);
      return now > shiftStart;
    });
  }, [shifts]);

  const saveTrainingMaterials = useCallback(async (newMaterials: TrainingMaterial[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TRAINING_MATERIALS, JSON.stringify(newMaterials));
      setTrainingMaterials(newMaterials);
    } catch (error) {
      console.error("Error saving training materials:", error);
    }
  }, []);

  const saveTrainingProgress = useCallback(async (newProgress: EmployeeTrainingProgress[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TRAINING_PROGRESS, JSON.stringify(newProgress));
      setTrainingProgress(newProgress);
    } catch (error) {
      console.error("Error saving training progress:", error);
    }
  }, []);

  const addTrainingMaterial = useCallback(
    (material: TrainingMaterial) => {
      const newMaterials = [...trainingMaterials, material];
      saveTrainingMaterials(newMaterials);
    },
    [trainingMaterials, saveTrainingMaterials]
  );

  const updateTrainingMaterial = useCallback(
    (materialId: string, updates: Partial<TrainingMaterial>) => {
      const newMaterials = trainingMaterials.map((m) =>
        m.id === materialId
          ? { ...m, ...updates, version: m.version + 1, updatedAt: new Date().toISOString() }
          : m
      );
      saveTrainingMaterials(newMaterials);
    },
    [trainingMaterials, saveTrainingMaterials]
  );

  const markTrainingComplete = useCallback(
    (employeeId: string, materialId: string) => {
      const material = trainingMaterials.find((m) => m.id === materialId);
      if (!material) return;

      const existingIndex = trainingProgress.findIndex(
        (p) => p.employeeId === employeeId && p.materialId === materialId
      );

      let newProgress: EmployeeTrainingProgress[];
      if (existingIndex >= 0) {
        newProgress = trainingProgress.map((p, i) =>
          i === existingIndex
            ? { ...p, completedAt: new Date().toISOString(), materialVersion: material.version }
            : p
        );
      } else {
        newProgress = [
          ...trainingProgress,
          {
            employeeId,
            materialId,
            completedAt: new Date().toISOString(),
            materialVersion: material.version,
          },
        ];
      }
      saveTrainingProgress(newProgress);
    },
    [trainingMaterials, trainingProgress, saveTrainingProgress]
  );

  const getEmployeeTrainingStatus = useCallback(
    (employeeId: string) => {
      const completed = trainingProgress.filter((p) => {
        if (p.employeeId !== employeeId || !p.completedAt) return false;
        const material = trainingMaterials.find((m) => m.id === p.materialId);
        return material && p.materialVersion === material.version;
      });
      return {
        completed: completed.length,
        total: trainingMaterials.length,
        percentage: trainingMaterials.length > 0 ? (completed.length / trainingMaterials.length) * 100 : 100,
      };
    },
    [trainingMaterials, trainingProgress]
  );

  const isTrainingComplete = useCallback(
    (employeeId: string, materialId: string) => {
      const progress = trainingProgress.find(
        (p) => p.employeeId === employeeId && p.materialId === materialId
      );
      if (!progress || !progress.completedAt) return false;
      const material = trainingMaterials.find((m) => m.id === materialId);
      return material ? progress.materialVersion === material.version : false;
    },
    [trainingMaterials, trainingProgress]
  );

  const getNextShiftForEmployee = useCallback(
    (employeeId: string) => {
      const now = new Date();
      const employeeShifts = shifts
        .filter((s) => s.employeeId === employeeId && s.status === "Забронировано")
        .sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.startTime}`);
          const dateB = new Date(`${b.date}T${b.startTime}`);
          return dateA.getTime() - dateB.getTime();
        });
      return employeeShifts.find((s) => new Date(`${s.date}T${s.startTime}`) > now) || null;
    },
    [shifts]
  );

  const getDirectorFinancialReport = useCallback(
    (periodStart: string, periodEnd: string) => {
      const start = new Date(periodStart);
      const end = new Date(periodEnd);
      // 1. Planned Expenses (all shifts in period)
      const periodShifts = shifts.filter((s) => {
        const d = new Date(s.date);
        return d >= start && d <= end;
      });

      let plannedExpenses = 0;
      periodShifts.forEach((shift) => {
        let rate = DEFAULT_HOURLY_RATE;
        if (shift.employeeId) {
          const u = users.find((user) => user.id === shift.employeeId);
          if (u?.hourlyRate) rate = u.hourlyRate;
        }

        const sTime = new Date(`${shift.date}T${shift.startTime}`);
        let eTime = new Date(`${shift.date}T${shift.endTime}`);
        if (eTime < sTime) eTime.setDate(eTime.getDate() + 1);
        const hours = (eTime.getTime() - sTime.getTime()) / (1000 * 60 * 60);
        plannedExpenses += hours * rate;
      });

      // 2. Advances Paid
      const periodAdvances = advances.filter((a) => {
        const d = new Date(a.date);
        return d >= start && d <= end;
      });
      const advancesPaid = periodAdvances.reduce((sum, a) => sum + a.amount, 0);

      // 3. Salaries Paid
      const periodSalaries = salaryPayments.filter((p) => {
        const d = new Date(p.date);
        return d >= start && d <= end;
      });
      const salariesPaid = periodSalaries.reduce((sum, p) => sum + p.amount, 0);

      // 4. Remaining to Pay
      let remainingToPay = 0;
      const relevantEmployees = users.filter((u) =>
        EMPLOYEE_POSITIONS.includes(u.position as typeof EMPLOYEE_POSITIONS[number])
      );

      relevantEmployees.forEach((emp) => {
        const calc = calculateEmployeeSalary(emp.id, periodStart, periodEnd);
        if (calc) {
          remainingToPay += calc.remainingAmount;
        }
      });

      return {
        plannedExpenses,
        advancesPaid,
        salariesPaid,
        remainingToPay,
      };
    },
    [shifts, users, advances, salaryPayments, calculateEmployeeSalary]
  );

  const canCloseShift = useCallback(
    (shiftId: string, employeeId: string) => {
      const incompleteTasks = getEmployeeIncompleteTasks(employeeId);
      return incompleteTasks.length === 0;
    },
    [getEmployeeIncompleteTasks]
  );

  const loginByCode = useCallback(async (code: string) => {
    const user = users.find((u) => u.passcode === code);
    if (user) {
      await login(user);
      return true;
    }
    return false;
  }, [users, login]);

  return {
    users,
    shifts,
    reports,
    currentUser,
    templates,
    history,
    tasks,
    advances,
    penalties,
    kpiSettings,
    employeeKPIs,
    replacements,
    isLoading,
    loginByCode,
    login,
    logout,
    addUser,
    updateUser,
    addShift,
    addShifts,
    updateShift,
    bookShift,
    markArrival,
    markOnWay,
    acceptShiftNow,
    getEmployeeStatus,
    addReport,
    getAvailableShiftsForEmployee,
    getEmployeeShifts,
    getUnfilledShiftsWarning,
    getReportsForEmployee,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    closeShift,
    verifyReport,
    rejectReport,
    updateReport,
    moveToHistory,
    getUnverifiedReports,
    addTask,
    updateTask,
    getTasksForEmployee,
    takeTask,
    completeTask,
    rateTask,
    getAvailableTasks,
    getEmployeeIncompleteTasks,
    addAdvance,
    getAdvancesForEmployee,
    getUpcomingShifts,
    getCurrentShifts,
    getTomorrowShifts,
    getDayAfterTomorrowShifts,
    addPenalty,
    getPenaltiesForEmployee,
    updateKpiSettings,
    updateEmployeeKPI,
    getEmployeeKPI,
    calculateKPICoefficient,
    addReplacement,
    cancelShift,
    calculateEmployeeSalary,
    getShiftsRequiringArrival,
    getLateShifts,
    trainingMaterials,
    trainingProgress,
    addTrainingMaterial,
    updateTrainingMaterial,
    markTrainingComplete,
    getEmployeeTrainingStatus,
    isTrainingComplete,
    getNextShiftForEmployee,
    getDirectorFinancialReport,
    canCloseShift,
    deleteShift,
    addSalaryPayment,
    salaryPayments,
  };
});
