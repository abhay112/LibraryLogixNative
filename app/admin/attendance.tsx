import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardHeader } from '@/components/DashboardHeader';
import { formatRole } from '@/utils/format';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format, subDays, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, getDay } from 'date-fns';
import {
  useGetAttendanceByDateQuery,
  useGetAttendanceByShiftQuery,
  useGetAllAttendanceQuery,
  useMarkStudentAbsentMutation,
  useMarkMultipleStudentsAbsentMutation,
} from '@/services/api/attendanceApi';

export default function AttendanceScreen() {
  const { theme } = useTheme();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedDateObj, setSelectedDateObj] = useState<Date>(today);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showAllAttendance, setShowAllAttendance] = useState(false);
  const [selectedShift, setSelectedShift] = useState<'MORNING' | 'AFTERNOON' | 'EVENING' | 'FULL_DAY' | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'seats' | 'report'>('seats');

  // Fetch all attendance records
  const {
    data: allAttendanceData,
    isLoading: isLoadingAllAttendance,
    error: allAttendanceError,
    refetch: refetchAllAttendance,
  } = useGetAllAttendanceQuery(
    user?._id || user?.id || '',
    { skip: (!user?._id && !user?.id) || !showAllAttendance || authLoading }
  );

  // Extract attendance records from the nested structure
  const attendanceDayRecords = allAttendanceData?.data?.attendanceRecords || [];
  
  // Flatten all individual attendance records for calendar display
  const allAttendanceRecords = attendanceDayRecords.flatMap(dayRecord => 
    dayRecord.attendanceRecords.map(record => ({
      ...record,
      date: dayRecord.date, // Add date from parent record
    }))
  );
  
  // Update calendar when all attendance is loaded
  React.useEffect(() => {
    if (showAllAttendance && attendanceDayRecords.length > 0) {
      // Calendar will automatically update with the new data
    }
  }, [showAllAttendance, attendanceDayRecords]);

  // Fetch attendance data for selected date
  const {
    data: attendanceData,
    isLoading: attendanceLoading,
    error: attendanceError,
    refetch: refetchAttendance,
  } = useGetAttendanceByDateQuery(
    {
      date: selectedDate,
      adminId: user?._id || user?.id || '',
      libraryId: user?.libraryId || '',
    },
    { skip: (!user?._id && !user?.id) || !user?.libraryId || showAllAttendance || authLoading }
  );

  // Fetch attendance by shift
  const {
    data: attendanceByShiftData,
    isLoading: shiftLoading,
    refetch: refetchShiftAttendance,
  } = useGetAttendanceByShiftQuery(
    {
      adminId: user?._id || user?.id || '',
      libraryId: user?.libraryId || '',
      date: selectedDate,
      shift: selectedShift,
    },
    { skip: (!user?._id && !user?.id) || !user?.libraryId || viewMode !== 'report' || showAllAttendance || authLoading }
  );


  const handleDateChange = (text: string) => {
    // Basic validation for YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(text) || text === '') {
      setSelectedDate(text);
    }
  };

  const handleShowAllAttendance = () => {
    setShowAllAttendance(true);
    // Query will automatically start when showAllAttendance becomes true
    // No need to manually refetch as the skip condition will change
  };

  const handleShowDateFilter = () => {
    setShowAllAttendance(false);
  };

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

    // Get attendance dates for highlighting - extract unique dates from records
    const attendanceDates = Array.from(
      new Set(
        allAttendanceRecords
          .map(record => record.date || record.attendanceDate || record.createdAt)
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

  const [markAbsent] = useMarkStudentAbsentMutation();
  const [markMultipleAbsent] = useMarkMultipleStudentsAbsentMutation();
  const [selectedStudentsForAbsent, setSelectedStudentsForAbsent] = useState<string[]>([]);

  // Extract data from response - handle both seats array and attendanceRecords
  const seats = attendanceData?.data?.seats || [];
  const attendance = attendanceData?.data?.attendance;
  const attendanceRecords = attendanceData?.data?.attendanceRecords || [];
  const seatLayout = attendanceData?.data?.seatLayout;
  const shiftReport = attendanceByShiftData?.data;
  
  // Debug: Log attendance data
  React.useEffect(() => {
    if (attendanceData) {
      console.log('📊 Attendance Data:', {
        hasAttendance: !!attendance,
        hasSeats: !!seats,
        seatsCount: seats.length,
        hasAttendanceRecords: !!attendanceRecords,
        attendanceRecordsCount: attendanceRecords.length,
        attendance: attendance,
        fullResponse: attendanceData,
      });
    }
  }, [attendanceData, attendance, seats, attendanceRecords]);

  const handleMarkAbsent = async (studentId: string, date: string = selectedDate, shift: string = 'FULL_DAY') => {
    if (!user?._id && !user?.id || !user?.libraryId) {
      Alert.alert('Error', 'User information is missing');
      return;
    }

    try {
      await markAbsent({
        studentId,
        date,
        shift: shift as 'MORNING' | 'AFTERNOON' | 'EVENING' | 'FULL_DAY',
        adminId: user._id || user.id || '',
      }).unwrap();
      Alert.alert('Success', 'Student marked as absent');
      refetchAttendance();
      if (viewMode === 'report') {
        refetchShiftAttendance();
      }
    } catch (error: any) {
      Alert.alert('Error', error?.data?.message || 'Failed to mark student as absent');
    }
  };

  const handleMarkMultipleAbsent = async () => {
    if (selectedStudentsForAbsent.length === 0) {
      Alert.alert('Error', 'Please select at least one student');
      return;
    }

    if (!user?._id && !user?.id || !user?.libraryId) {
      Alert.alert('Error', 'User information is missing');
      return;
    }

    try {
      await markMultipleAbsent({
        studentIds: selectedStudentsForAbsent,
        date: selectedDate,
        libraryId: user.libraryId,
        adminId: user._id || user.id || '',
      }).unwrap();
      Alert.alert('Success', `${selectedStudentsForAbsent.length} student(s) marked as absent`);
      setSelectedStudentsForAbsent([]);
      refetchAttendance();
      if (viewMode === 'report') {
        refetchShiftAttendance();
      }
    } catch (error: any) {
      Alert.alert('Error', error?.data?.message || 'Failed to mark students as absent');
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudentsForAbsent((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

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
        onPress={() => router.push('/attendance/mark')}
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
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => setViewMode(viewMode === 'seats' ? 'report' : 'seats')}
            style={styles.viewModeButton}
          >
            <Icon
              name={viewMode === 'seats' ? 'list' : 'event-seat'}
              size={24}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/attendance/mark')}>
            <Icon name="add-circle" size={28} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === 'report' && (
        <View style={styles.shiftFilters}>
          {(['MORNING', 'AFTERNOON', 'EVENING', 'FULL_DAY'] as const).map((shift) => (
            <TouchableOpacity
              key={shift}
              style={[
                styles.shiftButton,
                {
                  backgroundColor: selectedShift === shift ? theme.colors.primary : theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => setSelectedShift(selectedShift === shift ? undefined : shift)}
            >
              <Text
                style={[
                  styles.shiftButtonText,
                  {
                    color: selectedShift === shift ? '#FFFFFF' : theme.colors.textPrimary,
                    ...theme.typography.body,
                  },
                ]}
              >
                {shift}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView style={styles.content}>
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={[styles.statusIndicator, { backgroundColor: theme.colors.success + '20' }]}>
              <Icon name="check-circle" size={24} color={theme.colors.success} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: theme.colors.textPrimary, ...theme.typography.bodyLarge }]}>
                {showAllAttendance ? 'All Attendance' : format(new Date(selectedDate), 'EEEE, MMMM dd, yyyy')}
              </Text>
              <Text style={[styles.infoText, { color: theme.colors.textSecondary, ...theme.typography.body }]}>
                {showAllAttendance ? 'Showing all attendance records' : `Selected: ${format(new Date(selectedDate), 'MMM dd, yyyy')}`}
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
                setShowDatePicker(false);
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
              onPress={showAllAttendance ? handleShowDateFilter : handleShowAllAttendance}
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

        {/* Text Date Picker (Fallback) */}
        {showDatePicker && Platform.OS === 'android' && (
          <View style={styles.datePickerContainer}>
            <Text style={[styles.datePickerLabel, { color: theme.colors.textSecondary }]}>
              Select Date (YYYY-MM-DD):
            </Text>
            <TextInput
              style={[
                styles.dateInput,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  color: theme.colors.textPrimary,
                },
              ]}
              value={selectedDate}
              onChangeText={(text) => {
                // Basic validation for YYYY-MM-DD format
                if (/^\d{4}-\d{2}-\d{2}$/.test(text) || text === '') {
                  setSelectedDate(text);
                }
              }}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.colors.textSecondary}
            />
            <Button
              title="Apply"
              onPress={() => {
                if (selectedDate && /^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
                  setShowDatePicker(false);
                  setShowAllAttendance(false);
                  setSelectedDateObj(new Date(selectedDate));
                } else {
                  Alert.alert('Invalid Date', 'Please enter a valid date in YYYY-MM-DD format');
                }
              }}
              variant="primary"
              size="small"
              style={styles.applyDateButton}
            />
          </View>
        )}

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: theme.colors.success }]} />
            <Text style={[styles.legendText, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
              Available
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: theme.colors.error }]} />
            <Text style={[styles.legendText, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
              Occupied
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: theme.colors.warning }]} />
            <Text style={[styles.legendText, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
              Fixed
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: theme.colors.textSecondary }]} />
            <Text style={[styles.legendText, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
              Blocked
            </Text>
          </View>
        </View>

        {showAllAttendance ? (
          <Card style={styles.allAttendanceCard}>
            <View style={styles.allAttendanceHeader}>
              <Text style={[styles.allAttendanceTitle, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
                All Attendance Records ({attendanceDayRecords.length} days)
              </Text>
            </View>
            {isLoadingAllAttendance ? (
              <LoadingSpinner />
            ) : allAttendanceError ? (
              <EmptyState
                icon="error-outline"
                title="Error loading attendance"
                message="Please try again later"
              />
            ) : attendanceDayRecords.length > 0 ? (
              <FlatList
                data={attendanceDayRecords}
                renderItem={({ item: dayRecord }) => {
                  const recordDate = dayRecord.date;
                  let dateStr = 'N/A';
                  let formattedDate = 'Date N/A';
                  
                  try {
                    if (recordDate) {
                      dateStr = typeof recordDate === 'string' ? recordDate : format(new Date(recordDate), 'yyyy-MM-dd');
                      formattedDate = format(new Date(dateStr), 'MMM dd, yyyy');
                    }
                  } catch (err) {
                    console.error('Error parsing date:', err);
                  }
                  
                  return (
                    <Card style={styles.attendanceRecordCard}>
                      <View style={styles.attendanceRecordRow}>
                        <View style={styles.attendanceRecordInfo}>
                          <Text style={[styles.attendanceRecordDate, { color: theme.colors.textPrimary, ...theme.typography.bodyLarge }]}>
                            {formattedDate}
                          </Text>
                          <Text style={[styles.attendanceRecordStatus, { color: theme.colors.textSecondary, ...theme.typography.body }]}>
                            Present: {dayRecord.totalPresent} | Absent: {dayRecord.totalAbsent}
                          </Text>
                            <Text style={[styles.attendanceRecordShift, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                            Morning: {dayRecord.morningPresent} | Afternoon: {dayRecord.afternoonPresent} | Evening: {dayRecord.eveningPresent} | Full Day: {dayRecord.fullDayPresent}
                            </Text>
                            <Text style={[styles.attendanceRecordShift, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                            Total Records: {dayRecord.attendanceRecords.length}
                            </Text>
                        </View>
                        <Badge
                          label={`${dayRecord.totalPresent}/${dayRecord.totalPresent + dayRecord.totalAbsent}`}
                          variant={dayRecord.totalAbsent === 0 ? 'success' : 'warning'}
                        />
                      </View>
                      {/* Show individual student records */}
                      {dayRecord.attendanceRecords.length > 0 && (
                        <View style={styles.studentRecordsContainer}>
                          {dayRecord.attendanceRecords.slice(0, 3).map((record) => (
                            <View key={record._id} style={styles.studentRecordItem}>
                              <Text style={[styles.studentRecordName, { color: theme.colors.textPrimary, ...theme.typography.caption }]}>
                                {record.studentId?.name || 'Unknown'} - {record.shift} - {record.status}
                              </Text>
                            </View>
                          ))}
                          {dayRecord.attendanceRecords.length > 3 && (
                            <Text style={[styles.moreRecordsText, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                              +{dayRecord.attendanceRecords.length - 3} more
                            </Text>
                          )}
                        </View>
                      )}
                    </Card>
                  );
                }}
                keyExtractor={(item) => item._id || item.date}
                scrollEnabled={false}
              />
            ) : (
              <EmptyState
                icon="event"
                title="No attendance records"
                message="No attendance records found for the selected period"
              />
            )}
            <Button
              title="Filter by Date"
              onPress={() => {
                setShowCalendar(true);
                setShowAllAttendance(false);
              }}
              variant="primary"
              style={styles.selectDateButton}
            />
          </Card>
        ) : viewMode === 'seats' ? (
          attendanceLoading ? (
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
                            {item.status === 'PRESENT' && (
                              <Button
                                title="Mark Absent"
                                onPress={() => handleMarkAbsent(actualStudentId, selectedDate, item.shift)}
                                variant="outline"
                                size="small"
                                style={styles.markAbsentButton}
                              />
                            )}
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
          )
        ) : (
          shiftLoading ? (
            <LoadingSpinner />
          ) : shiftReport ? (
            <>
              {shiftReport.summary && (
                <Card style={styles.summaryCard}>
                  <View style={styles.summaryHeader}>
                    <Text style={[styles.summaryTitle, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
                      Summary
                    </Text>
                    {selectedStudentsForAbsent.length > 0 && (
                      <Button
                        title={`Mark ${selectedStudentsForAbsent.length} Absent`}
                        onPress={handleMarkMultipleAbsent}
                        variant="error"
                        size="small"
                      />
                    )}
                  </View>
                  <View style={styles.summaryGrid}>
                    <View style={styles.summaryItem}>
                      <Text style={[styles.summaryValue, { color: theme.colors.primary, ...theme.typography.h2 }]}>
                        {shiftReport.summary.totalStudents}
                      </Text>
                      <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Total</Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={[styles.summaryValue, { color: theme.colors.success, ...theme.typography.h2 }]}>
                        {shiftReport.summary.present}
                      </Text>
                      <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Present</Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={[styles.summaryValue, { color: theme.colors.error, ...theme.typography.h2 }]}>
                        {shiftReport.summary.absent}
                      </Text>
                      <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Absent</Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={[styles.summaryValue, { color: theme.colors.warning, ...theme.typography.h2 }]}>
                        {shiftReport.summary.late}
                      </Text>
                      <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Late</Text>
                    </View>
                  </View>
                </Card>
              )}
              <FlatList
                data={shiftReport.students}
                renderItem={({ item }) => {
                  const isSelected = selectedStudentsForAbsent.includes(item.studentId);
                  return (
                    <Card style={[styles.studentCard, isSelected && { borderColor: theme.colors.error, borderWidth: 2 }]}>
                      <View style={styles.studentRow}>
                        <TouchableOpacity
                          style={styles.studentInfo}
                          onPress={() => toggleStudentSelection(item.studentId)}
                        >
                          <Text style={[styles.studentName, { color: theme.colors.textPrimary, ...theme.typography.bodyLarge }]}>
                            {item.studentName}
                          </Text>
                          <Text style={[styles.studentEmail, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                            {item.studentEmail}
                          </Text>
                          {item.checkInTime && (
                            <Text style={[styles.checkInTime, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                              Check-in: {format(new Date(item.checkInTime), 'HH:mm')}
                            </Text>
                          )}
                        </TouchableOpacity>
                        <View style={styles.studentActions}>
                          <Badge
                            label={item.status}
                            variant={
                              item.status === 'PRESENT' ? 'success' :
                              item.status === 'ABSENT' ? 'error' :
                              item.status === 'LATE' ? 'warning' : 'info'
                            }
                          />
                          {item.status === 'PRESENT' && (
                            <Button
                              title="Mark Absent"
                              onPress={() => {
                                const studentId = typeof item.studentId === 'object' ? item.studentId?._id : item.studentId;
                                handleMarkAbsent(studentId || '', selectedDate, item.shift);
                              }}
                              variant="outline"
                              size="small"
                              style={styles.markAbsentButton}
                            />
                          )}
                        </View>
                      </View>
                    </Card>
                  );
                }}
                keyExtractor={(item) => item.studentId}
                contentContainerStyle={styles.reportList}
                ListEmptyComponent={
                  <EmptyState
                    icon="people"
                    title="No students found"
                    message="No students match the selected shift"
                  />
                }
              />
            </>
          ) : (
            <EmptyState
              icon="list"
              title="No attendance data"
              message="Select a shift to view attendance report"
            />
          )
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
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendText: {
    fontWeight: '500',
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
  headerActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  viewModeButton: {
    padding: 4,
  },
  shiftFilters: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  shiftButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  shiftButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  summaryCard: {
    margin: 16,
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
  reportList: {
    padding: 16,
    paddingTop: 0,
  },
  studentCard: {
    marginBottom: 12,
    padding: 16,
  },
  studentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    marginBottom: 4,
    fontWeight: '600',
  },
  studentEmail: {
    marginTop: 2,
  },
  checkInTime: {
    marginTop: 4,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  studentActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  markAbsentButton: {
    minWidth: 100,
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
  allAttendanceCard: {
    margin: 16,
    padding: 20,
    alignItems: 'center',
  },
  allAttendanceText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  selectDateButton: {
    minWidth: 150,
  },
  datePickerContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  datePickerLabel: {
    marginBottom: 8,
    fontSize: 14,
  },
  dateInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    fontSize: 16,
  },
  applyDateButton: {
    width: '100%',
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
  allAttendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  allAttendanceTitle: {
    fontWeight: '700',
  },
  attendanceRecordCard: {
    marginBottom: 12,
    padding: 16,
  },
  attendanceRecordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attendanceRecordInfo: {
    flex: 1,
  },
  attendanceRecordDate: {
    marginBottom: 4,
    fontWeight: '600',
  },
  attendanceRecordStatus: {
    marginBottom: 2,
  },
  attendanceRecordShift: {
    marginTop: 2,
  },
  studentRecordsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  studentRecordItem: {
    marginBottom: 4,
  },
  studentRecordName: {
    fontSize: 12,
  },
  moreRecordsText: {
    marginTop: 4,
    fontStyle: 'italic',
  },
  attendanceRecordsContainer: {
    padding: 16,
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

