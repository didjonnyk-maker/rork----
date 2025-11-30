import {
  CheckCircle,
  Circle,
  Clock,
  Eye,
  Hand,
  RefreshCcw,
  Star,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
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
import { Task, TaskStatus } from "@/types";



const STATUS_CONFIG: Record<TaskStatus, { color: string; bgColor: string; icon: React.ReactNode }> = {
  "Новое": { color: "#6B7280", bgColor: "#F3F4F6", icon: <Circle size={14} color="#6B7280" strokeWidth={2} /> },
  "Доступно": { color: "#8B5CF6", bgColor: "#EDE9FE", icon: <Circle size={14} color="#8B5CF6" strokeWidth={2} /> },
  "В работе": { color: "#2563EB", bgColor: "#DBEAFE", icon: <Clock size={14} color="#2563EB" strokeWidth={2} /> },
  "Выполнено": { color: "#F59E0B", bgColor: "#FEF3C7", icon: <CheckCircle size={14} color="#F59E0B" strokeWidth={2} /> },
  "На модерации": { color: "#7C3AED", bgColor: "#EDE9FE", icon: <Eye size={14} color="#7C3AED" strokeWidth={2} /> },
  "Проверено": { color: "#15803D", bgColor: "#DCFCE7", icon: <CheckCircle size={14} color="#15803D" strokeWidth={2} /> },
  "Возвращено": { color: "#DC2626", bgColor: "#FEE2E2", icon: <RefreshCcw size={14} color="#DC2626" strokeWidth={2} /> },
};

export default function EmployeeTasksScreen() {
  const {
    currentUser,
    takeTask,
    completeTask,
    getAvailableTasks,
    getTasksForEmployee,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"available" | "my">("available");

  const availableTasks = useMemo(() => getAvailableTasks(), [getAvailableTasks]);

  const myTasks = useMemo(() => {
    if (!currentUser) return [];
    return getTasksForEmployee(currentUser.id);
  }, [currentUser, getTasksForEmployee]);

  const inProgressCount = useMemo(
    () => myTasks.filter((t) => t.status === "В работе" || t.status === "Возвращено").length,
    [myTasks]
  );

  const handleTakeTask = (taskId: string) => {
    if (!currentUser) return;
    takeTask(taskId, currentUser.id);
    const msg = "Задание взято в работу!";
    if (Platform.OS === "web") {
      alert(msg);
    } else {
      Alert.alert("Успешно", msg);
    }
  };

  const handleCompleteTask = (taskId: string) => {
    completeTask(taskId);
    const msg = "Задание отправлено на проверку!";
    if (Platform.OS === "web") {
      alert(msg);
    } else {
      Alert.alert("Успешно", msg);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderTaskCard = (task: Task) => {
    const config = STATUS_CONFIG[task.status];
    const isAvailable = task.status === "Доступно";
    const isInProgress = task.status === "В работе" || task.status === "Возвращено";
    const isMyTask = task.takenBy === currentUser?.id;

    return (
      <View
        key={task.id}
        style={[
          styles.taskCard,
          task.status === "Возвращено" && styles.taskCardReturned,
        ]}
      >
        <View style={styles.taskHeader}>
          <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
            {config.icon}
            <Text style={[styles.statusText, { color: config.color }]}>
              {task.status}
            </Text>
          </View>
          <Text style={styles.taskDate}>{formatDate(task.createdAt)}</Text>
        </View>

        <Text style={styles.taskTitle}>{task.title}</Text>
        {task.description && (
          <Text style={styles.taskDescription}>{task.description}</Text>
        )}

        {task.rating && (
          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>Оценка:</Text>
            {[1, 2].map((star) => (
              <Star
                key={star}
                size={16}
                color={star <= task.rating! ? "#F59E0B" : "#D1D5DB"}
                fill={star <= task.rating! ? "#F59E0B" : "transparent"}
                strokeWidth={2}
              />
            ))}
          </View>
        )}

        {isAvailable && (
          <TouchableOpacity
            style={styles.takeButton}
            onPress={() => handleTakeTask(task.id)}
          >
            <Hand size={18} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.takeButtonText}>Взять задание</Text>
          </TouchableOpacity>
        )}

        {isInProgress && isMyTask && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => handleCompleteTask(task.id)}
          >
            <CheckCircle size={18} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.completeButtonText}>Выполнено</Text>
          </TouchableOpacity>
        )}

        {task.status === "Возвращено" && (
          <View style={styles.returnedNote}>
            <RefreshCcw size={14} color="#DC2626" strokeWidth={2} />
            <Text style={styles.returnedNoteText}>
              Задание возвращено на доработку
            </Text>
          </View>
        )}
      </View>
    );
  };

  const displayedTasks = activeTab === "available" ? availableTasks : myTasks;

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Задания</Text>
        {inProgressCount > 0 && (
          <View style={styles.inProgressBadge}>
            <Text style={styles.inProgressBadgeText}>
              {inProgressCount} в работе
            </Text>
          </View>
        )}
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "available" && styles.tabActive]}
          onPress={() => setActiveTab("available")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "available" && styles.tabTextActive,
            ]}
          >
            Доступные ({availableTasks.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "my" && styles.tabActive]}
          onPress={() => setActiveTab("my")}
        >
          <Text
            style={[styles.tabText, activeTab === "my" && styles.tabTextActive]}
          >
            Мои задания ({myTasks.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {displayedTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <CheckCircle size={48} color="#D1D5DB" strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>
              {activeTab === "available"
                ? "Нет доступных заданий"
                : "Нет заданий"}
            </Text>
            <Text style={styles.emptyText}>
              {activeTab === "available"
                ? "Все задания уже распределены"
                : "Возьмите задание из доступных"}
            </Text>
          </View>
        ) : (
          displayedTasks.map((task) => renderTaskCard(task))
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#111827",
  },
  inProgressBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  inProgressBadgeText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#1E40AF",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
  },
  tabActive: {
    backgroundColor: "#2563EB",
  },
  tabText: {
    fontSize: 14,
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
  taskCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  taskCardReturned: {
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  taskDate: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#111827",
    marginBottom: 6,
  },
  taskDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  ratingLabel: {
    fontSize: 13,
    color: "#6B7280",
  },
  takeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#8B5CF6",
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 4,
  },
  takeButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#15803D",
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 4,
  },
  completeButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  returnedNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  returnedNoteText: {
    fontSize: 13,
    color: "#DC2626",
    fontWeight: "500" as const,
  },
});
