import {
  Award,
  BarChart3,
  BookOpen,
  CheckSquare,
  Clock,
  Target,
  User as UserIcon,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "@/providers/AppProvider";
import { EMPLOYEE_POSITIONS, EmployeeKPI } from "@/types";

export default function KPIScreen() {
  const {
    users,
    updateEmployeeKPI,
    getEmployeeKPI,
    calculateKPICoefficient,
    currentUser,
  } = useApp();

  const [selectedTab, setSelectedTab] = useState<"employees">("employees");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const employees = useMemo(
    () => users.filter((u) => EMPLOYEE_POSITIONS.includes(u.position as typeof EMPLOYEE_POSITIONS[number])),
    [users]
  );

  const isDirector = currentUser?.role === "Директор";

  const handleUpdateEmployeeKPI = (employeeId: string, field: keyof EmployeeKPI, value: number) => {
    const currentKPI = getEmployeeKPI(employeeId) || {
      employeeId,
      discipline: 100,
      cashAccuracy: 100,
      noComplaints: 100,
      training: 100,
      tasksCompletion: 100,
      coefficient: 1.0,
    };

    const updatedKPI = { ...currentKPI, [field]: Math.min(100, Math.max(0, value)) };
    const coefficient = calculateKPICoefficient(updatedKPI);
    updateEmployeeKPI(employeeId, { ...updatedKPI, coefficient });
  };

  const renderEmployeeKPICard = (employeeId: string) => {
    const employee = employees.find((e) => e.id === employeeId);
    const kpi = getEmployeeKPI(employeeId) || {
      employeeId,
      discipline: 100,
      cashAccuracy: 100,
      noComplaints: 100,
      training: 100,
      tasksCompletion: 100,
      coefficient: 1.0,
    };

    const coefficient = calculateKPICoefficient(kpi);
    const isSelected = selectedEmployeeId === employeeId;

    return (
      <View key={employeeId} style={styles.employeeCard}>
        <TouchableOpacity
          style={styles.employeeHeader}
          onPress={() => setSelectedEmployeeId(isSelected ? null : employeeId)}
        >
          <View style={styles.employeeInfo}>
            <UserIcon size={18} color="#2563EB" strokeWidth={2} />
            <Text style={styles.employeeName}>{employee?.name}</Text>
            <Text style={styles.employeePosition}>{employee?.position}</Text>
          </View>
          <View style={[styles.coefficientBadge, { backgroundColor: coefficient >= 1 ? "#DCFCE7" : "#FEE2E2" }]}>
            <Text style={[styles.coefficientText, { color: coefficient >= 1 ? "#15803D" : "#DC2626" }]}>
              ×{coefficient.toFixed(2)}
            </Text>
          </View>
        </TouchableOpacity>

        {isSelected && (
          <View style={styles.kpiDetails}>
            <View style={styles.kpiRow}>
              <View style={styles.kpiLabelRow}>
                <Clock size={14} color="#6B7280" strokeWidth={2} />
                <Text style={styles.kpiLabel}>Дисциплина</Text>
              </View>
              <View style={styles.kpiInputRow}>
                <TouchableOpacity
                  style={styles.kpiButton}
                  onPress={() => handleUpdateEmployeeKPI(employeeId, "discipline", kpi.discipline - 5)}
                  disabled={!isDirector}
                >
                  <Text style={styles.kpiButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.kpiValue}>{kpi.discipline}%</Text>
                <TouchableOpacity
                  style={styles.kpiButton}
                  onPress={() => handleUpdateEmployeeKPI(employeeId, "discipline", kpi.discipline + 5)}
                  disabled={!isDirector}
                >
                  <Text style={styles.kpiButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.kpiRow}>
              <View style={styles.kpiLabelRow}>
                <Target size={14} color="#6B7280" strokeWidth={2} />
                <Text style={styles.kpiLabel}>Точность кассы</Text>
              </View>
              <View style={styles.kpiInputRow}>
                <TouchableOpacity
                  style={styles.kpiButton}
                  onPress={() => handleUpdateEmployeeKPI(employeeId, "cashAccuracy", kpi.cashAccuracy - 5)}
                  disabled={!isDirector}
                >
                  <Text style={styles.kpiButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.kpiValue}>{kpi.cashAccuracy}%</Text>
                <TouchableOpacity
                  style={styles.kpiButton}
                  onPress={() => handleUpdateEmployeeKPI(employeeId, "cashAccuracy", kpi.cashAccuracy + 5)}
                  disabled={!isDirector}
                >
                  <Text style={styles.kpiButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.kpiRow}>
              <View style={styles.kpiLabelRow}>
                <Award size={14} color="#6B7280" strokeWidth={2} />
                <Text style={styles.kpiLabel}>Без замечаний</Text>
              </View>
              <View style={styles.kpiInputRow}>
                <TouchableOpacity
                  style={styles.kpiButton}
                  onPress={() => handleUpdateEmployeeKPI(employeeId, "noComplaints", kpi.noComplaints - 5)}
                  disabled={!isDirector}
                >
                  <Text style={styles.kpiButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.kpiValue}>{kpi.noComplaints}%</Text>
                <TouchableOpacity
                  style={styles.kpiButton}
                  onPress={() => handleUpdateEmployeeKPI(employeeId, "noComplaints", kpi.noComplaints + 5)}
                  disabled={!isDirector}
                >
                  <Text style={styles.kpiButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.kpiRow}>
              <View style={styles.kpiLabelRow}>
                <BookOpen size={14} color="#6B7280" strokeWidth={2} />
                <Text style={styles.kpiLabel}>Обучение</Text>
              </View>
              <View style={styles.kpiInputRow}>
                <TouchableOpacity
                  style={styles.kpiButton}
                  onPress={() => handleUpdateEmployeeKPI(employeeId, "training", kpi.training - 5)}
                  disabled={!isDirector}
                >
                  <Text style={styles.kpiButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.kpiValue}>{kpi.training}%</Text>
                <TouchableOpacity
                  style={styles.kpiButton}
                  onPress={() => handleUpdateEmployeeKPI(employeeId, "training", kpi.training + 5)}
                  disabled={!isDirector}
                >
                  <Text style={styles.kpiButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.kpiRow}>
              <View style={styles.kpiLabelRow}>
                <CheckSquare size={14} color="#6B7280" strokeWidth={2} />
                <Text style={styles.kpiLabel}>Выполнение заданий</Text>
              </View>
              <View style={styles.kpiInputRow}>
                <TouchableOpacity
                  style={styles.kpiButton}
                  onPress={() => handleUpdateEmployeeKPI(employeeId, "tasksCompletion", kpi.tasksCompletion - 5)}
                  disabled={!isDirector}
                >
                  <Text style={styles.kpiButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.kpiValue}>{kpi.tasksCompletion}%</Text>
                <TouchableOpacity
                  style={styles.kpiButton}
                  onPress={() => handleUpdateEmployeeKPI(employeeId, "tasksCompletion", kpi.tasksCompletion + 5)}
                  disabled={!isDirector}
                >
                  <Text style={styles.kpiButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.kpiSummary}>
              <Text style={styles.kpiSummaryLabel}>Итоговый коэффициент:</Text>
              <Text style={[styles.kpiSummaryValue, { color: coefficient >= 1 ? "#15803D" : "#DC2626" }]}>
                ×{coefficient.toFixed(2)}
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "employees" && styles.tabActive]}
          onPress={() => setSelectedTab("employees")}
        >
          <BarChart3 size={18} color={selectedTab === "employees" ? "#FFFFFF" : "#6B7280"} strokeWidth={2} />
          <Text style={[styles.tabText, selectedTab === "employees" && styles.tabTextActive]}>
            Сотрудники
          </Text>
        </TouchableOpacity>
      </View>

      {selectedTab === "employees" && (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {!isDirector && (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Редактирование KPI доступно только директору
              </Text>
            </View>
          )}

          {employees.map((emp) => renderEmployeeKPICard(emp.id))}

          {employees.length === 0 && (
            <View style={styles.emptyState}>
              <UserIcon size={48} color="#D1D5DB" strokeWidth={1.5} />
              <Text style={styles.emptyTitle}>Нет сотрудников</Text>
              <Text style={styles.emptyText}>Добавьте сотрудников для управления KPI</Text>
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
  infoBox: {
    backgroundColor: "#FEF3C7",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  infoText: {
    fontSize: 13,
    color: "#92400E",
    textAlign: "center" as const,
  },
  employeeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden" as const,
  },
  employeeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  employeeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  employeeName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#111827",
  },
  employeePosition: {
    fontSize: 12,
    color: "#6B7280",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  coefficientBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  coefficientText: {
    fontSize: 14,
    fontWeight: "700" as const,
  },
  kpiDetails: {
    padding: 14,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    gap: 12,
  },
  kpiRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  kpiLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  kpiLabel: {
    fontSize: 13,
    color: "#374151",
  },
  kpiInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  kpiButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  kpiButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#374151",
  },
  kpiValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#111827",
    minWidth: 45,
    textAlign: "center" as const,
  },
  kpiSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  kpiSummaryLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#111827",
  },
  kpiSummaryValue: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  settingsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#111827",
    marginBottom: 4,
  },
  settingsSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 20,
  },
  settingItem: {
    marginBottom: 20,
  },
  settingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  settingLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#374151",
  },
  settingValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#2563EB",
  },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sliderButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  sliderButtonText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#2563EB",
  },
  sliderTrack: {
    flex: 1,
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden" as const,
  },
  sliderFill: {
    height: "100%",
    backgroundColor: "#2563EB",
    borderRadius: 4,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#111827",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2563EB",
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFFFFF",
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
