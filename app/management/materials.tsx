import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Edit3,
  ExternalLink,
  FileText,
  Plus,
  RefreshCcw,
  Send,
  Users,
  Video,
  XCircle,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { useApp } from "@/providers/AppProvider";
import {
  EMPLOYEE_POSITIONS,
  Position,
  TrainingMaterial,
  TrainingMaterialType,
} from "@/types";

const MATERIAL_TYPES: { value: TrainingMaterialType; label: string; icon: React.ReactNode }[] = [
  { value: "text", label: "Текст", icon: <FileText size={16} color="#2563EB" strokeWidth={2} /> },
  { value: "pdf", label: "PDF", icon: <FileText size={16} color="#DC2626" strokeWidth={2} /> },
  { value: "video", label: "Видео", icon: <Video size={16} color="#7C3AED" strokeWidth={2} /> },
];

const CATEGORIES = ["Основы работы", "Кассовые операции", "Безопасность", "Обслуживание клиентов", "Другое"];

export default function MaterialsScreen() {
  const {
    users,
    trainingMaterials,
    trainingProgress,
    addTrainingMaterial,
    updateTrainingMaterial,
  } = useApp();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<TrainingMaterial | null>(null);
  const [expandedMaterialId, setExpandedMaterialId] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formCategory, setFormCategory] = useState(CATEGORIES[0]);
  const [formType, setFormType] = useState<TrainingMaterialType>("text");
  const [formLink, setFormLink] = useState("");
  const [formAssignAll, setFormAssignAll] = useState(true);
  const [formAssignedGroups, setFormAssignedGroups] = useState<Position[]>([]);

  const targetEmployees = useMemo(
    () => users.filter((u) => 
      u.role === "Администратор" || u.role === "Операционист" || EMPLOYEE_POSITIONS.includes(u.position as typeof EMPLOYEE_POSITIONS[number])
    ),
    [users]
  );

  const getMaterialStats = (materialId: string, materialVersion: number) => {
    const totalEmployees = targetEmployees.length;
    const viewedCount = trainingProgress.filter(
      (p) =>
        p.materialId === materialId &&
        p.completedAt &&
        p.materialVersion === materialVersion
    ).length;
    const notViewedEmployees = targetEmployees.filter(
      (emp) =>
        !trainingProgress.find(
          (p) =>
            p.materialId === materialId &&
            p.employeeId === emp.id &&
            p.completedAt &&
            p.materialVersion === materialVersion
        )
    );
    return { totalEmployees, viewedCount, notViewedEmployees };
  };

  const resetForm = () => {
    setFormTitle("");
    setFormDescription("");
    setFormContent("");
    setFormCategory(CATEGORIES[0]);
    setFormType("text");
    setFormLink("");
    setFormAssignAll(true);
    setFormAssignedGroups([]);
    setEditingMaterial(null);
  };

  const handleOpenLink = (link: string) => {
    Linking.openURL(link).catch((err) =>
      console.error("Couldn't load page", err)
    );
  };

  const handleAddMaterial = () => {
    if (!formTitle.trim() || !formContent.trim()) {
      const msg = "Заполните название и содержание материала";
      if (Platform.OS === "web") {
        alert(msg);
      } else {
        Alert.alert("Ошибка", msg);
      }
      return;
    }

    const newMaterial: TrainingMaterial = {
      id: Date.now().toString(),
      title: formTitle.trim(),
      description: formDescription.trim() || undefined,
      content: formContent.trim(),
      category: formCategory,
      type: formType,
      link: formLink.trim() || undefined,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedToAll: formAssignAll,
      assignedGroups: formAssignAll ? undefined : formAssignedGroups,
    };

    addTrainingMaterial(newMaterial);
    resetForm();
    setShowAddForm(false);

    const successMsg = "Материал добавлен!";
    if (Platform.OS === "web") {
      alert(successMsg);
    } else {
      Alert.alert("Успешно", successMsg);
    }
  };

  const handleEditMaterial = () => {
    if (!editingMaterial || !formTitle.trim() || !formContent.trim()) {
      const msg = "Заполните название и содержание материала";
      if (Platform.OS === "web") {
        alert(msg);
      } else {
        Alert.alert("Ошибка", msg);
      }
      return;
    }

    const versionHistory = editingMaterial.versionHistory || [];
    versionHistory.push({
      version: editingMaterial.version,
      updatedAt: editingMaterial.updatedAt,
      changes: "Предыдущая версия",
    });

    updateTrainingMaterial(editingMaterial.id, {
      title: formTitle.trim(),
      description: formDescription.trim() || undefined,
      content: formContent.trim(),
      category: formCategory,
      type: formType,
      link: formLink.trim() || undefined,
      assignedToAll: formAssignAll,
      assignedGroups: formAssignAll ? undefined : formAssignedGroups,
      versionHistory,
    });

    resetForm();
    setShowAddForm(false);

    const successMsg = "Материал обновлён! Статусы ознакомления сброшены.";
    if (Platform.OS === "web") {
      alert(successMsg);
    } else {
      Alert.alert("Успешно", successMsg);
    }
  };

  const startEditMaterial = (material: TrainingMaterial) => {
    setEditingMaterial(material);
    setFormTitle(material.title);
    setFormDescription(material.description || "");
    setFormContent(material.content);
    setFormCategory(material.category);
    setFormType(material.type);
    setFormLink(material.link || "");
    setFormAssignAll(material.assignedToAll);
    setFormAssignedGroups(material.assignedGroups || []);
    setShowAddForm(true);
  };

  const toggleGroup = (position: Position) => {
    if (formAssignedGroups.includes(position)) {
      setFormAssignedGroups(formAssignedGroups.filter((p) => p !== position));
    } else {
      setFormAssignedGroups([...formAssignedGroups, position]);
    }
  };

  const getTypeIcon = (type: TrainingMaterialType) => {
    const typeConfig = MATERIAL_TYPES.find((t) => t.value === type);
    return typeConfig?.icon || <FileText size={16} color="#6B7280" strokeWidth={2} />;
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen options={{ title: "Учебные материалы", headerTitle: "Учебные материалы" }} />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleRow}>
            <BookOpen size={22} color="#2563EB" strokeWidth={2} />
            <Text style={styles.headerTitle}>Учебные материалы</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            {trainingMaterials.length} материалов
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            if (showAddForm) {
              resetForm();
            }
            setShowAddForm(!showAddForm);
          }}
        >
          {showAddForm ? (
            <XCircle size={18} color="#FFFFFF" strokeWidth={2} />
          ) : (
            <Plus size={18} color="#FFFFFF" strokeWidth={2} />
          )}
          <Text style={styles.addButtonText}>
            {showAddForm ? "Отмена" : "Добавить материал"}
          </Text>
        </TouchableOpacity>
      </View>

      {showAddForm && (
        <ScrollView style={styles.formScrollView}>
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>
              {editingMaterial ? "Редактирование материала" : "Новый материал"}
            </Text>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Название *</Text>
              <TextInput
                style={styles.formInput}
                value={formTitle}
                onChangeText={setFormTitle}
                placeholder="Введите название"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Описание</Text>
              <TextInput
                style={styles.formInput}
                value={formDescription}
                onChangeText={setFormDescription}
                placeholder="Краткое описание материала"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Категория</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipsRow}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.chip,
                        formCategory === cat && styles.chipActive,
                      ]}
                      onPress={() => setFormCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          formCategory === cat && styles.chipTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Тип материала</Text>
              <View style={styles.typeRow}>
                {MATERIAL_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeButton,
                      formType === type.value && styles.typeButtonActive,
                    ]}
                    onPress={() => setFormType(type.value)}
                  >
                    {type.icon}
                    <Text
                      style={[
                        styles.typeButtonText,
                        formType === type.value && styles.typeButtonTextActive,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {(formType === "pdf" || formType === "video") && (
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Ссылка на материал *</Text>
                <TextInput
                  style={styles.formInput}
                  value={formLink}
                  onChangeText={setFormLink}
                  placeholder={formType === "video" ? "Ссылка на видео (YouTube и т.д.)" : "Ссылка на PDF документ"}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            )}

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Содержание *</Text>
              <TextInput
                style={[styles.formInput, styles.formTextarea]}
                value={formContent}
                onChangeText={setFormContent}
                placeholder="Введите содержание материала..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={6}
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Назначение</Text>
              <View style={styles.assignRow}>
                <TouchableOpacity
                  style={[
                    styles.assignButton,
                    formAssignAll && styles.assignButtonActive,
                  ]}
                  onPress={() => setFormAssignAll(true)}
                >
                  <Users size={16} color={formAssignAll ? "#FFFFFF" : "#6B7280"} strokeWidth={2} />
                  <Text
                    style={[
                      styles.assignButtonText,
                      formAssignAll && styles.assignButtonTextActive,
                    ]}
                  >
                    Всем сотрудникам
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.assignButton,
                    !formAssignAll && styles.assignButtonActive,
                  ]}
                  onPress={() => setFormAssignAll(false)}
                >
                  <Text
                    style={[
                      styles.assignButtonText,
                      !formAssignAll && styles.assignButtonTextActive,
                    ]}
                  >
                    Выбрать группы
                  </Text>
                </TouchableOpacity>
              </View>
              {!formAssignAll && (
                <View style={styles.groupsRow}>
                  {EMPLOYEE_POSITIONS.map((pos) => (
                    <TouchableOpacity
                      key={pos}
                      style={[
                        styles.groupChip,
                        formAssignedGroups.includes(pos) && styles.groupChipActive,
                      ]}
                      onPress={() => toggleGroup(pos)}
                    >
                      {formAssignedGroups.includes(pos) && (
                        <Check size={14} color="#FFFFFF" strokeWidth={2} />
                      )}
                      <Text
                        style={[
                          styles.groupChipText,
                          formAssignedGroups.includes(pos) && styles.groupChipTextActive,
                        ]}
                      >
                        {pos}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                (!formTitle.trim() || !formContent.trim()) && styles.submitButtonDisabled,
              ]}
              onPress={editingMaterial ? handleEditMaterial : handleAddMaterial}
              disabled={!formTitle.trim() || !formContent.trim()}
            >
              <Send size={18} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.submitButtonText}>
                {editingMaterial ? "Сохранить изменения" : "Добавить материал"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {!showAddForm && (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {trainingMaterials.length === 0 ? (
            <View style={styles.emptyState}>
              <BookOpen size={48} color="#D1D5DB" strokeWidth={1.5} />
              <Text style={styles.emptyTitle}>Нет материалов</Text>
              <Text style={styles.emptyText}>
                Добавьте учебные материалы для сотрудников
              </Text>
            </View>
          ) : (
            trainingMaterials.map((material) => {
              const stats = getMaterialStats(material.id, material.version);
              const isExpanded = expandedMaterialId === material.id;

              return (
                <View key={material.id} style={styles.materialCard}>
                  <TouchableOpacity
                    style={styles.materialHeader}
                    onPress={() =>
                      setExpandedMaterialId(isExpanded ? null : material.id)
                    }
                  >
                    <View style={styles.materialTitleRow}>
                      {getTypeIcon(material.type)}
                      <View style={styles.materialTitleInfo}>
                        <Text style={styles.materialTitle}>{material.title}</Text>
                        <Text style={styles.materialMeta}>
                          {material.category} • v{material.version}
                        </Text>
                      </View>
                    </View>
                    {isExpanded ? (
                      <ChevronUp size={20} color="#6B7280" strokeWidth={2} />
                    ) : (
                      <ChevronDown size={20} color="#6B7280" strokeWidth={2} />
                    )}
                  </TouchableOpacity>

                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Users size={14} color="#6B7280" strokeWidth={2} />
                      <Text style={styles.statText}>
                        {stats.viewedCount}/{stats.totalEmployees} ознакомились
                      </Text>
                    </View>
                    <View style={styles.progressBarSmall}>
                      <View
                        style={[
                          styles.progressBarFillSmall,
                          {
                            width: `${stats.totalEmployees > 0 ? (stats.viewedCount / stats.totalEmployees) * 100 : 0}%`,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  {isExpanded && (
                    <View style={styles.expandedContent}>
                      {material.description && (
                        <Text style={styles.materialDescription}>
                          {material.description}
                        </Text>
                      )}
                      <View style={styles.contentPreview}>
                        <Text style={styles.contentPreviewText} numberOfLines={4}>
                          {material.content}
                        </Text>
                      </View>

                      {material.link && (
                        <TouchableOpacity
                          style={styles.linkButton}
                          onPress={() => handleOpenLink(material.link!)}
                        >
                          <ExternalLink size={16} color="#FFFFFF" strokeWidth={2} />
                          <Text style={styles.linkButtonText}>
                            {material.type === "video" ? "Смотреть видео" : "Открыть документ"}
                          </Text>
                        </TouchableOpacity>
                      )}

                      {stats.notViewedEmployees.length > 0 && (
                        <View style={styles.notViewedSection}>
                          <Text style={styles.notViewedTitle}>
                            Не ознакомились ({stats.notViewedEmployees.length}):
                          </Text>
                          <View style={styles.notViewedList}>
                            {stats.notViewedEmployees.slice(0, 5).map((emp) => (
                              <View key={emp.id} style={styles.notViewedItem}>
                                <Text style={styles.notViewedName}>{emp.name}</Text>
                                <Text style={styles.notViewedPosition}>
                                  {emp.position}
                                </Text>
                              </View>
                            ))}
                            {stats.notViewedEmployees.length > 5 && (
                              <Text style={styles.moreEmployees}>
                                и ещё {stats.notViewedEmployees.length - 5}...
                              </Text>
                            )}
                          </View>
                        </View>
                      )}

                      <View style={styles.materialActions}>
                        <TouchableOpacity
                          style={styles.editButton}
                          onPress={() => startEditMaterial(material)}
                        >
                          <Edit3 size={16} color="#2563EB" strokeWidth={2} />
                          <Text style={styles.editButtonText}>Редактировать</Text>
                        </TouchableOpacity>
                        {material.versionHistory && material.versionHistory.length > 0 && (
                          <View style={styles.versionInfo}>
                            <RefreshCcw size={14} color="#6B7280" strokeWidth={2} />
                            <Text style={styles.versionInfoText}>
                              {material.versionHistory.length} обновлений
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              );
            })
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
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2563EB",
    borderRadius: 10,
    paddingVertical: 12,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  formScrollView: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  formContainer: {
    padding: 16,
    gap: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#111827",
    marginBottom: 8,
  },
  formField: {
    gap: 8,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
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
    minHeight: 120,
    textAlignVertical: "top" as const,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  chipActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#374151",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  typeRow: {
    flexDirection: "row",
    gap: 10,
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  typeButtonActive: {
    backgroundColor: "#EFF6FF",
    borderColor: "#2563EB",
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: "#6B7280",
  },
  typeButtonTextActive: {
    color: "#2563EB",
  },
  assignRow: {
    flexDirection: "row",
    gap: 10,
  },
  assignButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  assignButtonActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  assignButtonText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#6B7280",
  },
  assignButtonTextActive: {
    color: "#FFFFFF",
  },
  groupsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  groupChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  groupChipActive: {
    backgroundColor: "#15803D",
    borderColor: "#15803D",
  },
  groupChipText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#374151",
  },
  groupChipTextActive: {
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
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFFFFF",
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
  materialCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  materialHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  materialTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  materialTitleInfo: {
    flex: 1,
  },
  materialTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#111827",
  },
  materialMeta: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 12,
    color: "#6B7280",
  },
  progressBarSmall: {
    flex: 1,
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFillSmall: {
    height: "100%",
    backgroundColor: "#15803D",
    borderRadius: 3,
  },
  expandedContent: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 14,
  },
  materialDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  contentPreview: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  contentPreviewText: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 20,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2563EB",
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 16,
  },
  linkButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  notViewedSection: {
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  notViewedTitle: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#DC2626",
    marginBottom: 8,
  },
  notViewedList: {
    gap: 6,
  },
  notViewedItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notViewedName: {
    fontSize: 13,
    color: "#374151",
  },
  notViewedPosition: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  moreEmployees: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic" as const,
  },
  materialActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#2563EB",
  },
  versionInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  versionInfoText: {
    fontSize: 12,
    color: "#6B7280",
  },
});
