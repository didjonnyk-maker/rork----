import {
  Banknote,
  Calculator,
  Calendar,
  DollarSign,
  TrendingDown,
  User as UserIcon,
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
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "@/providers/AppProvider";
import { EMPLOYEE_POSITIONS, SalaryCalculation } from "@/types";

export default function FinanceScreen() {
  const {
    users,
    advances,
    penalties,
    calculateEmployeeSalary,
    addAdvance,
    currentUser,
  } = useApp();

  const [selectedTab, setSelectedTab] = useState<"salary" | "advances" | "penalties">("salary");
  const [periodStart, setPeriodStart] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().split("T")[0];
  });
  const [periodEnd, setPeriodEnd] = useState(() => {
    const date = new Date();
    return date.toISOString().split("T")[0];
  });
  const [advanceEmployeeId, setAdvanceEmployeeId] = useState("");
  const [advanceAmount, setAdvanceAmount] = useState("");

  const employees = useMemo(
    () => users.filter((u) => EMPLOYEE_POSITIONS.includes(u.position as typeof EMPLOYEE_POSITIONS[number])),
    [users]
  );

  const salaryCalculations = useMemo(() => {
    return employees.map((emp) => calculateEmployeeSalary(emp.id, periodStart, periodEnd)).filter(Boolean) as SalaryCalculation[];
  }, [employees, periodStart, periodEnd, calculateEmployeeSalary]);

  const totalPayout = useMemo(
    () => salaryCalculations.reduce((sum, s) => sum + s.totalPayout, 0),
    [salaryCalculations]
  );

  const sortedAdvances = useMemo(
    () => [...advances].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [advances]
  );

  const sortedPenalties = useMemo(
    () => [...penalties].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [penalties]
  );

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

  const renderSalaryCard = (salary: SalaryCalculation) => (
    <View key={salary.employeeId} style={styles.salaryCard}>
      <View style={styles.salaryHeader}>
        <View style={styles.employeeRow}>
          <UserIcon size={18} color="#2563EB" strokeWidth={2} />
          <Text style={styles.employeeName}>{salary.employeeName}</Text>
        </View>
        <Text style={styles.totalPayoutBadge}>{formatCurrency(salary.totalPayout)}</Text>
      </View>

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
          <Text style={styles.totalLabel}>К выплате:</Text>
          <Text style={styles.totalValue}>{formatCurrency(salary.totalPayout)}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
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
      </View>

      {selectedTab === "salary" && (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={styles.periodSection}>
            <Text style={styles.periodTitle}>Период расчёта</Text>
            <View style={styles.periodInputs}>
              <View style={styles.periodInput}>
                <Calendar size={16} color="#6B7280" strokeWidth={2} />
                <TextInput
                  style={styles.dateInput}
                  value={periodStart}
                  onChangeText={setPeriodStart}
                  placeholder="ГГГГ-ММ-ДД"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <Text style={styles.periodSeparator}>—</Text>
              <View style={styles.periodInput}>
                <Calendar size={16} color="#6B7280" strokeWidth={2} />
                <TextInput
                  style={styles.dateInput}
                  value={periodEnd}
                  onChangeText={setPeriodEnd}
                  placeholder="ГГГГ-ММ-ДД"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <DollarSign size={24} color="#2563EB" strokeWidth={2} />
            <View style={styles.summaryContent}>
              <Text style={styles.summaryLabel}>Общая сумма к выплате</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totalPayout)}</Text>
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
  periodSection: {
    marginBottom: 16,
  },
  periodTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#374151",
    marginBottom: 8,
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
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 13,
    color: "#1E40AF",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#1E40AF",
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
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
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
  salaryDetails: {
    gap: 8,
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
