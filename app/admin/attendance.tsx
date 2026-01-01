import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardHeader } from '@/components/DashboardHeader';
import { formatRole } from '@/utils/format';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format, subDays, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, getDay } from 'date-fns';
import {
  useGetAttendanceByDateQuery,
  useGetAllAttendanceQuery,
} from '@/services/api/attendanceApi';

export default function AttendanceScreen() {
  const { theme } = useTheme();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedDateObj, setSelectedDateObj] = useState<Date>(today);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showAllAttendance, setShowAllAttendance] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);

  // Fetch all attendance records
  const {
    data: allAttendanceData,
    isLoading: isLoadingAllAttendance,
    error: allAttendanceError,
  } = useGetAllAttendanceQuery(
    user?._id || user?.id || '',
    { skip: (!user?._id && !user?.id) || !showAllAttendance || authLoading }
  );

  // Extract attendance records from the nested structure
  const attendanceDayRecords = allAttendanceData?.data?.attendanceRecords || [];
  
  // Flatten all individual attendance records for table display
  const allAttendanceRecords = useMemo(() => {
    return attendanceDayRecords.flatMap(dayRecord => 
    dayRecord.attendanceRecords.map(record => ({
      ...record,
        date: dayRecord.date,
        totalPresent: dayRecord.totalPresent,
        totalAbsent: dayRecord.totalAbsent,
    }))
  );
  }, [attendanceDayRecords]);

  // Pagination for table view
  const totalRecords = allAttendanceRecords.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const paginatedRecords = allAttendanceRecords.slice(startIndex, endIndex);

  // Fetch attendance data for selected date
  const {
    data: attendanceData,
    isLoading: attendanceLoading,
    error: attendanceError,
  } = useGetAttendanceByDateQuery(
    {
      date: selectedDate,
      adminId: user?._id || user?.id || '',
      libraryId: user?.libraryId || '',
    },
    { skip: (!user?._id && !user?.id) || !user?.libraryId || showAllAttendance || authLoading }
  );

  const handleDateSelect = (date: Date) => {
    setSelectedDateObj(date);
    setSelectedDate(format(date, 'yyyy-MM-dd'));
    setShowCalendar(false);
    setShowAllAttendance(false);
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subDays(startOfMonth(currentMonth), 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addDays(endOfMonth(currentMonth), 1));
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDay = getDay(monthStart);

    // Get attendance dates for highlighting
    const attendanceDates = Array.from(
      new Set(
        allAttendanceRecords
          .map(record => record.date || record.createdAt)
          .filter(Boolean)
          .map(date => {
            try {
              return format(new Date(date), 'yyyy-MM-dd');
            } catch {
              return date;
            }
          })
      )
    );

    return (
      <View style={[styles.calendarContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={handlePreviousMonth}>
            <Icon name="chevron-left" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.calendarMonth, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
            {format(currentMonth, 'MMMM yyyy')}
          </Text>
          <TouchableOpacity onPress={handleNextMonth}>
            <Icon name="chevron-right" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.calendarWeekdays}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Text key={day} style={[styles.calendarWeekday, { color: theme.colors.textSecondary }]}>
              {day}
            </Text>
          ))}
        </View>
        <View style={styles.calendarDays}>
          {Array.from({ length: startDay }).map((_, index) => (
            <View key={`empty-${index}`} style={styles.calendarDay} />
          ))}
          {daysInMonth.map((day) => {
            const dayStr = format(day, 'yyyy-MM-dd');
            const isSelected = isSameDay(day, selectedDateObj);
            const hasAttendance = attendanceDates.includes(dayStr);
            const isToday = isSameDay(day, today);

            return (
              <TouchableOpacity
                key={dayStr}
                style={[
                  styles.calendarDay,
                  isSelected && { backgroundColor: theme.colors.primary },
                  hasAttendance && !isSelected && { backgroundColor: theme.colors.success + '30' },
                  isToday && !isSelected && { borderWidth: 2, borderColor: theme.colors.primary },
                ]}
                onPress={() => handleDateSelect(day)}
              >
                <Text
                  style={[
                    styles.calendarDayText,
                    {
                      color: isSelected ? '#FFFFFF' : theme.colors.textPrimary,
                      fontWeight: isToday ? '700' : '400',
                    },
                  ]}
                >
                  {format(day, 'd')}
                </Text>
                {hasAttendance && (
                  <View style={[styles.attendanceDot, { backgroundColor: isSelected ? '#FFFFFF' : theme.colors.success }]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  // Extract data from response
  const seats = attendanceData?.data?.seats || [];
  const attendance = attendanceData?.data?.attendance;
  const attendanceRecords = attendanceData?.data?.attendanceRecords || [];
  const seatLayout = attendanceData?.data?.seatLayout;

  const getSeatColor = (status: string) => {
    switch (status) {
      case 'VACANT':
      case 'BLANK':
        return theme.colors.success;
      case 'FILLED':
        return theme.colors.error;
      case 'FIXED':
        return theme.colors.warning;
      case 'BLOCKED':
        return theme.colors.textSecondary;
      default:
        return theme.colors.border;
    }
  };

  const renderSeat = ({ item }: { item: any }) => {
    const seatColor = getSeatColor(item.status);
    const isAvailable = item.status === 'VACANT' || item.status === 'BLANK';

    return (
      <TouchableOpacity
        style={[
          styles.seat,
          {
            backgroundColor: isAvailable ? seatColor + '20' : theme.colors.surface,
            borderColor: seatColor,
            borderWidth: 2,
          },
        ]}
        disabled={!isAvailable}
      >
        <Text
          style={[
            styles.seatNumber,
            {
              color: theme.colors.textPrimary,
              ...theme.typography.body,
            },
          ]}
        >
          {item.seatNumber}
        </Text>
        {!isAvailable && (
          <Icon
            name={item.status === 'FILLED' ? 'person' : 'block'}
            size={16}
            color={seatColor}
          />
        )}
      </TouchableOpacity>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return theme.colors.success;
      case 'ABSENT':
        return theme.colors.error;
      case 'LATE':
        return theme.colors.warning;
      case 'EARLY_LEAVE':
        return theme.colors.info;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusVariant = (status: string): 'success' | 'error' | 'warning' | 'info' => {
    switch (status) {
      case 'PRESENT':
        return 'success';
      case 'ABSENT':
        return 'error';
      case 'LATE':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {user && (
        <DashboardHeader
          userName={user.name}
          userRole={formatRole(user.role)}
          notificationCount={3}
          onNotificationPress={() => router.push('/notifications')}
          onProfilePress={() => router.push('/(tabs)/profile')}
        />
      )}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary, ...theme.typography.h2 }]}>
          Attendance
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={[styles.statusIndicator, { backgroundColor: theme.colors.success + '20' }]}>
              <Icon name="check-circle" size={24} color={theme.colors.success} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: theme.colors.textPrimary, ...theme.typography.bodyLarge }]}>
                {showAllAttendance ? 'All Attendance Records' : format(new Date(selectedDate), 'EEEE, MMMM dd, yyyy')}
              </Text>
              <Text style={[styles.infoText, { color: theme.colors.textSecondary, ...theme.typography.body }]}>
                {showAllAttendance ? `Showing ${totalRecords} records` : `Selected: ${format(new Date(selectedDate), 'MMM dd, yyyy')}`}
              </Text>
            </View>
          </View>
        </Card>

        {/* Date Filter Controls */}
        <View style={styles.dateFilterContainer}>
          <View style={styles.dateFilterRow}>
            <TouchableOpacity
              style={[
                styles.dateFilterButton,
                {
                  backgroundColor: !showAllAttendance ? theme.colors.primary : theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => {
                setShowCalendar(!showCalendar);
                setShowAllAttendance(false);
              }}
            >
              <Icon name="calendar-today" size={20} color={!showAllAttendance ? '#FFFFFF' : theme.colors.textPrimary} />
              <Text
                style={[
                  styles.dateFilterText,
                  {
                    color: !showAllAttendance ? '#FFFFFF' : theme.colors.textPrimary,
                    ...theme.typography.body,
                  },
                ]}
              >
                {format(new Date(selectedDate), 'MMM dd, yyyy')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.dateFilterButton,
                {
                  backgroundColor: showAllAttendance ? theme.colors.primary : theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => {
                setShowAllAttendance(!showAllAttendance);
                setShowCalendar(false);
                setCurrentPage(1);
              }}
            >
              <Icon name="list" size={20} color={showAllAttendance ? '#FFFFFF' : theme.colors.textPrimary} />
              <Text
                style={[
                  styles.dateFilterText,
                  {
                    color: showAllAttendance ? '#FFFFFF' : theme.colors.textPrimary,
                    ...theme.typography.body,
                  },
                ]}
              >
                {showAllAttendance ? 'Filter by Date' : 'Show All'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Calendar Component */}
        {showCalendar && (
          <Card style={styles.calendarCard}>
            {renderCalendar()}
          </Card>
        )}

        {showAllAttendance ? (
          <View style={styles.tableContainer}>
            {isLoadingAllAttendance ? (
              <LoadingSpinner />
            ) : allAttendanceError ? (
              <EmptyState
                icon="error-outline"
                title="Error loading attendance"
                message="Please try again later"
              />
            ) : paginatedRecords.length > 0 ? (
              <>
                {/* Table Header */}
                <View style={[styles.tableHeader, { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}>
                  <Text style={[styles.tableHeaderText, { color: '#FFFFFF', flex: 2 }]}>Student</Text>
                  <Text style={[styles.tableHeaderText, { color: '#FFFFFF', flex: 1.5 }]}>Date</Text>
                  <Text style={[styles.tableHeaderText, { color: '#FFFFFF', flex: 1 }]}>Shift</Text>
                  <Text style={[styles.tableHeaderText, { color: '#FFFFFF', flex: 1 }]}>Status</Text>
                  <Text style={[styles.tableHeaderText, { color: '#FFFFFF', flex: 1.2 }]}>Time</Text>
                </View>

                {/* Table Rows */}
              <FlatList
                  data={paginatedRecords}
                  renderItem={({ item, index }) => {
                    const studentId = typeof item.studentId === 'object' ? item.studentId : null;
                    const studentName = studentId?.name || 'Unknown Student';
                    const studentEmail = studentId?.email || '';
                    const dateStr = item.date || item.createdAt || '';
                    let formattedDate = 'N/A';
                    
                    try {
                      if (dateStr) {
                      formattedDate = format(new Date(dateStr), 'MMM dd, yyyy');
                    }
                  } catch (err) {
                    console.error('Error parsing date:', err);
                  }

                    const checkInTime = item.checkInTime ? format(new Date(item.checkInTime), 'HH:mm') : '-';
                    const checkOutTime = item.checkOutTime ? format(new Date(item.checkOutTime), 'HH:mm') : '-';
                    const timeDisplay = checkInTime !== '-' && checkOutTime !== '-' 
                      ? `${checkInTime} - ${checkOutTime}`
                      : checkInTime !== '-' ? checkInTime : '-';

                    const isEvenRow = index % 2 === 0;
                  
                  return (
                      <View
                        style={[
                          styles.tableRow,
                          {
                            backgroundColor: isEvenRow ? theme.colors.surface : theme.colors.background,
                            borderBottomColor: theme.colors.border,
                          },
                        ]}
                      >
                        <View style={[styles.tableCell, { flex: 2 }]}>
                          <Text style={[styles.tableCellText, { color: theme.colors.textPrimary, fontWeight: '600' }]} numberOfLines={1}>
                            {studentName}
                          </Text>
                          {studentEmail && (
                            <Text style={[styles.tableCellSubtext, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                              {studentEmail}
                          </Text>
                          )}
                        </View>
                        <View style={[styles.tableCell, { flex: 1.5 }]}>
                          <Text style={[styles.tableCellText, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                            {formattedDate}
                            </Text>
                        </View>
                        <View style={[styles.tableCell, { flex: 1 }]}>
                          <Text style={[styles.tableCellText, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                            {item.shift || '-'}
                            </Text>
                        </View>
                        <View style={[styles.tableCell, { flex: 1 }]}>
                        <Badge
                            label={item.status || 'N/A'}
                            variant={getStatusVariant(item.status || '')}
                            size="small"
                        />
                      </View>
                        <View style={[styles.tableCell, { flex: 1.2 }]}>
                          <Text style={[styles.tableCellText, { color: theme.colors.textSecondary, fontSize: 12 }]} numberOfLines={1}>
                            {timeDisplay}
                              </Text>
                            </View>
                        </View>
                  );
                }}
                  keyExtractor={(item) => item._id}
                scrollEnabled={false}
              />

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <View style={[styles.paginationContainer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
                    <View style={styles.paginationInfo}>
                      <Text style={[styles.paginationText, { color: theme.colors.textSecondary }]}>
                        Showing {startIndex + 1}-{Math.min(endIndex, totalRecords)} of {totalRecords}
                      </Text>
                      <View style={styles.recordsPerPageContainer}>
                        <Text style={[styles.recordsPerPageLabel, { color: theme.colors.textSecondary }]}>
                          Per page:
                        </Text>
                        <View style={styles.recordsPerPageButtons}>
                          {[10, 20, 50].map((limit) => (
                            <TouchableOpacity
                              key={limit}
                              style={[
                                styles.recordsPerPageButton,
                                {
                                  backgroundColor: recordsPerPage === limit ? theme.colors.primary : theme.colors.background,
                                  borderColor: theme.colors.border,
                                },
                              ]}
                              onPress={() => {
                                setRecordsPerPage(limit);
                                setCurrentPage(1);
                              }}
                            >
                              <Text
                                style={[
                                  styles.recordsPerPageButtonText,
                                  {
                                    color: recordsPerPage === limit ? '#FFFFFF' : theme.colors.textPrimary,
                                  },
                                ]}
                              >
                                {limit}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    </View>
                    <View style={styles.paginationControls}>
                      <TouchableOpacity
                        style={[
                          styles.paginationButton,
                          {
                            backgroundColor: currentPage === 1 ? theme.colors.background : theme.colors.primary,
                            borderColor: theme.colors.border,
                          },
                        ]}
                        onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <Icon 
                          name="chevron-left" 
                          size={20} 
                          color={currentPage === 1 ? theme.colors.textSecondary : '#FFFFFF'} 
                        />
                      </TouchableOpacity>
                      <Text style={[styles.pageNumber, { color: theme.colors.textPrimary }]}>
                        Page {currentPage} of {totalPages}
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.paginationButton,
                          {
                            backgroundColor: currentPage >= totalPages ? theme.colors.background : theme.colors.primary,
                            borderColor: theme.colors.border,
                          },
                        ]}
                        onPress={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage >= totalPages}
                      >
                        <Icon 
                          name="chevron-right" 
                          size={20} 
                          color={currentPage >= totalPages ? theme.colors.textSecondary : '#FFFFFF'} 
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </>
            ) : (
              <EmptyState
                icon="event"
                title="No attendance records"
                message="No attendance records found"
              />
            )}
          </View>
        ) : attendanceLoading ? (
            <LoadingSpinner />
          ) : attendanceError ? (
            <EmptyState
              icon="error-outline"
              title="Error loading attendance"
              message="Please try again later"
            />
          ) : seats.length > 0 ? (
            <View style={styles.seatsContainer}>
              <FlatList
                data={seats}
                renderItem={renderSeat}
                keyExtractor={(item) => item._id || item.seatNumber?.toString()}
                numColumns={4}
                scrollEnabled={false}
                contentContainerStyle={styles.seatsGrid}
              />
            </View>
          ) : attendanceRecords.length > 0 ? (
            <View style={styles.attendanceRecordsContainer}>
              {/* Show attendance summary */}
              {attendance && (
                <Card style={styles.summaryCard}>
                  <Text style={[styles.summaryTitle, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
                    Attendance Summary
                  </Text>
                  <View style={styles.summaryGrid}>
                    <View style={styles.summaryItem}>
                      <Text style={[styles.summaryValue, { color: theme.colors.success, ...theme.typography.h2 }]}>
                        {attendance.totalPresent || 0}
                      </Text>
                      <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Present</Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={[styles.summaryValue, { color: theme.colors.error, ...theme.typography.h2 }]}>
                        {attendance.totalAbsent || 0}
                      </Text>
                      <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Absent</Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={[styles.summaryValue, { color: theme.colors.primary, ...theme.typography.h2 }]}>
                        {attendance.morningPresent || 0}
                      </Text>
                      <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Morning</Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={[styles.summaryValue, { color: theme.colors.info, ...theme.typography.h2 }]}>
                        {attendance.afternoonPresent || 0}
                      </Text>
                      <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Afternoon</Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={[styles.summaryValue, { color: theme.colors.warning, ...theme.typography.h2 }]}>
                        {attendance.eveningPresent || 0}
                      </Text>
                      <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Evening</Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={[styles.summaryValue, { color: theme.colors.primary, ...theme.typography.h2 }]}>
                        {attendance.fullDayPresent || 0}
                      </Text>
                      <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Full Day</Text>
                    </View>
                  </View>
                </Card>
              )}
              
              {/* Show attendance records list */}
              <View style={styles.recordsList}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
                  Attendance Records ({attendanceRecords.length})
                </Text>
                <FlatList
                  data={attendanceRecords}
                  renderItem={({ item }) => {
                    const studentId = typeof item.studentId === 'object' ? item.studentId : null;
                    const studentName = studentId?.name || 'Unknown Student';
                    const studentEmail = studentId?.email || '';
                    const actualStudentId = typeof item.studentId === 'string' ? item.studentId : studentId?._id || '';
                    
                    return (
                      <Card style={styles.recordCard}>
                        <View style={styles.recordRow}>
                          <View style={styles.recordInfo}>
                            <Text style={[styles.recordName, { color: theme.colors.textPrimary, ...theme.typography.bodyLarge }]}>
                              {studentName}
                            </Text>
                            {studentEmail && (
                              <Text style={[styles.recordEmail, { color: theme.colors.textSecondary, ...theme.typography.body }]}>
                                {studentEmail}
                              </Text>
                            )}
                            <View style={styles.recordDetails}>
                              <Text style={[styles.recordDetail, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                                Shift: {item.shift}
                              </Text>
                              {item.checkInTime && (
                                <Text style={[styles.recordDetail, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                                  Check-in: {format(new Date(item.checkInTime), 'HH:mm')}
                                </Text>
                              )}
                              {item.checkOutTime && (
                                <Text style={[styles.recordDetail, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                                  Check-out: {format(new Date(item.checkOutTime), 'HH:mm')}
                                </Text>
                              )}
                              {item.totalHours !== undefined && (
                                <Text style={[styles.recordDetail, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                                  Hours: {item.totalHours}
                                </Text>
                              )}
                            </View>
                          </View>
                          <View style={styles.recordActions}>
                            <Badge
                              label={item.status}
                              variant={
                                item.status === 'PRESENT' ? 'success' :
                                item.status === 'ABSENT' ? 'error' :
                                item.status === 'LATE' ? 'warning' : 'info'
                              }
                            />
            </View>
                        </View>
                      </Card>
                    );
                  }}
                  keyExtractor={(item) => item._id}
                  scrollEnabled={false}
                />
              </View>
            </View>
          ) : (
            <EmptyState
              icon="event-seat"
              title="No attendance data"
              message={seatLayout ? "No attendance records found for this date. Seats are available but no students have checked in." : "Seat layout not configured. Please configure seats first."}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  infoCard: {
    margin: 16,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    marginBottom: 4,
    fontWeight: '600',
  },
  infoText: {
    marginTop: 4,
  },
  dateFilterContainer: {
    padding: 16,
    paddingTop: 0,
  },
  dateFilterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateFilterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  dateFilterText: {
    fontWeight: '600',
  },
  calendarCard: {
    margin: 16,
    padding: 16,
  },
  calendarContainer: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarMonth: {
    fontWeight: '700',
  },
  calendarWeekdays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  calendarWeekday: {
    width: '14%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  calendarDays: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    margin: '0.5%',
    position: 'relative',
  },
  calendarDayText: {
    fontSize: 14,
  },
  attendanceDot: {
    position: 'absolute',
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tableContainer: {
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  tableCell: {
    paddingHorizontal: 4,
    justifyContent: 'center',
  },
  tableCellText: {
    fontSize: 14,
  },
  tableCellSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  paginationContainer: {
    padding: 16,
    borderTopWidth: 1,
    gap: 16,
  },
  paginationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  paginationText: {
    fontSize: 12,
  },
  recordsPerPageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordsPerPageLabel: {
    fontSize: 12,
  },
  recordsPerPageButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  recordsPerPageButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
  recordsPerPageButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  paginationControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  paginationButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageNumber: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 100,
    textAlign: 'center',
  },
  seatsContainer: {
    padding: 16,
  },
  seatsGrid: {
    gap: 12,
  },
  seat: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    margin: '1.5%',
  },
  seatNumber: {
    fontWeight: '600',
  },
  attendanceRecordsContainer: {
    padding: 16,
  },
  summaryCard: {
    marginBottom: 16,
    padding: 20,
  },
  summaryTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    marginBottom: 4,
    fontWeight: '700',
  },
  summaryLabel: {
    fontSize: 12,
  },
  recordsList: {
    marginTop: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '700',
  },
  recordCard: {
    marginBottom: 12,
    padding: 16,
  },
  recordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  recordInfo: {
    flex: 1,
    marginRight: 12,
  },
  recordName: {
    marginBottom: 4,
    fontWeight: '600',
  },
  recordEmail: {
    marginBottom: 8,
  },
  recordDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
  },
  recordDetail: {
    marginRight: 8,
  },
  recordActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
});
