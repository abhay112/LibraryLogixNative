import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Theme } from './Theme';

export const createScreenStyles = (theme: Theme) => StyleSheet.create({
  // Container patterns
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  } as ViewStyle,
  
  content: {
    flex: 1,
  } as ViewStyle,
  
  scrollContent: {
    padding: 16,
  } as ViewStyle,
  
  // Header patterns
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  } as ViewStyle,
  
  headerTitle: {
    fontWeight: '700',
    fontSize: 20,
    color: theme.colors.textPrimary,
  } as TextStyle,
  
  // Search patterns
  searchContainer: {
    padding: 16,
  } as ViewStyle,
  
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    gap: 8,
  } as ViewStyle,
  
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.textPrimary,
  } as TextStyle,
  
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  
  // List item patterns
  list: {
    padding: 16,
    paddingTop: 0,
  } as ViewStyle,
  
  listItemCard: {
    marginBottom: 12,
    padding: 16,
  } as ViewStyle,
  
  listItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  } as ViewStyle,
  
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
  } as TextStyle,
  
  itemInfo: {
    flex: 1,
  } as ViewStyle,
  
  itemName: {
    marginBottom: 4,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  } as TextStyle,
  
  itemEmail: {
    marginBottom: 2,
    color: theme.colors.textSecondary,
  } as TextStyle,
  
  itemMobile: {
    marginTop: 2,
    color: theme.colors.textSecondary,
  } as TextStyle,
  
  // Filter patterns
  filters: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
    gap: 8,
  } as ViewStyle,
  
  filterButtonBase: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  } as ViewStyle,
  
  filterText: {
    fontSize: 12,
    fontWeight: '600',
  } as TextStyle,
  
  // Card patterns
  card: {
    marginBottom: 16,
    padding: 20,
  } as ViewStyle,
  
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
    fontSize: 18,
    color: theme.colors.textPrimary,
  } as TextStyle,
  
  // Stats patterns
  statsCard: {
    margin: 16,
    padding: 20,
  } as ViewStyle,
  
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  } as ViewStyle,
  
  statBox: {
    alignItems: 'center',
  } as ViewStyle,
  
  statNumber: {
    marginBottom: 4,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  } as TextStyle,
  
  statLabel: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
  } as TextStyle,
  
  // Section patterns
  section: {
    padding: 16,
  } as ViewStyle,
  
  // Empty state
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  } as ViewStyle,
  
  emptyText: {
    marginTop: 16,
    color: theme.colors.textSecondary,
  } as TextStyle,
  
  // Footer patterns
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  } as ViewStyle,
  
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,
});

