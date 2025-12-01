import DateTimePicker from "@react-native-community/datetimepicker";
import {
  Banknote,
  Calculator,
  Calendar,
  ChevronDown,
  ChevronUp,
  Download,
  TrendingDown,
  User as UserIcon,
  Award,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Sharing from "expo-sharing";
import { File, Paths } from "expo-file-system";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "@/providers/AppProvider";
import { EMPLOYEE_POSITIONS, SalaryCalculation } from "@/types";

export default function FinanceScreen() {
  const {
    users,
    advances,
    penalties,
    bonuses,
    calculateEmployeeSalary,
    addAdvance,
    addPenalty,
    addBonus,
    addSalaryPayment,
    currentUser,
    getDirectorFinancialReport,
  } = useApp();

  const [selectedTab, setSelectedTab] = useState<"salary" | "advances" | "penalties" | "bonuses">("salary");
  const [periodStart, setPeriodStart] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().split("T")[0];
  });
  const [periodEnd, setPeriodEnd] = useState(() => {
    const date = new Date();
    // End of current month
    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return nextMonth.toISOString().split("T")[0];
  });
  const [advanceEmployeeId, setAdvanceEmployeeId] = useState("");
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [penaltyEmployeeId, setPenaltyEmployeeId] = useState("");
  const [penaltyAmount, setPenaltyAmount] = useState("");
  const [penaltyReason, setPenaltyReason] = useState("");
  const [bonusEmployeeId, setBonusEmployeeId] = useState("");
  const [bonusAmount, setBonusAmount] = useState("");
  const [bonusReason, setBonusReason] = useState("");
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleCard = (employeeId: string) => {
    setExpandedCards((prev) => ({ ...prev, [employeeId]: !prev[employeeId] }));
  };

  const handleExportExcel = async () => {
    if (Platform.OS === "web") {
      alert("Экспорт в Excel (CSV) доступен только в мобильном приложении");
      return;
    }

    let csvContent = "Сотрудник,Отработано (ч),Ставка,База,KPI,Итог (до штрафов),Премии,Штрафы,Недостачи,Авансы,К выдаче\n";
    salaryCalculations.forEach((s) => {
      const row = [
        s.employeeName,
        s.hoursWorked.toFixed(2),
        s.hourlyRate,
        s.baseAmount.toFixed(2),
        s.kpiCoefficient.toFixed(2),
        s.adjustedAmount.toFixed(2),
        s.bonuses.toFixed(2),
        s.penalties.toFixed(2),
        s.shortages.toFixed(2),
        s.advances.toFixed(2),
        s.totalPayout.toFixed(2),
      ].join(",");
      csvContent += row + "\n";
    });

    try {
      const file = new File(Paths.cache, "salary_report.csv");
      file.create();
      file.write(csvContent);
      await Sharing.shareAsync(file.uri);
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось экспортировать файл");
      console.error(error);
    }
  };


  const onStartChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setPeriodStart(selectedDate.toISOString().split("T")[0]);
    }
  };

  const onEndChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setPeriodEnd(selectedDate.toISOString().split("T")[0]);
    }
  };

  const employees = useMemo(
    () => users.filter((u) => EMPLOYEE_POSITIONS.includes(u.position as typeof EMPLOYEE_POSITIONS[number])),
    [users]
  );

  const salaryCalculations = useMemo(() => {
    return employees.map((emp) => calculateEmployeeSalary(emp.id, periodStart, periodEnd)).filter(Boolean) as SalaryCalculation[];
  }, [employees, periodStart, periodEnd, calculateEmployeeSalary]);

  const sortedAdvances = useMemo(
    () =>
      advances
        .filter((a) => {
          const d = new Date(a.date);
          return d >= new Date(periodStart) && d <= new Date(periodEnd);
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [advances, periodStart, periodEnd]
  );

  const sortedPenalties = useMemo(
    () =>
      penalties
        .filter((p) => {
          const d = new Date(p.date);
          return d >= new Date(periodStart) && d <= new Date(periodEnd);
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [penalties, periodStart, periodEnd]
  );

  const sortedBonuses = useMemo(
    () =>
      bonuses
        .filter((b) => {
          const d = new Date(b.date);
          return d >= new Date(periodStart) && d <= new Date(periodEnd);
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [bonuses, periodStart, periodEnd]
  );

  const directorReport = useMemo(() => {
    return getDirectorFinancialReport(periodStart, periodEnd);
  }, [periodStart, periodEnd, getDirectorFinancialReport]);

  const handleAddAdvance = () => {
    if (!advanceEmployeeId || !advanceAmount) {
      const msg = "Выберите сотрудника и укажите сумму";
      if (Platform.OS === "web") {
        alert(msg);
      } else {
        Alert.alert("Ошибка", msg);
      }
      return;
    }

    const employee = employees.find((e) => e.id === advanceEmployeeId);
    if (!employee) return;

    const advance = {
      id: Date.now().toString(),
      employeeId: advanceEmployeeId,
      employeeName: employee.name,
      amount: parseFloat(advanceAmount),
      date: new Date().toISOString(),
      approvedBy: currentUser?.name,
    };

    addAdvance(advance);
    setAdvanceEmployeeId("");
    setAdvanceAmount("");

    const successMsg = "Аванс успешно выдан!";
    if (Platform.OS === "web") {
      alert(successMsg);
    } else {
      Alert.alert("Успешно", successMsg);
    }
  };

  const handleAddPenalty = () => {
    if (!penaltyEmployeeId || !penaltyAmount || !penaltyReason) {
      const msg = "Заполните все поля (сотрудник, сумма, причина)";
      if (Platform.OS === "web") {
        alert(msg);
      } else {
        Alert.alert("Ошибка", msg);
      }
      return;
    }

    const employee = employees.find((e) => e.id === penaltyEmployeeId);
    if (!employee) return;

    const penalty = {
      id: Date.now().toString(),
      employeeId: penaltyEmployeeId,
      employeeName: employee.name,
      amount: parseFloat(penaltyAmount),
      reason: penaltyReason,
      date: new Date().toISOString(),
      createdBy: currentUser?.name || "Администратор",
    };

    addPenalty(penalty);
    setPenaltyEmployeeId("");
    setPenaltyAmount("");
    setPenaltyReason("");

    const successMsg = "Штраф успешно добавлен!";
    if (Platform.OS === "web") {
      alert(successMsg);
    } else {
      Alert.alert("Успешно", successMsg);
    }
  };

  const handleAddBonus = () => {
    if (!bonusEmployeeId || !bonusAmount || !bonusReason) {
      const msg = "Заполните все поля (сотрудник, сумма, причина/комментарий)";
      if (Platform.OS === "web") {
        alert(msg);
      } else {
        Alert.alert("Ошибка", msg);
      }
      return;
    }

    const employee = employees.find((e) => e.id === bonusEmployeeId);
    if (!employee) return;

    const bonus = {
      id: Date.now().toString(),
      employeeId: bonusEmployeeId,
      employeeName: employee.name,
      amount: parseFloat(bonusAmount),
      reason: bonusReason,
      date: new Date().toISOString(),
      createdBy: currentUser?.name || "Директор",
    };

    addBonus(bonus);
    setBonusEmployeeId("");
    setBonusAmount("");
    setBonusReason("");

    const successMsg = "Премия успешно начислена!";
    if (Platform.OS === "web") {
      alert(successMsg);
    } else {
      Alert.alert("Успешно", successMsg);
    }
  };

  const handlePaySalary = (salary: SalaryCalculation) => {
    if (salary.remainingAmount <= 0) {
      const msg = "Нет суммы к выплате";
      if (Platform.OS === "web") {
        alert(msg);
      } else {
        Alert.alert("Ошибка", msg);
      }
      return;
    }

    Alert.alert(
      "Подтверждение выплаты",
      `Выплатить ${formatCurrency(salary.remainingAmount)} сотруднику ${salary.employeeName}?`,
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Выплатить",
          onPress: () => {
            const payment = {
              id: Date.now().toString(),
              employeeId: salary.employeeId,
              employeeName: salary.employeeName,
              amount: salary.remainingAmount,
              date: new Date().toISOString(),
              periodStart: periodStart,
              periodEnd: periodEnd,
              paidBy: currentUser?.name || "Директор",
            };
            addSalaryPayment(payment);
          },
        },
      ]
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} сом`;
  };

  const renderSalaryCard = (salary: SalaryCalculation) => {
    const isExpanded = expandedCards[salary.employeeId];
    return (
      <View key={salary.employeeId} style={styles.salaryCard}>
        <TouchableOpacity 
          style={styles.salaryHeader} 
          onPress={() => toggleCard(salary.employeeId)}
          activeOpacity={0.7}
        >
          <View style={styles.headerLeft}>
            <View style={styles.employeeRow}>
              <UserIcon size={18} color="#2563EB" strokeWidth={2} />
              <Text style={styles.employeeName}>{salary.employeeName}</Text>
            </View>
            {salary.remainingAmount !== 0 && (
               <Text style={[
                  styles.miniBadge, 
                  salary.remainingAmount > 0 ? { color: "#15803D" } : { color: "#DC2626" }
               ]}>
                 {salary.remainingAmount > 0 ? "К выплате: " : "Долг: "}
                 {formatCurrency(Math.abs(salary.remainingAmount))}
               </Text>
            )}
          </View>
          <View style={styles.headerRight}>
             {isExpanded ? (
               <ChevronUp size={20} color="#6B7280" />
             ) : (
               <ChevronDown size={20} color="#6B7280" />
             )}
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.salaryDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Отработано часов:</Text>
              <Text style={styles.detailValue}>{salary.hoursWorked.toFixed(1)} ч</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Ставка:</Text>
              <Text style={styles.detailValue}>{salary.hourlyRate} сом/час</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Базовая сумма:</Text>
              <Text style={styles.detailValue}>{formatCurrency(salary.baseAmount)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>KPI коэффициент:</Text>
              <Text style={[styles.detailValue, { color: salary.kpiCoefficient >= 1 ? "#15803D" : "#DC2626" }]}>
                ×{salary.kpiCoefficient.toFixed(2)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>После KPI:</Text>
              <Text style={styles.detailValue}>{formatCurrency(salary.adjustedAmount)}</Text>
            </View>

            {salary.bonuses > 0 && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Премии:</Text>
                <Text style={[styles.detailValue, { color: "#15803D" }]}>+{formatCurrency(salary.bonuses)}</Text>
              </View>
            )}

            {(salary.penalties > 0 || salary.shortages > 0 || salary.advances > 0) && (
              <View style={styles.deductionsSection}>
                <Text style={styles.deductionsTitle}>Удержания:</Text>
                {salary.penalties > 0 && (
                  <View style={styles.deductionRow}>
                    <Text style={styles.deductionLabel}>Штрафы:</Text>
                    <Text style={styles.deductionValue}>-{formatCurrency(salary.penalties)}</Text>
                  </View>
                )}
                {salary.shortages > 0 && (
                  <View style={styles.deductionRow}>
                    <Text style={styles.deductionLabel}>Недостачи:</Text>
                    <Text style={styles.deductionValue}>-{formatCurrency(salary.shortages)}</Text>
                  </View>
                )}
                {salary.advances > 0 && (
                  <View style={styles.deductionRow}>
                    <Text style={styles.deductionLabel}>Авансы:</Text>
                    <Text style={styles.deductionValue}>-{formatCurrency(salary.advances)}</Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Заработано (до авансов):</Text>
              <Text style={styles.totalValue}>{formatCurrency(salary.netSalary)}</Text>
            </View>

            <View style={styles.paymentStatusRow}>
               <View>
                <Text style={styles.detailLabel}>Авансы:</Text>
                <Text style={[styles.detailValue, { color: "#DC2626" }]}>-{formatCurrency(salary.advances)}</Text>
              </View>
              <View>
                <Text style={styles.detailLabel}>К выплате:</Text>
                <Text style={styles.detailValue}>{formatCurrency(salary.totalPayout)}</Text>
              </View>
            </View>

            <View style={styles.paymentStatusRow}>
              <View>
                <Text style={styles.detailLabel}>Выплачено ЗП:</Text>
                <Text style={[styles.detailValue, { color: "#15803D" }]}>{formatCurrency(salary.paidAmount)}</Text>
              </View>
              <View>
                <Text style={styles.detailLabel}>Остаток:</Text>
                <Text
                  style={[
                    styles.totalValue,
                    { fontSize: 18, color: salary.remainingAmount < 0 ? "#DC2626" : "#15803D" },
                  ]}
                >
                  {formatCurrency(salary.remainingAmount)}
                </Text>
              </View>
            </View>

            {salary.remainingAmount > 0 && (
              <TouchableOpacity
                style={styles.payButton}
                onPress={() => handlePaySalary(salary)}
              >
                <Banknote size={16} color="#FFFFFF" strokeWidth={2} />
                <Text style={styles.payButtonText}>Выплатить остаток</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };


  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.periodSectionHeader}>
        <View style={styles.periodHeaderTop}>
          <Text style={styles.periodTitle}>Период расчёта</Text>
          {selectedTab === "salary" && (
            <TouchableOpacity style={styles.exportButton} onPress={handleExportExcel}>
              <Download size={16} color="#2563EB" strokeWidth={2} />
              <Text style={styles.exportButtonText}>Excel</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.periodInputs}>
          <View style={styles.periodInput}>
            <Calendar size={16} color="#6B7280" strokeWidth={2} />
            <TouchableOpacity onPress={() => setShowStartPicker(true)} style={{ flex: 1 }}>
              <Text style={styles.dateInput}>{periodStart}</Text>
            </TouchableOpacity>
            {showStartPicker && (
              <DateTimePicker
                value={new Date(periodStart)}
                mode="date"
                display="default"
                onChange={onStartChange}
              />
            )}
          </View>
          <Text style={styles.periodSeparator}>—</Text>
          <View style={styles.periodInput}>
            <Calendar size={16} color="#6B7280" strokeWidth={2} />
            <TouchableOpacity onPress={() => setShowEndPicker(true)} style={{ flex: 1 }}>
              <Text style={styles.dateInput}>{periodEnd}</Text>
            </TouchableOpacity>
            {showEndPicker && (
              <DateTimePicker
                value={new Date(periodEnd)}
                mode="date"
                display="default"
                onChange={onEndChange}
              />
            )}
          </View>
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "salary" && styles.tabActive]}
          onPress={() => setSelectedTab("salary")}
        >
          <Calculator size={18} color={selectedTab === "salary" ? "#FFFFFF" : "#6B7280"} strokeWidth={2} />
          <Text style={[styles.tabText, selectedTab === "salary" && styles.tabTextActive]}>
            Зарплата
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "advances" && styles.tabActive]}
          onPress={() => setSelectedTab("advances")}
        >
          <Banknote size={18} color={selectedTab === "advances" ? "#FFFFFF" : "#6B7280"} strokeWidth={2} />
          <Text style={[styles.tabText, selectedTab === "advances" && styles.tabTextActive]}>
            Авансы
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "penalties" && styles.tabActive]}
          onPress={() => setSelectedTab("penalties")}
        >
          <TrendingDown size={18} color={selectedTab === "penalties" ? "#FFFFFF" : "#6B7280"} strokeWidth={2} />
          <Text style={[styles.tabText, selectedTab === "penalties" && styles.tabTextActive]}>
            Штрафы
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "bonuses" && styles.tabActive]}
          onPress={() => setSelectedTab("bonuses")}
        >
          <Award size={18} color={selectedTab === "bonuses" ? "#FFFFFF" : "#6B7280"} strokeWidth={2} />
          <Text style={[styles.tabText, selectedTab === "bonuses" && styles.tabTextActive]}>
            Премии
          </Text>
        </TouchableOpacity>
      </View>

      {selectedTab === "salary" && (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={styles.summaryCard}>
            <View style={styles.reportRow}>
              <View style={styles.reportItem}>
                 <Text style={styles.reportLabel}>План. расходы</Text>
                 <Text style={styles.reportValue}>{formatCurrency(directorReport.plannedExpenses)}</Text>
              </View>
              <View style={styles.reportItem}>
                 <Text style={styles.reportLabel}>Выплачено авансов</Text>
                 <Text style={styles.reportValue}>{formatCurrency(directorReport.advancesPaid)}</Text>
              </View>
            </View>
            <View style={[styles.reportRow, { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#BFDBFE" }]}>
              <View style={styles.reportItem}>
                 <Text style={styles.reportLabel}>Выплачено ЗП</Text>
                 <Text style={styles.reportValue}>{formatCurrency(directorReport.salariesPaid)}</Text>
              </View>
              <View style={styles.reportItem}>
                 <Text style={styles.reportLabel}>Остаток к выплате</Text>
                 <Text style={[styles.reportValue, { color: "#1E40AF" }]}>{formatCurrency(directorReport.remainingToPay)}</Text>
              </View>
            </View>
          </View>

          {salaryCalculations.map((salary) => renderSalaryCard(salary))}

          {salaryCalculations.length === 0 && (
            <View style={styles.emptyState}>
              <Calculator size={48} color="#D1D5DB" strokeWidth={1.5} />
              <Text style={styles.emptyTitle}>Нет данных</Text>
              <Text style={styles.emptyText}>За выбранный период нет данных для расчёта</Text>
            </View>
          )}
        </ScrollView>
      )}

      {selectedTab === "advances" && (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={styles.addAdvanceCard}>
            <Text style={styles.addAdvanceTitle}>Выдать аванс</Text>

            <View style={styles.advanceForm}>
              <View style={styles.selectContainer}>
                <Text style={styles.inputLabel}>Сотрудник</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.employeeChips}>
                    {employees.map((emp) => (
                      <TouchableOpacity
                        key={emp.id}
                        style={[
                          styles.employeeChip,
                          advanceEmployeeId === emp.id && styles.employeeChipActive,
                        ]}
                        onPress={() => setAdvanceEmployeeId(emp.id)}
                      >
                        <Text
                          style={[
                            styles.employeeChipText,
                            advanceEmployeeId === emp.id && styles.employeeChipTextActive,
                          ]}
                        >
                          {emp.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={styles.amountContainer}>
                <Text style={styles.inputLabel}>Сумма (сом)</Text>
                <TextInput
                  style={styles.amountInput}
                  value={advanceAmount}
                  onChangeText={setAdvanceAmount}
                  placeholder="0.00"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="decimal-pad"
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.addAdvanceButton,
                  (!advanceEmployeeId || !advanceAmount) && styles.addAdvanceButtonDisabled,
                ]}
                onPress={handleAddAdvance}
                disabled={!advanceEmployeeId || !advanceAmount}
              >
                <Banknote size={18} color="#FFFFFF" strokeWidth={2} />
                <Text style={styles.addAdvanceButtonText}>Выдать аванс</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.listTitle}>История авансов</Text>
          {sortedAdvances.map((advance) => (
            <View key={advance.id} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyName}>{advance.employeeName}</Text>
                <Text style={styles.historyAmount}>{formatCurrency(advance.amount)}</Text>
              </View>
              <View style={styles.historyFooter}>
                <Text style={styles.historyDate}>{formatDate(advance.date)}</Text>
                {advance.approvedBy && (
                  <Text style={styles.historyApproved}>Одобрил: {advance.approvedBy}</Text>
                )}
              </View>
            </View>
          ))}

          {sortedAdvances.length === 0 && (
            <View style={styles.emptyState}>
              <Banknote size={48} color="#D1D5DB" strokeWidth={1.5} />
              <Text style={styles.emptyTitle}>Нет авансов</Text>
              <Text style={styles.emptyText}>История авансов пуста</Text>
            </View>
          )}
        </ScrollView>
      )}

      {selectedTab === "penalties" && (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={styles.addAdvanceCard}>
            <Text style={styles.addAdvanceTitle}>Добавить штраф</Text>

            <View style={styles.advanceForm}>
              <View style={styles.selectContainer}>
                <Text style={styles.inputLabel}>Сотрудник</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.employeeChips}>
                    {employees.map((emp) => (
                      <TouchableOpacity
                        key={emp.id}
                        style={[
                          styles.employeeChip,
                          penaltyEmployeeId === emp.id && styles.employeeChipActive,
                        ]}
                        onPress={() => setPenaltyEmployeeId(emp.id)}
                      >
                        <Text
                          style={[
                            styles.employeeChipText,
                            penaltyEmployeeId === emp.id && styles.employeeChipTextActive,
                          ]}
                        >
                          {emp.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={styles.amountContainer}>
                <Text style={styles.inputLabel}>Сумма штрафа (сом)</Text>
                <TextInput
                  style={styles.amountInput}
                  value={penaltyAmount}
                  onChangeText={setPenaltyAmount}
                  placeholder="0.00"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.amountContainer}>
                <Text style={styles.inputLabel}>Причина</Text>
                <TextInput
                  style={styles.amountInput}
                  value={penaltyReason}
                  onChangeText={setPenaltyReason}
                  placeholder="Опоздание, нарушение и т.д."
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.addAdvanceButton,
                  { backgroundColor: "#DC2626" },
                  (!penaltyEmployeeId || !penaltyAmount || !penaltyReason) && styles.addAdvanceButtonDisabled,
                ]}
                onPress={handleAddPenalty}
                disabled={!penaltyEmployeeId || !penaltyAmount || !penaltyReason}
              >
                <TrendingDown size={18} color="#FFFFFF" strokeWidth={2} />
                <Text style={styles.addAdvanceButtonText}>Наложить штраф</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.listTitle}>История штрафов</Text>
          {sortedPenalties.map((penalty) => (
            <View key={penalty.id} style={styles.penaltyCard}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyName}>{penalty.employeeName}</Text>
                <Text style={styles.penaltyAmount}>-{formatCurrency(penalty.amount)}</Text>
              </View>
              <Text style={styles.penaltyReason}>{penalty.reason}</Text>
              <View style={styles.historyFooter}>
                <Text style={styles.historyDate}>{formatDate(penalty.date)}</Text>
                <Text style={styles.historyApproved}>Создал: {penalty.createdBy}</Text>
              </View>
            </View>
          ))}

          {sortedPenalties.length === 0 && (
            <View style={styles.emptyState}>
              <TrendingDown size={48} color="#D1D5DB" strokeWidth={1.5} />
              <Text style={styles.emptyTitle}>Нет штрафов</Text>
              <Text style={styles.emptyText}>История штрафов пуста</Text>
            </View>
          )}
        </ScrollView>
      )}
      {selectedTab === "bonuses" && (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={styles.addAdvanceCard}>
            <Text style={styles.addAdvanceTitle}>Начислить премию</Text>

            <View style={styles.advanceForm}>
              <View style={styles.selectContainer}>
                <Text style={styles.inputLabel}>Сотрудник</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.employeeChips}>
                    {employees.map((emp) => (
                      <TouchableOpacity
                        key={emp.id}
                        style={[
                          styles.employeeChip,
                          bonusEmployeeId === emp.id && styles.employeeChipActive,
                        ]}
                        onPress={() => setBonusEmployeeId(emp.id)}
                      >
                        <Text
                          style={[
                            styles.employeeChipText,
                            bonusEmployeeId === emp.id && styles.employeeChipTextActive,
                          ]}
                        >
                          {emp.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={styles.amountContainer}>
                <Text style={styles.inputLabel}>Сумма (сом)</Text>
                <TextInput
                  style={styles.amountInput}
                  value={bonusAmount}
                  onChangeText={setBonusAmount}
                  placeholder="0.00"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.amountContainer}>
                <Text style={styles.inputLabel}>Причина / Комментарий</Text>
                <TextInput
                  style={styles.amountInput}
                  value={bonusReason}
                  onChangeText={setBonusReason}
                  placeholder="За отличную работу и т.д."
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.addAdvanceButton,
                  { backgroundColor: "#15803D" },
                  (!bonusEmployeeId || !bonusAmount || !bonusReason) && styles.addAdvanceButtonDisabled,
                ]}
                onPress={handleAddBonus}
                disabled={!bonusEmployeeId || !bonusAmount || !bonusReason}
              >
                <Award size={18} color="#FFFFFF" strokeWidth={2} />
                <Text style={styles.addAdvanceButtonText}>Начислить премию</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.listTitle}>История премий</Text>
          {sortedBonuses.map((bonus) => (
            <View key={bonus.id} style={[styles.penaltyCard, { borderColor: "#BBF7D0", borderLeftColor: "#15803D" }]}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyName}>{bonus.employeeName}</Text>
                <Text style={[styles.penaltyAmount, { color: "#15803D" }]}>+{formatCurrency(bonus.amount)}</Text>
              </View>
              <Text style={styles.penaltyReason}>{bonus.reason}</Text>
              <View style={styles.historyFooter}>
                <Text style={styles.historyDate}>{formatDate(bonus.date)}</Text>
                <Text style={styles.historyApproved}>Начислил: {bonus.createdBy}</Text>
              </View>
            </View>
          ))}

          {sortedBonuses.length === 0 && (
            <View style={styles.emptyState}>
              <Award size={48} color="#D1D5DB" strokeWidth={1.5} />
              <Text style={styles.emptyTitle}>Нет премий</Text>
              <Text style={styles.emptyText}>История премий пуста</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
  },
  tabActive: {
    backgroundColor: "#2563EB",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#6B7280",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  periodSectionHeader: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  periodHeaderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  exportButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2563EB",
  },
  periodTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#374151",
  },
  periodInputs: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  periodInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },
  periodSeparator: {
    fontSize: 16,
    color: "#6B7280",
  },
  summaryCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  reportRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  reportItem: {
    flex: 1,
  },
  reportLabel: {
    fontSize: 12,
    color: "#60A5FA",
    marginBottom: 4,
    fontWeight: "500",
  },
  reportValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E3A8A",
  },
  salaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  salaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerLeft: {
    gap: 4,
  },
  headerRight: {
    padding: 4,
  },
  miniBadge: {
    fontSize: 11,
    fontWeight: "600",
  },
  salaryDetails: {
    marginTop: 12,
    gap: 8,
  },
  employeeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#111827",
  },
  totalPayoutBadge: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#15803D",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 13,
    color: "#6B7280",
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#111827",
  },
  deductionsSection: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#FEE2E2",
    backgroundColor: "#FEF2F2",
    marginHorizontal: -16,
    marginBottom: -8,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomLeftRadius: 11,
    borderBottomRightRadius: 11,
  },
  deductionsTitle: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#DC2626",
    marginBottom: 6,
  },
  deductionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  deductionLabel: {
    fontSize: 12,
    color: "#991B1B",
  },
  deductionValue: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#DC2626",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#111827",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#15803D",
  },
  paymentStatusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  payButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#15803D",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  payButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  addAdvanceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  addAdvanceTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#111827",
    marginBottom: 16,
  },
  advanceForm: {
    gap: 16,
  },
  selectContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#374151",
  },
  employeeChips: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  employeeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  employeeChipActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  employeeChipText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#374151",
  },
  employeeChipTextActive: {
    color: "#FFFFFF",
  },
  amountContainer: {
    gap: 8,
  },
  amountInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
  addAdvanceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2563EB",
    borderRadius: 10,
    paddingVertical: 14,
  },
  addAdvanceButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  addAdvanceButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#111827",
    marginBottom: 12,
  },
  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  historyName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#111827",
  },
  historyAmount: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#2563EB",
  },
  historyFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historyDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  historyApproved: {
    fontSize: 12,
    color: "#6B7280",
  },
  penaltyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#FECACA",
    borderLeftWidth: 4,
    borderLeftColor: "#DC2626",
  },
  penaltyAmount: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#DC2626",
  },
  penaltyReason: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 8,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#6B7280",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
    textAlign: "center" as const,
  },
});
