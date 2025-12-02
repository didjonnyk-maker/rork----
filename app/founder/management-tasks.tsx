import { Stack } from "expo-router";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
} from "lucide-react-native";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "@/providers/AppProvider";
import { Task } from "@/types";

export default function FounderManagementTasksScreen() {
  const { tasks, users } = useApp();

  const managementTasks = tasks.filter((t) => {
    const user = users.find((u) => u.id === t.assignedTo || u.id === t.takenBy);
    return user && (user.role === "Директор" || user.role === "Администратор");
  });

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "Новое":
      case "Доступно":
        return "#3B82F6";
      case "В работе":
        return "#F59E0B";
      case "Выполнено":
      case "На модерации":
        return "#8B5CF6";
      case "Проверено":
        return "#10B981";
      case "Возвращено":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getStatusIcon = (status: Task["status"]) => {
    const color = getStatusColor(status);
    switch (status) {
      case "Проверено":
        return <CheckCircle2 size={20} color={color} strokeWidth={2} />;
      case "В работе":
        return <Clock size={20} color={color} strokeWidth={2} />;
      case "Возвращено":
        return <AlertCircle size={20} color={color} strokeWidth={2} />;
      default:
        return <Clock size={20} color={color} strokeWidth={2} />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const stats = {
    total: managementTasks.length,
    inProgress: managementTasks.filter((t) => t.status === "В работе").length,
    completed: managementTasks.filter((t) => t.status === "Проверено").length,
    pending: managementTasks.filter(
      (t) => t.status === "Новое" || t.status === "Доступно"
    ).length,
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: "Задачи для руководства",
        }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Всего</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: "#F59E0B" }]}>
              {stats.inProgress}
            </Text>
            <Text style={styles.statLabel}>В работе</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: "#10B981" }]}>
              {stats.completed}
            </Text>
            <Text style={styles.statLabel}>Завершено</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: "#3B82F6" }]}>
              {stats.pending}
            </Text>
            <Text style={styles.statLabel}>Ожидают</Text>
          </View>
        </View>

        <View style={styles.tasksSection}>
          <Text style={styles.sectionTitle}>Список задач</Text>
          {managementTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Eye size={48} color="#D1D5DB" strokeWidth={2} />
              <Text style={styles.emptyText}>Задачи для руководства отсутствуют</Text>
            </View>
          ) : (
            managementTasks.map((task) => {
              const assignee = users.find(
                (u) => u.id === (task.takenBy || task.assignedTo)
              );
              return (
                <View key={task.id} style={styles.taskCard}>
                  <View style={styles.taskHeader}>
                    <View style={styles.taskTitleContainer}>
                      <Text style={styles.taskTitle}>{task.title}</Text>
                      {assignee && (
                        <Text style={styles.taskAssignee}>
                          {assignee.name} • {assignee.role}
                        </Text>
                      )}
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: `${getStatusColor(task.status)}15` },
                      ]}
                    >
                      {getStatusIcon(task.status)}
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(task.status) },
                        ]}
                      >
                        {task.status}
                      </Text>
                    </View>
                  </View>

                  {task.description && (
                    <Text style={styles.taskDescription}>{task.description}</Text>
                  )}

                  <View style={styles.taskFooter}>
                    <Text style={styles.taskDate}>
                      Создано: {formatDate(task.createdAt)}
                    </Text>
                    {task.completedAt && (
                      <Text style={styles.taskDate}>
                        Завершено: {formatDate(task.completedAt)}
                      </Text>
                    )}
                  </View>

                  {task.resultText && (
                    <View style={styles.resultContainer}>
                      <Text style={styles.resultLabel}>Результат:</Text>
                      <Text style={styles.resultText}>{task.resultText}</Text>
                    </View>
                  )}

                  {task.rating && (
                    <View style={styles.ratingContainer}>
                      <Text style={styles.ratingLabel}>Оценка:</Text>
                      <View style={styles.stars}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Text
                            key={star}
                            style={[
                              styles.star,
                              star <= task.rating! && styles.starFilled,
                            ]}
                          >
                            ★
                          </Text>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              );
            })
          )}
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
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#111827",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  tasksSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#111827",
    marginBottom: 12,
  },
  taskCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  taskTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#111827",
    marginBottom: 4,
  },
  taskAssignee: {
    fontSize: 13,
    color: "#6B7280",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  taskDescription: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 12,
    lineHeight: 20,
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  taskDate: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  resultContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#6B7280",
    marginBottom: 4,
  },
  resultText: {
    fontSize: 14,
    color: "#111827",
    lineHeight: 20,
  },
  ratingContainer: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ratingLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#6B7280",
  },
  stars: {
    flexDirection: "row",
    gap: 2,
  },
  star: {
    fontSize: 16,
    color: "#D1D5DB",
  },
  starFilled: {
    color: "#F59E0B",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#9CA3AF",
    marginTop: 16,
    textAlign: "center",
  },
});
