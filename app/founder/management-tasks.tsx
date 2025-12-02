import { Stack } from "expo-router";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Plus,
  XCircle,
  Send,
  RefreshCcw,
  Check,
} from "lucide-react-native";
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
import { Task } from "@/types";
import { useState } from "react";

export default function FounderManagementTasksScreen() {
  const { tasks, users, addTask, updateTask, currentUser } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [returnComment, setReturnComment] = useState("");
  const [returningTaskId, setReturningTaskId] = useState<string | null>(null);

  const managementUsers = users.filter((u) => u.role === "Директор" || u.role === "Администратор");

  const managementTasks = tasks.filter((t) => {
    const user = users.find((u) => u.id === t.assignedTo || u.id === t.takenBy);
    return user && (user.role === "Директор" || user.role === "Администратор");
  });

  const handleConfirmTask = (taskId: string) => {
      updateTask(taskId, { status: "Проверено", verifiedBy: currentUser?.id, verifiedAt: new Date().toISOString() });
      const msg = "Задание подтверждено";
      if (Platform.OS === "web") {
        alert(msg);
      } else {
        Alert.alert("Успешно", msg);
      }
  };

  const handleReturnTask = (taskId: string) => {
      if (!returnComment.trim()) {
        const msg = "Укажите причину возврата";
        if (Platform.OS === "web") {
          alert(msg);
        } else {
          Alert.alert("Ошибка", msg);
        }
        return;
      }
      updateTask(taskId, { status: "Возвращено", returnComment: returnComment.trim() });
      setReturningTaskId(null);
      setReturnComment("");
      const msg = "Задание возвращено на доработку";
      if (Platform.OS === "web") {
        alert(msg);
      } else {
        Alert.alert("Успешно", msg);
      }
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) {
      const msg = "Заполните название задания";
      if (Platform.OS === "web") {
        alert(msg);
      } else {
        Alert.alert("Ошибка", msg);
      }
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      marketId: "danek",
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim() || undefined,
      assignedTo: newTaskAssignee || undefined,
      createdBy: currentUser?.id || "",
      status: newTaskAssignee ? "Новое" : "Доступно",
      createdAt: new Date().toISOString(),
    };

    addTask(task);
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskAssignee("");
    setShowAddForm(false);

    const successMsg = "Задание создано!";
    if (Platform.OS === "web") {
      alert(successMsg);
    } else {
      Alert.alert("Успешно", successMsg);
    }
  };

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
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Задачи для руководства</Text>
        </View>

        <TouchableOpacity
          style={styles.addTaskButton}
          onPress={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? (
            <XCircle size={18} color="#FFFFFF" strokeWidth={2} />
          ) : (
            <Plus size={18} color="#FFFFFF" strokeWidth={2} />
          )}
          <Text style={styles.addTaskButtonText}>
            {showAddForm ? "Отмена" : "Создать задание"}
          </Text>
        </TouchableOpacity>
      </View>

      {showAddForm && (
        <View style={styles.addFormContainer}>
          <View style={styles.addForm}>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Название</Text>
              <TextInput
                style={styles.formInput}
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
                placeholder="Введите название задания"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Описание (опционально)</Text>
              <TextInput
                style={[styles.formInput, styles.formTextarea]}
                value={newTaskDescription}
                onChangeText={setNewTaskDescription}
                placeholder="Введите описание задания"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Назначить</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.assigneeChips}>
                  <TouchableOpacity
                    style={[
                      styles.assigneeChip,
                      !newTaskAssignee && styles.assigneeChipActive,
                    ]}
                    onPress={() => setNewTaskAssignee("")}
                  >
                    <Text
                      style={[
                        styles.assigneeChipText,
                        !newTaskAssignee && styles.assigneeChipTextActive,
                      ]}
                    >
                      Всем
                    </Text>
                  </TouchableOpacity>
                  {managementUsers.map((user) => (
                    <TouchableOpacity
                      key={user.id}
                      style={[
                        styles.assigneeChip,
                        newTaskAssignee === user.id && styles.assigneeChipActive,
                      ]}
                      onPress={() => setNewTaskAssignee(user.id)}
                    >
                      <Text
                        style={[
                          styles.assigneeChipText,
                          newTaskAssignee === user.id && styles.assigneeChipTextActive,
                        ]}
                      >
                        {user.name} ({user.role})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                !newTaskTitle.trim() && styles.submitButtonDisabled,
              ]}
              onPress={handleAddTask}
              disabled={!newTaskTitle.trim()}
            >
              <Send size={18} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.submitButtonText}>Создать задание</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

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

                  {task.status === "Выполнено" && (
                     <View style={styles.actionButtons}>
                        {returningTaskId !== task.id ? (
                            <>
                                <TouchableOpacity style={[styles.actionButton, styles.approveButton]} onPress={() => handleConfirmTask(task.id)}>
                                    <Check size={16} color="#FFFFFF" strokeWidth={2} />
                                    <Text style={styles.actionButtonText}>Подтвердить</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.actionButton, styles.returnButton]} onPress={() => setReturningTaskId(task.id)}>
                                    <RefreshCcw size={16} color="#FFFFFF" strokeWidth={2} />
                                    <Text style={styles.actionButtonText}>Вернуть</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                             <View style={styles.returnContainer}>
                                <Text style={styles.returnLabel}>Причина возврата:</Text>
                                <TextInput
                                    style={styles.returnInput}
                                    value={returnComment}
                                    onChangeText={setReturnComment}
                                    placeholder="Комментарий..."
                                    placeholderTextColor="#9CA3AF"
                                    multiline
                                />
                                <View style={styles.returnActions}>
                                    <TouchableOpacity style={[styles.actionButton, styles.returnButton]} onPress={() => handleReturnTask(task.id)}>
                                        <Text style={styles.actionButtonText}>Отправить</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={() => { setReturningTaskId(null); setReturnComment(""); }}>
                                        <Text style={styles.cancelButtonText}>Отмена</Text>
                                    </TouchableOpacity>
                                </View>
                             </View>
                        )}
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
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTop: {
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#111827",
  },
  addTaskButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2563EB",
    borderRadius: 10,
    paddingVertical: 12,
  },
  addTaskButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  addFormContainer: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  addForm: {
    padding: 16,
    gap: 16,
  },
  formField: {
    gap: 8,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#374151",
  },
  formInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
  },
  formTextarea: {
    minHeight: 80,
    textAlignVertical: "top" as const,
  },
  assigneeChips: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  assigneeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  assigneeChipActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  assigneeChipText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#374151",
  },
  assigneeChipTextActive: {
    color: "#FFFFFF",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#15803D",
    borderRadius: 10,
    paddingVertical: 14,
  },
  submitButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFFFFF",
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
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
  },
  approveButton: {
    backgroundColor: "#10B981",
  },
  returnButton: {
    backgroundColor: "#EF4444",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  returnContainer: {
    flex: 1,
    gap: 8,
  },
  returnLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  returnInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: "#111827",
    minHeight: 60,
    textAlignVertical: "top",
  },
  returnActions: {
    flexDirection: "row",
    gap: 8,
  },
});
