import {
  BookOpen,
  Check,
  CheckCircle,
  ChevronRight,
  Circle,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "@/providers/AppProvider";

export default function TrainingScreen() {
  const {
    currentUser,
    trainingMaterials,
    markTrainingComplete,
    isTrainingComplete,
    getEmployeeTrainingStatus,
  } = useApp();

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const trainingStatus = useMemo(() => {
    if (!currentUser) return { completed: 0, total: 0, percentage: 0 };
    return getEmployeeTrainingStatus(currentUser.id);
  }, [currentUser, getEmployeeTrainingStatus]);

  const materialsByCategory = useMemo(() => {
    const grouped: Record<string, typeof trainingMaterials> = {};
    trainingMaterials.forEach((material) => {
      if (!grouped[material.category]) {
        grouped[material.category] = [];
      }
      grouped[material.category].push(material);
    });
    return grouped;
  }, [trainingMaterials]);

  const handleMarkComplete = (materialId: string) => {
    if (!currentUser) return;
    markTrainingComplete(currentUser.id, materialId);
    const msg = "Материал отмечен как изученный!";
    if (Platform.OS === "web") {
      alert(msg);
    } else {
      Alert.alert("Успешно", msg);
    }
  };

  const isMaterialComplete = (materialId: string) => {
    if (!currentUser) return false;
    return isTrainingComplete(currentUser.id, materialId);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "#15803D";
    if (percentage >= 50) return "#F59E0B";
    return "#DC2626";
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <BookOpen size={24} color="#2563EB" strokeWidth={2} />
          <Text style={styles.headerTitle}>Обучение</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          Ознакомьтесь с материалами для работы
        </Text>
      </View>

      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Ваш прогресс</Text>
          <Text
            style={[
              styles.progressPercent,
              { color: getProgressColor(trainingStatus.percentage) },
            ]}
          >
            {Math.round(trainingStatus.percentage)}%
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${trainingStatus.percentage}%`,
                backgroundColor: getProgressColor(trainingStatus.percentage),
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {trainingStatus.completed} из {trainingStatus.total} материалов изучено
        </Text>
        {trainingStatus.percentage >= 100 && (
          <View style={styles.completedBadge}>
            <CheckCircle size={16} color="#15803D" strokeWidth={2} />
            <Text style={styles.completedBadgeText}>Обучение завершено!</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {trainingMaterials.length === 0 ? (
          <View style={styles.emptyState}>
            <BookOpen size={48} color="#D1D5DB" strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>Нет материалов</Text>
            <Text style={styles.emptyText}>
              Материалы для обучения пока не добавлены
            </Text>
          </View>
        ) : (
          Object.entries(materialsByCategory).map(([category, materials]) => (
            <View key={category} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{category}</Text>
              {materials.map((material) => {
                const isComplete = isMaterialComplete(material.id);
                const isExpanded = expandedId === material.id;

                return (
                  <View
                    key={material.id}
                    style={[
                      styles.materialCard,
                      isComplete && styles.materialCardComplete,
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.materialHeader}
                      onPress={() =>
                        setExpandedId(isExpanded ? null : material.id)
                      }
                    >
                      <View style={styles.materialStatus}>
                        {isComplete ? (
                          <CheckCircle
                            size={20}
                            color="#15803D"
                            strokeWidth={2}
                          />
                        ) : (
                          <Circle size={20} color="#9CA3AF" strokeWidth={2} />
                        )}
                      </View>
                      <View style={styles.materialInfo}>
                        <Text
                          style={[
                            styles.materialTitle,
                            isComplete && styles.materialTitleComplete,
                          ]}
                        >
                          {material.title}
                        </Text>
                        <Text style={styles.materialVersion}>
                          Версия {material.version}
                        </Text>
                      </View>
                      <ChevronRight
                        size={20}
                        color="#9CA3AF"
                        strokeWidth={2}
                        style={{
                          transform: [
                            { rotate: isExpanded ? "90deg" : "0deg" },
                          ],
                        }}
                      />
                    </TouchableOpacity>

                    {isExpanded && (
                      <View style={styles.materialContent}>
                        <Text style={styles.materialText}>
                          {material.content}
                        </Text>
                        {!isComplete ? (
                          <TouchableOpacity
                            style={styles.completeButton}
                            onPress={() => handleMarkComplete(material.id)}
                          >
                            <Check size={18} color="#FFFFFF" strokeWidth={2} />
                            <Text style={styles.completeButtonText}>
                              Отметить как изученное
                            </Text>
                          </TouchableOpacity>
                        ) : (
                          <View style={styles.completedStatus}>
                            <CheckCircle
                              size={16}
                              color="#15803D"
                              strokeWidth={2}
                            />
                            <Text style={styles.completedStatusText}>
                              Вы ознакомились с этим материалом
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  progressCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#111827",
  },
  progressPercent: {
    fontSize: 20,
    fontWeight: "700" as const,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 8,
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  completedBadgeText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#15803D",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 32,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
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
  categorySection: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#6B7280",
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  materialCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  materialCardComplete: {
    borderColor: "#86EFAC",
    backgroundColor: "#F0FDF4",
  },
  materialHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  materialStatus: {
    width: 24,
    alignItems: "center",
  },
  materialInfo: {
    flex: 1,
  },
  materialTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#111827",
  },
  materialTitleComplete: {
    color: "#15803D",
  },
  materialVersion: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  materialContent: {
    padding: 14,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  materialText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 22,
    marginBottom: 16,
  },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 10,
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  completedStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  completedStatusText: {
    fontSize: 13,
    color: "#15803D",
    fontWeight: "500" as const,
  },
});
