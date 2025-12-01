// src/screens/admin/AdminScreen.tsx
import React, { useState } from 'react';
import { StyleSheet,  View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import { theme } from '../../theme';
import { MaterialIcons } from '@expo/vector-icons';

type Report = {
  id: string;
  type: 'user' | 'content';
  title: string;
  description: string;
  reportedBy: string;
  status: 'pending' | 'reviewed' | 'resolved';
  date: string;
};

const reportsData: Report[] = [
  {
    id: '1',
    type: 'content',
    title: 'Inappropriate Outfit',
    description: 'This outfit contains offensive symbols',
    reportedBy: 'user123',
    status: 'pending',
    date: '2025-11-28',
  },
  // Add more reports as needed
];

export const AdminScreen = () => {
  const [reports, setReports] = useState<Report[]>(reportsData);

  const handleStatusChange = (id: string, newStatus: Report['status']) => {
    setReports(reports.map(report => 
      report.id === id ? { ...report, status: newStatus } : report
    ));
  };

  const renderReportItem = ({ item }: { item: Report }) => (
    <View style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <View style={[
          styles.statusBadge,
          item.status === 'pending' && styles.statusBadgePending,
          item.status === 'reviewed' && styles.statusBadgeReviewed,
          item.status === 'resolved' && styles.statusBadgeResolved,
        ]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
        <Text style={styles.reportDate}>{item.date}</Text>
      </View>
      
      <Text style={styles.reportTitle}>{item.title}</Text>
      <Text style={styles.reportDescription}>{item.description}</Text>
      <Text style={styles.reportedBy}>Reported by: {item.reportedBy}</Text>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.viewButton}
          onPress={() => Alert.alert('View Report', `Viewing report: ${item.title}`)}
        >
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>
        
        <View style={styles.statusButtons}>
          {item.status !== 'reviewed' && (
            <TouchableOpacity 
              style={[styles.statusButton, styles.reviewButton]}
              onPress={() => handleStatusChange(item.id, 'reviewed')}
            >
              <MaterialIcons name="visibility" size={16} color={theme.colors.white} />
            </TouchableOpacity>
          )}
          
          {item.status !== 'resolved' && (
            <TouchableOpacity 
              style={[styles.statusButton, styles.resolveButton]}
              onPress={() => handleStatusChange(item.id, 'resolved')}
            >
              <MaterialIcons name="check" size={16} color={theme.colors.white} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{reports.length}</Text>
            <Text style={styles.statLabel}>Total Reports</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {reports.filter(r => r.status === 'pending').length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={reports}
        renderItem={renderReportItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="check-circle" size={48} color={theme.colors.success} />
            <Text style={styles.emptyStateText}>No reports to review</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  header: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerTitle: {
    ...theme.text.h2,
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.md,
    marginHorizontal: theme.spacing.xs,
  },
  statNumber: {
    ...theme.text.h2,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    ...theme.text.caption,
    color: theme.colors.gray,
  },
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
  reportCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statusBadgePending: {
    backgroundColor: theme.colors.warning + '20',
  },
  statusBadgeReviewed: {
    backgroundColor: theme.colors.primary + '20',
  },
  statusBadgeResolved: {
    backgroundColor: theme.colors.success + '20',
  },
  statusText: {
    ...theme.text.caption,
    fontWeight: '600',
  },
  reportDate: {
    ...theme.text.caption,
    color: theme.colors.gray,
  },
  reportTitle: {
    ...theme.text.body,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  reportDescription: {
    ...theme.text.body,
    color: theme.colors.gray,
    marginBottom: theme.spacing.xs,
  },
  reportedBy: {
    ...theme.text.caption,
    color: theme.colors.gray,
    marginBottom: theme.spacing.md,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary + '10',
  },
  viewButtonText: {
    ...theme.text.caption,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  statusButtons: {
    flexDirection: 'row',
  },
  statusButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.sm,
  },
  reviewButton: {
    backgroundColor: theme.colors.primary,
  },
  resolveButton: {
    backgroundColor: theme.colors.success,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyStateText: {
    ...theme.text.body,
    color: theme.colors.gray,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
});