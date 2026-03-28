import { Stack } from "expo-router";
import {
  Eye,
  TrendingUp,
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
import { useApp } from "@/providers/AppProvider";
import { EMPLOYEE_POSITIONS } from "@/types";

export default function FounderKPIScreen() {
  const { users, employeeKPIs, calculateKPICoefficient } = useApp();
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleCard = (employeeId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(employeeId)) {
      newExpanded.delete(employeeId);
    } else {
      newExpanded.add(employeeId);
    }
    setExpandedCards(newExpanded);
  };

  const employees = useMemo(
    () =>
      users.filter((u) =>
        EMPLOYEE_POSITIONS.includes(
          u.position as (typeof EMPLOYEE_POSITIONS)[number]
        )
      ),
    [users]
  );

  const employeeData = useMemo(() => {
    return employees
      .map((employee) => {
        const kpi = employeeKPIs.find((k) => k.employeeId === employee.id);
        const coefficient = kpi ? calculateKPICoefficient(kpi) : 1.0;
        return {
          ...employee,
          kpi: kpi || {
            employeeId: employee.id,
            discipline: 100,
            cashAccuracy: 100,
            noComplaints: 100,
            training: 100,
            tasksCompletion: 100,
            coefficient: 1.0,
          },
          coefficient,
        };
      })
      .sort((a, b) => b.coefficient - a.coefficient);
  }, [employees, employeeKPIs, calculateKPICoefficient]);

  const getKPIColor = (value: number) => {
    if (value >= 90) return "#10B981";
    if (value >= 70) return "#F59E0B";
    return "#EF4444";
  };

  const getCoefficientColor = (coefficient: number) => {
    if (coefficient >= 1.2) return "#10B981";
    if (coefficient >= 1.0) return "#3B82F6";
    if (coefficient >= 0.8) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen options={{ title: "KPI сотрудников" }} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>KPI сотрудников</Text>
          <View style={styles.viewOnlyBadge}>
            <Eye size={14} color="#8B5CF6" strokeWidth={2} />
            <Text style={styles.viewOnlyText}>Только просмотр</Text>
          </View>
        </View>



        <View style={styles.employeesSection}>
          <Text style={styles.sectionTitle}>
            Рейтинг сотрудников ({employeeData.length})
          </Text>
          {employeeData.map((employee, index) => {
            const isExpanded = expandedCards.has(employee.id);
            return (
              <TouchableOpacity
                key={employee.id}
                style={styles.employeeCard}
                onPress={() => toggleCard(employee.id)}
                activeOpacity={0.7}
              >
                <View style={styles.employeeHeader}>
                  <View style={styles.employeeInfo}>
                    <View style={styles.rankBadge}>
                      <Text style={styles.rankText}>#{index + 1}</Text>
                    </View>
                    <View style={styles.employeeDetails}>
                      <Text style={styles.employeeName}>{employee.name}</Text>
                      <Text style={styles.employeePosition}>
                        {employee.position}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.coefficientBadge}>
                    <TrendingUp
                      size={16}
                      color={getCoefficientColor(employee.coefficient)}
                      strokeWidth={2}
                    />
                    <Text
                      style={[
                        styles.coefficientText,
                        { color: getCoefficientColor(employee.coefficient) },
                      ]}
                    >
                      {employee.coefficient.toFixed(2)}
                    </Text>
                  </View>
                  {isExpanded ? (
                    <ChevronUp size={20} color="#9CA3AF" strokeWidth={2} />
                  ) : (
                    <ChevronDown size={20} color="#9CA3AF" strokeWidth={2} />
                  )}
                </View>

                {isExpanded && (
                  <View style={styles.kpiDetails}>
                    <View style={styles.kpiItem}>
                      <Text style={styles.kpiLabel}>Дисциплина</Text>
                      <View style={styles.kpiBar}>
                        <View
                          style={[
                            styles.kpiBarFill,
                            {
                              width: `${employee.kpi.discipline}%`,
                              backgroundColor: getKPIColor(
                                employee.kpi.discipline
                              ),
                            },
                          ]}
                        />
                      </View>
                      <Text
                        style={[
                          styles.kpiValue,
                          { color: getKPIColor(employee.kpi.discipline) },
                        ]}
                      >
                        {employee.kpi.discipline}%
                      </Text>
                    </View>

                    <View style={styles.kpiItem}>
                      <Text style={styles.kpiLabel}>Точность кассы</Text>
                      <View style={styles.kpiBar}>
                        <View
                          style={[
                            styles.kpiBarFill,
                            {
                              width: `${employee.kpi.cashAccuracy}%`,
                              backgroundColor: getKPIColor(
                                employee.kpi.cashAccuracy
                              ),
                            },
                          ]}
                        />
                      </View>
                      <Text
                        style={[
                          styles.kpiValue,
                          { color: getKPIColor(employee.kpi.cashAccuracy) },
                        ]}
                      >
                        {employee.kpi.cashAccuracy}%
                      </Text>
                    </View>

                    <View style={styles.kpiItem}>
                      <Text style={styles.kpiLabel}>Без жалоб</Text>
                      <View style={styles.kpiBar}>
                        <View
                          style={[
                            styles.kpiBarFill,
                            {
                              width: `${employee.kpi.noComplaints}%`,
                              backgroundColor: getKPIColor(
                                employee.kpi.noComplaints
                              ),
                            },
                          ]}
                        />
                      </View>
                      <Text
                        style={[
                          styles.kpiValue,
                          { color: getKPIColor(employee.kpi.noComplaints) },
                        ]}
                      >
                        {employee.kpi.noComplaints}%
                      </Text>
                    </View>

                    <View style={styles.kpiItem}>
                      <Text style={styles.kpiLabel}>Обучение</Text>
                      <View style={styles.kpiBar}>
                        <View
                          style={[
                            styles.kpiBarFill,
                            {
                              width: `${employee.kpi.training}%`,
                              backgroundColor: getKPIColor(
                                employee.kpi.training
                              ),
                            },
                          ]}
                        />
                      </View>
                      <Text
                        style={[
                          styles.kpiValue,
                          { color: getKPIColor(employee.kpi.training) },
                        ]}
                      >
                        {employee.kpi.training}%
                      </Text>
                    </View>

                    <View style={styles.kpiItem}>
                      <Text style={styles.kpiLabel}>Задачи</Text>
                      <View style={styles.kpiBar}>
                        <View
                          style={[
                            styles.kpiBarFill,
                            {
                              width: `${employee.kpi.tasksCompletion}%`,
                              backgroundColor: getKPIColor(
                                employee.kpi.tasksCompletion
                              ),
                            },
                          ]}
                        />
                      </View>
                      <Text
                        style={[
                          styles.kpiValue,
                          { color: getKPIColor(employee.kpi.tasksCompletion) },
                        ]}
                      >
                        {employee.kpi.tasksCompletion}%
                      </Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#111827",
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
  weightsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  weightsTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#111827",
    marginBottom: 12,
  },
  weightsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  weightItem: {
    flex: 1,
    minWidth: "30%",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  weightLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
    textAlign: "center",
  },
  weightValue: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#2563EB",
  },
  employeesSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#111827",
    marginBottom: 12,
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
    alignItems: "center",
    gap: 12,
  },
  employeeInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  rankText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#2563EB",
  },
  employeeDetails: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#111827",
    marginBottom: 2,
  },
  employeePosition: {
    fontSize: 13,
    color: "#6B7280",
  },
  coefficientBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  coefficientText: {
    fontSize: 16,
    fontWeight: "700" as const,
  },
  kpiDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    gap: 12,
  },
  kpiItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  kpiLabel: {
    width: 100,
    fontSize: 13,
    color: "#6B7280",
  },
  kpiBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    overflow: "hidden",
  },
  kpiBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  kpiValue: {
    width: 50,
    textAlign: "right",
    fontSize: 13,
    fontWeight: "600" as const,
  },
});
