import { Stack } from "expo-router";
import {
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  ChevronDown,
  ChevronUp,
} from "lucide-react-native";
import { useState, useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useApp } from "@/providers/AppProvider";
import { EMPLOYEE_POSITIONS } from "@/types";

export default function FounderFinanceScreen() {
  const { getDirectorFinancialReport, calculateEmployeeSalary, users } =
    useApp();

  const [periodStart, setPeriodStart] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().split("T")[0];
  });
  const [periodEnd, setPeriodEnd] = useState(() => {
    const date = new Date();
    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return nextMonth.toISOString().split("T")[0];
  });

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleCard = (employeeId: string) => {
    setExpandedCards((prev) => ({ ...prev, [employeeId]: !prev[employeeId] }));
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

  const report = useMemo(
    () => getDirectorFinancialReport(periodStart, periodEnd),
    [getDirectorFinancialReport, periodStart, periodEnd]
  );

  const employeeData = useMemo(() => {
    const employees = users.filter((u) =>
      EMPLOYEE_POSITIONS.includes(
        u.position as (typeof EMPLOYEE_POSITIONS)[number]
      )
    );
    return employees
      .map((emp) => {
        const salary = calculateEmployeeSalary(emp.id, periodStart, periodEnd);
        return salary;
      })
      .filter((s) => s !== null);
  }, [users, calculateEmployeeSalary, periodStart, periodEnd]);

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen options={{ title: "Финансовые показатели" }} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Финансовые показатели</Text>
          <Text style={styles.headerSubtitle}>Просмотр данных</Text>
        </View>

        <View style={styles.periodSection}>
          <Text style={styles.sectionTitle}>Выберите период</Text>
          <View style={styles.periodInputs}>
            <TouchableOpacity
              style={styles.periodInput}
              onPress={() => setShowStartPicker(true)}
            >
              <Calendar size={16} color="#6B7280" strokeWidth={2} />
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

            <Text style={styles.periodSeparator}>—</Text>

            <TouchableOpacity
              style={styles.periodInput}
              onPress={() => setShowEndPicker(true)}
            >
              <Calendar size={16} color="#6B7280" strokeWidth={2} />
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

        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Общая сводка</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryIconContainer}>
                <TrendingUp size={24} color="#EF4444" strokeWidth={2} />
              </View>
              <Text style={styles.summaryLabel}>Планируемые расходы</Text>
              <Text style={styles.summaryValue}>
                {report.plannedExpenses.toFixed(2)} ₽
              </Text>
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.summaryIconContainer}>
                <DollarSign size={24} color="#F59E0B" strokeWidth={2} />
              </View>
              <Text style={styles.summaryLabel}>Выплачено авансов</Text>
              <Text style={styles.summaryValue}>
                {report.advancesPaid.toFixed(2)} ₽
              </Text>
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.summaryIconContainer}>
                <DollarSign size={24} color="#10B981" strokeWidth={2} />
              </View>
              <Text style={styles.summaryLabel}>Выплачено ЗП</Text>
              <Text style={styles.summaryValue}>
                {report.salariesPaid.toFixed(2)} ₽
              </Text>
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.summaryIconContainer}>
                <TrendingDown size={24} color="#3B82F6" strokeWidth={2} />
              </View>
              <Text style={styles.summaryLabel}>Осталось выплатить</Text>
              <Text style={styles.summaryValue}>
                {report.remainingToPay.toFixed(2)} ₽
              </Text>
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.summaryIconContainer}>
                <TrendingDown size={24} color="#8B5CF6" strokeWidth={2} />
              </View>
              <Text style={styles.summaryLabel}>Удержано штрафов</Text>
              <Text style={styles.summaryValue}>
                {report.penaltiesDeducted.toFixed(2)} ₽
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.employeesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Сотрудники</Text>
            <View style={styles.viewOnlyBadge}>
              <Eye size={14} color="#8B5CF6" strokeWidth={2} />
              <Text style={styles.viewOnlyText}>Просмотр</Text>
            </View>
          </View>
          {employeeData.map((employee, index) => {
            const isExpanded = expandedCards[employee.employeeId];
            return (
            <View key={index} style={styles.employeeCard}>
              <TouchableOpacity 
                style={styles.employeeHeader}
                onPress={() => toggleCard(employee.employeeId)}
                activeOpacity={0.7}
              >
                <View>
                    <Text style={styles.employeeName}>{employee.employeeName}</Text>
                    <Text style={styles.employeePayout}>
                    {employee.remainingAmount.toFixed(2)} ₽
                    </Text>
                </View>
                {isExpanded ? (
                    <ChevronUp size={20} color="#6B7280" />
                ) : (
                    <ChevronDown size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
              {isExpanded && (
              <View style={styles.employeeDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Отработано часов:</Text>
                  <Text style={styles.detailValue}>
                    {employee.hoursWorked.toFixed(1)} ч
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Ставка:</Text>
                  <Text style={styles.detailValue}>
                    {employee.hourlyRate} ₽/ч
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>KPI коэффициент:</Text>
                  <Text style={styles.detailValue}>
                    {employee.kpiCoefficient.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Базовая сумма:</Text>
                  <Text style={styles.detailValue}>
                    {employee.baseAmount.toFixed(2)} ₽
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>С учетом KPI:</Text>
                  <Text style={styles.detailValue}>
                    {employee.adjustedAmount.toFixed(2)} ₽
                  </Text>
                </View>
                {employee.bonuses > 0 && (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: "#10B981" }]}>
                      Премии:
                    </Text>
                    <Text style={[styles.detailValue, { color: "#10B981" }]}>
                      +{employee.bonuses.toFixed(2)} ₽
                    </Text>
                  </View>
                )}
                {employee.penalties > 0 && (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: "#EF4444" }]}>
                      Штрафы:
                    </Text>
                    <Text style={[styles.detailValue, { color: "#EF4444" }]}>
                      -{employee.penalties.toFixed(2)} ₽
                    </Text>
                  </View>
                )}
                {employee.shortages > 0 && (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: "#EF4444" }]}>
                      Недостачи:
                    </Text>
                    <Text style={[styles.detailValue, { color: "#EF4444" }]}>
                      -{employee.shortages.toFixed(2)} ₽
                    </Text>
                  </View>
                )}
                {employee.advances > 0 && (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: "#F59E0B" }]}>
                      Авансы:
                    </Text>
                    <Text style={[styles.detailValue, { color: "#F59E0B" }]}>
                      -{employee.advances.toFixed(2)} ₽
                    </Text>
                  </View>
                )}
              </View>
              )}
            </View>
          )})}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#111827",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  periodSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#111827",
    marginBottom: 12,
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
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
  },
  dateInput: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500" as const,
  },
  periodSeparator: {
    fontSize: 16,
    color: "#6B7280",
  },
  summarySection: {
    marginBottom: 24,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  summaryCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  summaryIconContainer: {
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#111827",
  },
  employeesSection: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  viewOnlyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F5F3FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  viewOnlyText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#8B5CF6",
  },
  employeeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  employeeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  employeeName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#111827",
  },
  employeePayout: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#2563EB",
  },
  employeeDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#111827",
  },
});
