import {
  CheckCircle,
  MessageSquare,
  Star,
  User as UserIcon,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
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

export default function CompletedTasksScreen() {
  const { users, tasks, updateTask, currentUser } = useApp();
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [directorComment, setDirectorComment] = useState("");

  const completedTasks = useMemo(() => {
    return tasks
      .filter((t) => t.status === "Проверено" && t.rating)
      .sort((a, b) => {
        const dateA = a.verifiedAt ? new Date(a.verifiedAt).getTime() : 0;
        const dateB = b.verifiedAt ? new Date(b.verifiedAt).getTime() : 0;
        return dateB - dateA;
      });
  }, [tasks]);

  const getExecutorName = (task: Task) => {
    if (!task.takenBy) return "Не указан";
    const user = users.find((u) => u.id === task.takenBy);
    return user?.name || "Неизвестно";
  };

  const getModeratorName = (task: Task) => {
    return task.moderatedBy || task.verifiedBy || "Не указан";
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAddComment = (taskId: string) => {
    if (!directorComment.trim()) return;
    
    updateTask(taskId, {
      directorReviewed: true,
      directorComment: directorComment.trim(),
    });
    setDirectorComment("");
    setSelectedTask(null);
    
    const msg = "Комментарий добавлен";
    if (Platform.OS === "web") {
      alert(msg);
    } else {
      Alert.alert("Успешно", msg);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            color={star <= rating ? "#F59E0B" : "#D1D5DB"}
            fill={star <= rating ? "#F59E0B" : "transparent"}
            strokeWidth={2}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <CheckCircle size={22} color="#15803D" strokeWidth={2} />
          <Text style={styles.headerTitle}>Проверенные задания</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          {completedTasks.length} заданий завершено
        </Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {completedTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <CheckCircle size={48} color="#D1D5DB" strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>Нет проверенных заданий</Text>
            <Text style={styles.emptyText}>
              Задания появятся здесь после модерации администратором
            </Text>
          </View>
        ) : (
          completedTasks.map((task) => (
            <View key={task.id} style={styles.taskCard}>
              <View style={styles.taskHeader}>
                <View style={styles.ratingSection}>
                  {renderStars(task.rating || 0)}
                  <Text style={styles.ratingValue}>({task.rating}/5)</Text>
                </View>
                <Text style={styles.taskDate}>{formatDate(task.verifiedAt)}</Text>
              </View>

              <Text style={styles.taskTitle}>{task.title}</Text>
              {task.description && (
                <Text style={styles.taskDescription}>{task.description}</Text>
              )}

              {task.resultText && (
                <View style={styles.resultSection}>
                  <Text style={styles.resultLabel}>Результат:</Text>
                  <Text style={styles.resultText}>{task.resultText}</Text>
                </View>
              )}

              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <UserIcon size={14} color="#6B7280" strokeWidth={2} />
                  <Text style={styles.infoLabel}>Исполнитель:</Text>
                  <Text style={styles.infoValue}>{getExecutorName(task)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <CheckCircle size={14} color="#6B7280" strokeWidth={2} />
                  <Text style={styles.infoLabel}>Модератор:</Text>
                  <Text style={styles.infoValue}>{getModeratorName(task)}</Text>
                </View>
              </View>

              {task.directorComment && (
                <View style={styles.directorCommentSection}>
                  <Text style={styles.directorCommentLabel}>Комментарий директора:</Text>
                  <Text style={styles.directorCommentText}>{task.directorComment}</Text>
                </View>
              )}

              {currentUser?.position === "Директор" && selectedTask !== task.id && !task.directorReviewed && (
                <TouchableOpacity
                  style={styles.commentButton}
                  onPress={() => setSelectedTask(task.id)}
                >
                  <MessageSquare size={16} color="#2563EB" strokeWidth={2} />
                  <Text style={styles.commentButtonText}>Добавить комментарий</Text>
                </TouchableOpacity>
              )}

              {selectedTask === task.id && (
                <View style={styles.commentForm}>
                  <TextInput
                    style={styles.commentInput}
                    value={directorComment}
                    onChangeText={setDirectorComment}
                    placeholder="Комментарий директора..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                  />
                  <View style={styles.commentActions}>
                    <TouchableOpacity
                      style={styles.commentSaveButton}
                      onPress={() => handleAddComment(task.id)}
                    >
                      <Text style={styles.commentSaveText}>Сохранить</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.commentCancelButton}
                      onPress={() => {
                        setSelectedTask(null);
                        setDirectorComment("");
                      }}
                    >
                      <Text style={styles.commentCancelText}>Отмена</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {task.directorReviewed && (
                <View style={styles.reviewedBadge}>
                  <CheckCircle size={14} color="#15803D" strokeWidth={2} />
                  <Text style={styles.reviewedText}>Просмотрено директором</Text>
                </View>
              )}
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
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
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  ratingSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  starsRow: {
    flexDirection: "row",
    gap: 2,
  },
  ratingValue: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#92400E",
  },
  taskDate: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#111827",
    marginBottom: 6,
  },
  taskDescription: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 10,
  },
  resultSection: {
    backgroundColor: "#F0FDF4",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#15803D",
    marginBottom: 4,
  },
  resultText: {
    fontSize: 13,
    color: "#374151",
  },
  infoSection: {
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoLabel: {
    fontSize: 13,
    color: "#6B7280",
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#374151",
  },
  directorCommentSection: {
    backgroundColor: "#EFF6FF",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  directorCommentLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#2563EB",
    marginBottom: 4,
  },
  directorCommentText: {
    fontSize: 13,
    color: "#374151",
  },
  commentButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    marginTop: 10,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
  },
  commentButtonText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#2563EB",
  },
  commentForm: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  commentInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#111827",
    minHeight: 60,
    textAlignVertical: "top" as const,
  },
  commentActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  commentSaveButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#2563EB",
    alignItems: "center",
  },
  commentSaveText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  commentCancelButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  commentCancelText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#6B7280",
  },
  reviewedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  reviewedText: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: "#15803D",
  },
});
